const fs = require('fs');
const path = require('path');
const { BaseBot } = require('./baseBot');

class SiteRegistry {
  constructor() {
    this.bots = new Map();
    this.configs = new Map();
    this.loadConfigs();
    this.loadBots();
  }

  loadConfigs() {
    try {
      const configPath = path.join(__dirname, '..', '..', 'config', 'sites.json');
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      for (const siteConfig of configData.sites) {
        this.configs.set(siteConfig.id, siteConfig);
      }
      
      console.log(`[SiteRegistry] Loaded ${this.configs.size} site configurations`);
    } catch (error) {
      console.error('[SiteRegistry] Error loading configs:', error.message);
    }
  }

  loadBots() {
    const sitesDir = path.join(__dirname, 'sites');
    
    if (!fs.existsSync(sitesDir)) {
      console.log('[SiteRegistry] No sites directory found, using BaseBot for all sites');
      return;
    }

    const files = fs.readdirSync(sitesDir).filter(f => f.endsWith('Bot.js'));
    
    for (const file of files) {
      const siteId = file.replace('Bot.js', '').replace('Bot', '');
      try {
        const BotClass = require(path.join(sitesDir, file));
        this.bots.set(siteId, BotClass);
        console.log(`[SiteRegistry] Loaded bot: ${siteId}`);
      } catch (error) {
        console.warn(`[SiteRegistry] Failed to load bot ${file}: ${error.message}`);
      }
    }
  }

  getConfig(serviceType) {
    const config = this.configs.get(serviceType);
    if (!config) {
      throw new Error(`No configuration found for service type: ${serviceType}`);
    }
    return config;
  }

  getBot(serviceType, browserAgent = null) {
    const config = this.getConfig(serviceType);
    
    let BotClass = this.bots.get(serviceType);
    
    if (!BotClass) {
      console.log(`[SiteRegistry] No custom bot for ${serviceType}, using BaseBot`);
      BotClass = BaseBot;
    }

    return new BotClass(config, browserAgent);
  }

  getSupportedServices() {
    return Array.from(this.configs.keys());
  }

  getServiceInfo(serviceType) {
    const config = this.configs.get(serviceType);
    if (!config) return null;
    
    return {
      id: config.id,
      name: config.name,
      hasCaptcha: config.hasCaptcha,
      hasOtp: config.hasOtp,
      requiredDocuments: config.requiredDocuments
    };
  }

  hasService(serviceType) {
    return this.configs.has(serviceType);
  }
}

const registry = new SiteRegistry();

module.exports = { SiteRegistry, registry };