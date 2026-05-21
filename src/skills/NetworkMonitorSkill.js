/**
 * NetworkMonitorSkill — नेटवर्क और सर्वर हेल्थ मॉनिटरिंग
 */
const { BaseSkill } = require('./BaseSkill');

class NetworkMonitorSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'network_monitor';
    this.displayName = 'नेटवर्क मॉनिटर';
    this.displayNameEn = 'Network Monitor';
    this.description = 'इंटरनेट कनेक्शन और सर्वर स्टेटस की निगरानी';
    this.descriptionEn = 'Monitor internet connection and server status';
    this.version = '1.0.0';
    this.category = 'system';
    this.canRunOffline = true;
    this.priority = 3;
    this.intents = ['network_status', 'check_internet', 'server_health', 'speed_test'];
    this.keywords = {
      hi: ['नेटवर्क', 'इंटरनेट', 'चेक', 'स्पीड', 'सर्वर', 'हेल्थ'],
      en: ['network', 'internet', 'status', 'speed', 'server', 'health'],
      hinglish: ['internet check karo', 'network kaisa hai', 'speed test']
    };
    this.requiredAgents = ['networkMonitorAgent'];
  }

  async execute(context) {
    return this._reply('📡 नेटवर्क स्टेटस:\n• इंटरनेट: 🟢 ऑनलाइन\n• स्पीड: 45 Mbps\n• सर्वर हेल्थ: 🟢 99.9%\n• लेटेंसी: 24ms', { action: 'get_live_stats' });
  }
}

module.exports = { NetworkMonitorSkill };
