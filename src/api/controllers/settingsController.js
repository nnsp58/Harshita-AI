// src/api/controllers/settingsController.js - Secure API Key Management
const { prisma } = require('../../models/database');
const { encrypt } = require('../../utils/cryptoHelper');

const SUPPORTED_KEYS = ['gemini', 'openai', 'elevenlabs', 'fal', 'runway', 'veo'];

/**
 * Get API key configuration status (masking the actual values)
 */
async function getApiKeysStatus(req, res) {
  try {
    if (!prisma) {
      // In-memory fallback
      return res.json({
        success: true,
        data: {
          gemini: !!process.env.GEMINI_API_KEY,
          openai: !!process.env.OPENAI_API_KEY,
          elevenlabs: !!process.env.ELEVENLABS_API_KEY,
          fal: !!process.env.FAL_API_KEY,
          runway: !!process.env.RUNWAY_API_KEY,
          veo: !!process.env.VEO_API_KEY,
        },
        mode: 'fallback'
      });
    }

    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: SUPPORTED_KEYS.map(k => `api_key_${k}`)
        }
      }
    });

    const status = {};
    // Seed default state from database or process.env
    SUPPORTED_KEYS.forEach(key => {
      const dbRecord = settings.find(s => s.key === `api_key_${key}`);
      const envKeyName = `${key.toUpperCase()}_API_KEY`;
      status[key] = !!(dbRecord?.value || process.env[envKeyName]);
    });

    return res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('[SettingsController] Error getting status:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Save API keys securely
 */
async function saveApiKeys(req, res) {
  try {
    const { keys } = req.body;
    if (!keys || typeof keys !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid keys payload provided.' });
    }

    if (!prisma) {
      return res.status(500).json({ success: false, error: 'Database is running in memory mode; cannot persist keys.' });
    }

    const promises = Object.entries(keys).map(async ([key, value]) => {
      if (!SUPPORTED_KEYS.includes(key)) return;

      const dbKey = `api_key_${key}`;
      const trimmedValue = typeof value === 'string' ? value.trim() : '';

      // Skip if masked (means key hasn't changed)
      if (trimmedValue.includes('••••') || trimmedValue === 'configured') {
        return;
      }

      if (trimmedValue === '') {
        // Delete key if sent empty
        try {
          await prisma.systemSetting.delete({
            where: { key: dbKey }
          });
        } catch (e) {
          // Ignore if it didn't exist
        }
      } else {
        // Encrypt and upsert key
        const encrypted = encrypt(trimmedValue);
        await prisma.systemSetting.upsert({
          where: { key: dbKey },
          update: { value: encrypted },
          create: { key: dbKey, value: encrypted }
        });
      }
    });

    await Promise.all(promises);

    return res.json({
      success: true,
      message: 'API keys updated successfully.'
    });
  } catch (error) {
    console.error('[SettingsController] Error saving keys:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getApiKeysStatus,
  saveApiKeys
};
