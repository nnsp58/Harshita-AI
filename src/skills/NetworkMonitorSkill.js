/**
 * NetworkMonitorSkill — नेटवर्क और सर्वर हेल्थ मॉनिटरिंग
 * 
 * Real network checks:
 *   - DNS resolution test (internet connectivity)
 *   - HTTP ping to known endpoints (latency)
 *   - Server uptime info (process.uptime)
 */
const { BaseSkill } = require('./BaseSkill');
const dns = require('dns');
const http = require('http');
const https = require('https');
const os = require('os');

class NetworkMonitorSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'network_monitor';
    this.displayName = 'नेटवर्क मॉनिटर';
    this.displayNameEn = 'Network Monitor';
    this.description = 'इंटरनेट कनेक्शन और सर्वर स्टेटस की निगरानी';
    this.descriptionEn = 'Monitor internet connection and server status';
    this.version = '2.0.0';
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
    const { message } = context;
    const text = (message || '').toLowerCase();

    try {
      // Run all checks in parallel
      const [dnsCheck, pingResult, serverInfo] = await Promise.allSettled([
        this._checkDNS(),
        this._pingEndpoint('https://www.google.com'),
        this._getServerInfo(),
      ]);

      const isOnline = dnsCheck.status === 'fulfilled' && dnsCheck.value === true;
      const latency = pingResult.status === 'fulfilled' ? pingResult.value : null;
      const server = serverInfo.status === 'fulfilled' ? serverInfo.value : {};

      // Build status report
      const statusIcon = isOnline ? '🟢' : '🔴';
      const statusText = isOnline ? 'ऑनलाइन (Online)' : 'ऑफलाइन (Offline)';
      const latencyText = latency !== null ? `${latency}ms` : '❌ Timeout';
      
      const uptimeHours = Math.floor((server.uptime || 0) / 3600);
      const uptimeMinutes = Math.floor(((server.uptime || 0) % 3600) / 60);
      const memUsed = server.memUsedMB || 0;
      const memTotal = server.memTotalMB || 0;
      const memPercent = memTotal > 0 ? Math.round((memUsed / memTotal) * 100) : 0;

      let report = `📡 *नेटवर्क स्टेटस (Network Status)*\n\n`;
      report += `• इंटरनेट: ${statusIcon} ${statusText}\n`;
      report += `• लेटेंसी (Google): ${latencyText}\n`;
      report += `• सर्वर अपटाइम: ${uptimeHours}h ${uptimeMinutes}m\n`;
      report += `• मेमोरी: ${memUsed}MB / ${memTotal}MB (${memPercent}%)\n`;
      report += `• CPU कोर: ${server.cpuCores || 'N/A'}\n`;
      report += `• Node.js: ${process.version}\n`;
      report += `• Platform: ${server.platform || 'N/A'}`;

      if (!isOnline) {
        report += `\n\n⚠️ *इंटरनेट कनेक्शन नहीं है!* DNS resolve fail हुआ।\nकृपया अपना WiFi/LAN कनेक्शन चेक करें।`;
      }

      return this._reply(report, { 
        mode: 'network_report',
        online: isOnline,
        latency,
        uptime: server.uptime,
        memPercent,
      });

    } catch (err) {
      return this._reply(`⚠️ नेटवर्क चेक में error: ${err.message}\n\nकृपया पुनः प्रयास करें।`);
    }
  }

  /**
   * DNS resolution test — checks if we can reach the internet
   */
  _checkDNS() {
    return new Promise((resolve) => {
      dns.resolve('google.com', (err) => {
        resolve(!err);
      });
    });
  }

  /**
   * HTTP ping — measures latency to an endpoint
   */
  _pingEndpoint(url) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const proto = url.startsWith('https') ? https : http;
      
      const req = proto.get(url, { timeout: 5000 }, (res) => {
        res.destroy(); // We only need the connection time
        resolve(Date.now() - startTime);
      });
      
      req.on('error', () => reject(new Error('Ping failed')));
      req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    });
  }

  /**
   * Server info — uptime, memory, CPU
   */
  _getServerInfo() {
    return Promise.resolve({
      uptime: process.uptime(),
      memUsedMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
      memTotalMB: Math.round(os.totalmem() / 1024 / 1024),
      cpuCores: os.cpus().length,
      platform: `${os.type()} ${os.arch()}`,
    });
  }
}

module.exports = { NetworkMonitorSkill };
