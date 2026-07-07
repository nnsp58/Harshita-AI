class TaxNotificationService {
  
  static notify(userId, message, type = 'info') {
    // Stub for Phase 1. Will integrate with Socket.io in later phases.
    console.log(`[TaxNotificationService] [${type.toUpperCase()}] User ${userId}: ${message}`);
  }

}

module.exports = { TaxNotificationService };
