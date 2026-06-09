/**
 * TicketBookingSkill — टिकट बुकिंग (ट्रेन/बस)
 */
const { BaseSkill } = require('./BaseSkill');

class TicketBookingSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'ticket_booking';
    this.displayName = 'टिकट बुकिंग';
    this.displayNameEn = 'Ticket Booking';
    this.description = 'ट्रेन, बस और फ्लाइट टिकट बुकिंग';
    this.descriptionEn = 'Train, bus and flight ticket booking';
    this.version = '1.0.0';
    this.category = 'utility';
    this.canRunOffline = false;
    this.priority = 5;
    this.intents = ['ticket_booking', 'book_train', 'book_bus', 'travel_booking'];
    this.keywords = {
      hi: ['टिकट', 'ट्रेन', 'बस', 'बुकिंग', 'यात्रा', 'फ्लाइट'],
      en: ['ticket', 'train', 'bus', 'flight', 'booking', 'book', 'irctc'],
      hinglish: ['ticket book karo', 'train ka ticket', 'bus booking', 'irctc ticket']
    };
    this.requiredAgents = ['ticketBookingAgent'];
  }

  async execute(context) {
    const { message } = context;
    const text = message.toLowerCase();

    if (text.includes('train') || text.includes('ट्रेन') || text.includes('irctc')) {
      return this._reply(
        '🚂 *ट्रेन टिकट बुकिंग (IRCTC)*\n\n' +
        'कृपया ये जानकारी प्रदान करें:\n' +
        '1. कहाँ से (From): ____________________\n' +
        '2. कहाँ तक (To): ____________________\n' +
        '3. यात्रा की तारीख (Date): ____________________\n' +
        '4. यात्रियों की संख्या: ____________________\n' +
        '5. मुख्य यात्री का नाम (Name): ____________________\n' +
        '6. आयु (Age): ____________________\n' +
        '7. आधार संख्या (Aadhaar/ID): ____________________ (optional)\n\n' +
        '🔗 [IRCTC Portal](https://www.irctc.co.in)',
        { mode: 'train_booking', step: 'collect' }
      );
    }

    if (text.includes('bus') || text.includes('बस')) {
      return this._reply(
        '🚌 *बस टिकट बुकिंग*\n\n' +
        'कृपया ये जानकारी प्रदान करें:\n' +
        '1. कहाँ से (From): ____________________\n' +
        '2. कहाँ तक (To): ____________________\n' +
        '3. यात्रा की तारीख (Date): ____________________\n' +
        '4. यात्री का नाम: ____________________\n' +
        '5. मोबाइल नंबर: ____________________\n\n' +
        '🔗 [RedBus/UPSRTC](https://www.redbus.in)',
        { mode: 'bus_booking', step: 'collect' }
      );
    }

    return this._reply(
      '🎫 *टिकट बुकिंग सेवा (Ticket Booking)*\n\n' +
      '• "ट्रेन का टिकट बुक करो" (IRCTC)\n' +
      '• "बस का टिकट" (RedBus/State Transport)\n' +
      '• "फ्लाइट बुकिंग" (Air Travel)\n\n' +
      'कौन सा टिकट चाहिए?',
      { mode: 'ticket_menu' }
    );
  }
}

module.exports = { TicketBookingSkill };
