/**
 * SelectorMemory — Permanent Skill Memory for Discovered Selectors
 *
 * Hermes-inspired upgrade: When AI discovers a new CSS selector for a portal,
 * it is persisted in sites.json AND a skill memory file so that the next run
 * never needs to call the LLM again for the same field.
 *
 * Flow:
 *   1. BaseBot.fillForm() calls discoverSelectorsWithAI()
 *   2. If discovery succeeds AND the selector actually works (element found + filled),
 *      SelectorMemory.commitVerifiedSelectors() is called.
 *   3. Verified selectors are written to:
 *      a) data/knowledge/selector_skills.json  (fast lookup)
 *      b) config/sites.json                    (permanent config update)
 *   4. Next run reads sites.json first → no AI call needed.
 *
 * Self-Healing:
 *   - If a previously-saved selector fails at runtime, it is marked "deprecated"
 *     and the AI rediscovery is triggered again.
 */

const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class SelectorMemory {
  constructor() {
    this.skillsFile = path.join(process.cwd(), 'data', 'knowledge', 'selector_skills.json');
    this.sitesConfigFile = path.join(process.cwd(), 'config', 'sites.json');
    this._ensureFiles();
  }

  _ensureFiles() {
    const dir = path.dirname(this.skillsFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.skillsFile)) {
      fs.writeFileSync(this.skillsFile, JSON.stringify({ skills: [], meta: { version: '1.0', createdAt: new Date().toISOString() } }, null, 2));
    }
  }

  /**
   * Load all skill entries from the skills file
   */
  async loadSkills() {
    try {
      const raw = await fsPromises.readFile(this.skillsFile, 'utf8');
      return JSON.parse(raw);
    } catch {
      return { skills: [], meta: { version: '1.0' } };
    }
  }

  /**
   * Check if a verified selector already exists for a given (siteId, fieldName)
   * Returns the stored selector string or null.
   */
  async getVerifiedSelector(siteId, fieldName) {
    const data = await this.loadSkills();
    const match = data.skills.find(
      s => s.siteId === siteId && s.fieldName === fieldName && s.status === 'verified'
    );
    return match ? match.selector : null;
  }

  /**
   * Get all verified selectors for a site (map fieldName → selector)
   */
  async getVerifiedSelectorsForSite(siteId) {
    const data = await this.loadSkills();
    const map = {};
    data.skills
      .filter(s => s.siteId === siteId && s.status === 'verified')
      .forEach(s => { map[s.fieldName] = s.selector; });
    return map;
  }

  /**
   * Commit selectors that were discovered by AI AND verified (element was found + filled).
   *
   * @param {string}   siteId          — e.g. "ssc"
   * @param {string}   pageUrl         — full URL where selectors were discovered
   * @param {Object}   verifiedMap     — { fieldName: cssSelector, ... }  (only filled-successfully entries)
   * @param {number}   confidenceScore — 0-100 (set by caller based on how many fields were filled)
   */
  async commitVerifiedSelectors(siteId, pageUrl, verifiedMap, confidenceScore = 90) {
    if (!verifiedMap || Object.keys(verifiedMap).length === 0) return;

    // Minimum confidence gate — avoid saving garbage selectors
    if (confidenceScore < 70) {
      console.log(`[SelectorMemory] ⚠️ Confidence ${confidenceScore}% too low for site "${siteId}" — skipping save`);
      return;
    }

    const data = await this.loadSkills();
    const now = new Date().toISOString();
    let newCount = 0;
    let updatedCount = 0;

    for (const [fieldName, selector] of Object.entries(verifiedMap)) {
      const existing = data.skills.find(
        s => s.siteId === siteId && s.fieldName === fieldName
      );

      if (existing) {
        // Update existing
        if (existing.selector !== selector || existing.status !== 'verified') {
          existing.selector = selector;
          existing.status = 'verified';
          existing.confidence = confidenceScore;
          existing.lastVerifiedAt = now;
          existing.verifyCount = (existing.verifyCount || 0) + 1;
          existing.pageUrl = pageUrl;
          updatedCount++;
        }
      } else {
        // New skill
        data.skills.push({
          id: crypto.randomUUID(),
          siteId,
          fieldName,
          selector,
          status: 'verified',
          confidence: confidenceScore,
          discoveredAt: now,
          lastVerifiedAt: now,
          verifyCount: 1,
          pageUrl,
          deprecatedAt: null,
          failCount: 0
        });
        newCount++;
      }
    }

    // Save skills file
    await fsPromises.writeFile(this.skillsFile, JSON.stringify(data, null, 2));
    console.log(`[SelectorMemory] 💾 Saved ${newCount} new + ${updatedCount} updated selectors for "${siteId}"`);

    // Also update config/sites.json so it persists across deploys
    await this._updateSitesConfig(siteId, verifiedMap);
  }

  /**
   * Mark a selector as deprecated (it failed at runtime).
   * After 3 consecutive failures, it is removed entirely.
   */
  async markFailed(siteId, fieldName) {
    const data = await this.loadSkills();
    const entry = data.skills.find(
      s => s.siteId === siteId && s.fieldName === fieldName
    );

    if (!entry) return;

    entry.failCount = (entry.failCount || 0) + 1;
    entry.lastFailedAt = new Date().toISOString();

    if (entry.failCount >= 3) {
      entry.status = 'deprecated';
      entry.deprecatedAt = new Date().toISOString();
      console.log(`[SelectorMemory] 🗑️ Deprecated selector "${fieldName}" for "${siteId}" after ${entry.failCount} failures`);
    } else {
      console.log(`[SelectorMemory] ⚠️ Fail #${entry.failCount} for "${fieldName}" on "${siteId}"`);
    }

    await fsPromises.writeFile(this.skillsFile, JSON.stringify(data, null, 2));
  }

  /**
   * Update config/sites.json with newly discovered selectors (non-destructive merge)
   */
  async _updateSitesConfig(siteId, verifiedMap) {
    try {
      const raw = await fsPromises.readFile(this.sitesConfigFile, 'utf8');
      const config = JSON.parse(raw);
      const site = config.sites.find(s => s.id === siteId);

      if (!site) {
        console.log(`[SelectorMemory] Site "${siteId}" not found in sites.json — skipping config update`);
        return;
      }

      let configUpdated = false;
      for (const [fieldName, selector] of Object.entries(verifiedMap)) {
        // Only add if the field doesn't already have a selector in config
        // OR if the config selector is a generic placeholder
        const existingSelector = site.fieldSelectors[fieldName];
        const isPlaceholder = !existingSelector ||
          existingSelector.includes("input[name='candidateName']") && fieldName !== 'fullName';

        if (!existingSelector || isPlaceholder) {
          site.fieldSelectors[fieldName] = selector;
          configUpdated = true;
        }
      }

      if (configUpdated) {
        // Backup original before writing
        const backupPath = this.sitesConfigFile + `.backup.${Date.now()}`;
        await fsPromises.copyFile(this.sitesConfigFile, backupPath);
        await fsPromises.writeFile(this.sitesConfigFile, JSON.stringify(config, null, 2));
        console.log(`[SelectorMemory] 📝 Updated sites.json for "${siteId}" (backup: ${path.basename(backupPath)})`);
      }
    } catch (error) {
      console.error(`[SelectorMemory] ❌ Failed to update sites.json:`, error.message);
    }
  }

  /**
   * Get memory statistics
   */
  async getStats() {
    const data = await this.loadSkills();
    const verified = data.skills.filter(s => s.status === 'verified').length;
    const deprecated = data.skills.filter(s => s.status === 'deprecated').length;
    const sites = [...new Set(data.skills.map(s => s.siteId))];
    return {
      totalSkills: data.skills.length,
      verified,
      deprecated,
      sitesLearned: sites.length,
      siteList: sites
    };
  }
}

module.exports = { SelectorMemory };
