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
      return this._reply('🚂 ट्रेन टिकट बुकिंग — बताएं:\n1. कहाँ से (From)\n2. कहाँ तक (To)\n3. तारीख (Date)\n4. कितने यात्री', { mode: 'train_booking', step: 'collect' });
    }

    if (text.includes('bus') || text.includes('बस')) {
      return this._reply('🚌 बस टिकट बुकिंग — बताएं:\n1. कहाँ से\n2. कहाँ तक\n3. तारीख', { mode: 'bus_booking', step: 'collect' });
    }

    return this._reply('🎫 टिकट बुकिंग सेवा:\n• "ट्रेन का टिकट बुक करो"\n• "बस का टिकट"\n\nकौन सा टिकट चाहिए?', { mode: 'ticket_menu' });
  }
}

module.exports = { TicketBookingSkill };
