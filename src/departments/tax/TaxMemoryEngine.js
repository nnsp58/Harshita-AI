const { prisma } = require('../../models/database');
const { TaxSecurityEngine } = require('./TaxSecurityEngine');

class TaxMemoryEngine {
  
  static async getProfile(userId) {
    if (!prisma) return null;
    try {
      let profile = await prisma.taxProfile.findUnique({ where: { user_id: userId } });
      if (!profile) {
        profile = await prisma.taxProfile.create({ data: { user_id: userId } });
      }
      
      // Decrypt sensitive fields
      profile.pan = TaxSecurityEngine.decrypt(profile.pan);
      profile.aadhaar = TaxSecurityEngine.decrypt(profile.aadhaar);
      
      return profile;
    } catch (e) {
      console.error('[TaxMemoryEngine] getProfile error:', e.message);
      return null;
    }
  }

  static async updateProfile(userId, data) {
    if (!prisma) return null;
    try {
      const updateData = { ...data };
      
      // Encrypt sensitive fields before saving
      if (updateData.pan) updateData.pan = TaxSecurityEngine.encrypt(updateData.pan);
      if (updateData.aadhaar) updateData.aadhaar = TaxSecurityEngine.encrypt(updateData.aadhaar);
      
      const updated = await prisma.taxProfile.update({
        where: { user_id: userId },
        data: updateData
      });

      return updated;
    } catch (e) {
      console.error('[TaxMemoryEngine] updateProfile error:', e.message);
      return null;
    }
  }

  static async logAudit(userId, action, details) {
    if (!prisma) return;
    try {
      await prisma.taxAuditLog.create({
        data: {
          user_id: userId,
          action,
          details
        }
      });
    } catch (e) {
      console.error('[TaxMemoryEngine] logAudit error:', e.message);
    }
  }
}

module.exports = { TaxMemoryEngine };
