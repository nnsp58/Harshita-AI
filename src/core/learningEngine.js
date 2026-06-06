/**
 * LearningEngine — Centralized Self-Learning System for all Harshita AI skills
 *
 * Har skill yeh use kar sakti hai apne aap ko improve karne ke liye:
 *   - Failed queries track karta hai
 *   - Successful patterns yaad rakhta hai
 *   - Naye keywords/intents auto-detect karta hai
 *   - User feedback se sikhta hai
 *   - Periodic analysis se patterns nikalta hai
 *
 * Storage: data/learning/ folder mein JSON files
 *   - interactions.json — Sabhi user interactions
 *   - patterns.json — Discovered patterns per skill
 *   - feedback.json — User feedback (thumbs up/down)
 *   - keywords.json — Auto-learned keywords per skill
 */

const fs = require('fs');
const path = require('path');

const LEARNING_DIR = path.join(__dirname, '../../data/learning');

// Ensure directory exists
if (!fs.existsSync(LEARNING_DIR)) {
  fs.mkdirSync(LEARNING_DIR, { recursive: true });
}

const FILES = {
  interactions: path.join(LEARNING_DIR, 'interactions.json'),
  patterns: path.join(LEARNING_DIR, 'patterns.json'),
  feedback: path.join(LEARNING_DIR, 'feedback.json'),
  keywords: path.join(LEARNING_DIR, 'keywords.json'),
  failures: path.join(LEARNING_DIR, 'failures.json'),
};

class LearningEngine {
  constructor() {
    this.cache = {
      patterns: this._load(FILES.patterns, {}),
      feedback: this._load(FILES.feedback, []),
      keywords: this._load(FILES.keywords, {}),
      failures: this._load(FILES.failures, []),
    };
    this.saveQueue = false;
    console.log('🧠 LearningEngine initialized — Self-Learning Active');
  }

  _load(file, defaultValue) {
    try {
      if (fs.existsSync(file)) {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
      }
    } catch (e) {
      console.warn(`[LearningEngine] Failed to load ${file}:`, e.message);
    }
    return defaultValue;
  }

  _save(file, data) {
    try {
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
    } catch (e) {
      console.warn(`[LearningEngine] Failed to save ${file}:`, e.message);
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  LEARN: Track every interaction
  // ═══════════════════════════════════════════════════════════
  learn(skill, userId, input, response, success = true) {
    const interaction = {
      id: `${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId,
      skill,
      input,
      output: response?.message?.substring(0, 200) || '',
      success,
      timestamp: new Date().toISOString(),
    };

    // Save to interactions.json (append-only log)
    try {
      const existing = this._load(FILES.interactions, []);
      existing.push(interaction);
      // Keep last 5000 interactions
      const trimmed = existing.slice(-5000);
      this._save(FILES.interactions, trimmed);
    } catch (e) {
      console.warn('[LearningEngine] learn failed:', e.message);
    }

    // Auto-extract keywords from successful interactions
    if (success && skill && input) {
      this._extractKeywords(skill, input);
    }

    // Track failures for pattern analysis
    if (!success) {
      this._trackFailure(skill, input, response);
    }

    return interaction.id;
  }

  // ═══════════════════════════════════════════════════════════
  //  KEYWORD EXTRACTION: Auto-learn keywords from inputs
  // ═══════════════════════════════════════════════════════════
  _extractKeywords(skill, input) {
    if (!this.cache.keywords[skill]) {
      this.cache.keywords[skill] = { learned: {}, count: 0 };
    }

    // Extract meaningful words (>2 chars, not common words)
    const stopWords = new Set([
      'the', 'is', 'at', 'to', 'in', 'on', 'for', 'with', 'by', 'a', 'an',
      'मैं', 'हूँ', 'है', 'का', 'की', 'के', 'को', 'में', 'से', 'पर',
      'me', 'mein', 'hai', 'ka', 'ki', 'ke', 'ko', 'se', 'kya', 'kar', 'karo',
      'और', 'aur', 'या', 'ya', 'this', 'that', 'i', 'you', 'we', 'it',
    ]);

    const words = input.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
    for (const word of words) {
      this.cache.keywords[skill].learned[word] = (this.cache.keywords[skill].learned[word] || 0) + 1;
    }
    this.cache.keywords[skill].count++;
    this._scheduleSave();
  }

  // Get top learned keywords for a skill
  getLearnedKeywords(skill, minOccurrence = 3) {
    const data = this.cache.keywords[skill];
    if (!data) return [];
    return Object.entries(data.learned)
      .filter(([_, count]) => count >= minOccurrence)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([word]) => word);
  }

  // ═══════════════════════════════════════════════════════════
  //  FAILURE TRACKING: Learn from what didn't work
  // ═══════════════════════════════════════════════════════════
  _trackFailure(skill, input, response) {
    this.cache.failures.push({
      skill,
      input: input.substring(0, 200),
      reason: response?.message?.substring(0, 200) || 'unknown',
      timestamp: new Date().toISOString(),
    });
    // Keep last 1000 failures
    if (this.cache.failures.length > 1000) {
      this.cache.failures = this.cache.failures.slice(-1000);
    }
    this._scheduleSave();
  }

  // Get common failure patterns (for review)
  getFailurePatterns(skill = null, limit = 20) {
    const failures = skill
      ? this.cache.failures.filter(f => f.skill === skill)
      : this.cache.failures;

    // Group by similar inputs (first 30 chars)
    const grouped = {};
    for (const f of failures) {
      const key = f.input.substring(0, 30).toLowerCase();
      if (!grouped[key]) grouped[key] = { example: f.input, count: 0, skill: f.skill };
      grouped[key].count++;
    }

    return Object.values(grouped)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // ═══════════════════════════════════════════════════════════
  //  USER FEEDBACK: thumbs up/down
  // ═══════════════════════════════════════════════════════════
  recordFeedback(interactionId, rating, comment = '') {
    this.cache.feedback.push({
      interactionId,
      rating, // 'positive' | 'negative' | numeric 1-5
      comment,
      timestamp: new Date().toISOString(),
    });
    // Keep last 2000 feedbacks
    if (this.cache.feedback.length > 2000) {
      this.cache.feedback = this.cache.feedback.slice(-2000);
    }
    this._scheduleSave();
  }

  // ═══════════════════════════════════════════════════════════
  //  PATTERN DISCOVERY: Find common Q→A mappings
  // ═══════════════════════════════════════════════════════════
  // When user asks similar questions repeatedly, learn the pattern
  recordPattern(skill, inputPattern, response) {
    if (!this.cache.patterns[skill]) {
      this.cache.patterns[skill] = [];
    }
    // Check if pattern exists
    const existing = this.cache.patterns[skill].find(p =>
      p.pattern.toLowerCase() === inputPattern.toLowerCase()
    );
    if (existing) {
      existing.count++;
      existing.lastSeen = new Date().toISOString();
    } else {
      this.cache.patterns[skill].push({
        pattern: inputPattern,
        response: response.substring(0, 500),
        count: 1,
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
      });
    }
    this._scheduleSave();
  }

  // Find similar past patterns (for AI to learn from)
  findSimilarPatterns(skill, input, limit = 5) {
    const patterns = this.cache.patterns[skill] || [];
    const inputLower = input.toLowerCase();
    return patterns
      .map(p => ({
        ...p,
        similarity: this._textSimilarity(inputLower, p.pattern.toLowerCase()),
      }))
      .filter(p => p.similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  // Simple word overlap similarity
  _textSimilarity(a, b) {
    const wordsA = new Set(a.split(/\s+/));
    const wordsB = new Set(b.split(/\s+/));
    const intersection = [...wordsA].filter(w => wordsB.has(w)).length;
    const union = new Set([...wordsA, ...wordsB]).size;
    return union > 0 ? intersection / union : 0;
  }

  // ═══════════════════════════════════════════════════════════
  //  STATISTICS: Get insights for dashboard
  // ═══════════════════════════════════════════════════════════
  getStats() {
    const interactions = this._load(FILES.interactions, []);
    const successRate = interactions.length > 0
      ? (interactions.filter(i => i.success).length / interactions.length * 100).toFixed(1)
      : 0;

    const skillUsage = {};
    for (const i of interactions) {
      skillUsage[i.skill] = (skillUsage[i.skill] || 0) + 1;
    }

    return {
      totalInteractions: interactions.length,
      totalFeedback: this.cache.feedback.length,
      totalFailures: this.cache.failures.length,
      successRate: parseFloat(successRate),
      skillsLearned: Object.keys(this.cache.keywords).length,
      patternsDiscovered: Object.values(this.cache.patterns).reduce((s, arr) => s + arr.length, 0),
      topSkills: Object.entries(skillUsage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([skill, count]) => ({ skill, count })),
    };
  }

  // Get insights for a specific skill
  getSkillInsights(skill) {
    const interactions = this._load(FILES.interactions, [])
      .filter(i => i.skill === skill);

    return {
      skill,
      totalUses: interactions.length,
      successRate: interactions.length > 0
        ? (interactions.filter(i => i.success).length / interactions.length * 100).toFixed(1)
        : 0,
      learnedKeywords: this.getLearnedKeywords(skill),
      patterns: (this.cache.patterns[skill] || []).slice(0, 10),
      failures: this.getFailurePatterns(skill, 10),
      lastUsed: interactions.length > 0 ? interactions[interactions.length - 1].timestamp : null,
    };
  }

  // ═══════════════════════════════════════════════════════════
  //  SAVE: Throttled save to disk
  // ═══════════════════════════════════════════════════════════
  _scheduleSave() {
    if (this.saveQueue) return;
    this.saveQueue = true;
    setTimeout(() => {
      this._save(FILES.patterns, this.cache.patterns);
      this._save(FILES.feedback, this.cache.feedback);
      this._save(FILES.keywords, this.cache.keywords);
      this._save(FILES.failures, this.cache.failures);
      this.saveQueue = false;
    }, 5000); // Save every 5 seconds (throttled)
  }

  // Force save now
  flush() {
    this._save(FILES.patterns, this.cache.patterns);
    this._save(FILES.feedback, this.cache.feedback);
    this._save(FILES.keywords, this.cache.keywords);
    this._save(FILES.failures, this.cache.failures);
  }
}

// Singleton instance — sabhi skills isi ko use karenge
const learningEngine = new LearningEngine();

module.exports = { LearningEngine, learningEngine };
