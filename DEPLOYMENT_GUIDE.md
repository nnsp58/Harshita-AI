# 🚀 HARSHITA AI BRAIN - VPS Deployment Guide

## 📋 Prerequisites

### Contabo VPS Requirements:
- **OS**: Ubuntu 22.04 LTS or Debian 11
- **RAM**: Minimum 4GB (Recommended 8GB+)
- **CPU**: 2+ cores
- **Storage**: 50GB+ SSD
- **Network**: Public IP with domain pointing to it

### Required API Keys (Get these before deployment):
- **Groq API Key**: https://console.groq.com
- **Gemini API Key**: https://makersuite.google.com/app/apikey
- **OpenRouter API Key**: https://openrouter.ai/keys

---

## 🎯 Quick Deployment (Automated)

### Step 1: Upload Application Code
```bash
# On your local machine
scp -r /path/to/harshita-ai-brain root@your-vps-ip:/tmp/

# Or clone from GitHub
ssh root@your-vps-ip
cd /tmp
git clone https://github.com/nnsp58/Harshita-AI.git harshita-ai-brain
```

### Step 2: Run Automated Deployment
```bash
# On VPS server
cd /tmp/harshita-ai-brain
chmod +x deploy-production.sh

# Edit domain in deploy-production.sh if needed
nano deploy-production.sh  # Change DOMAIN variable

# Run deployment
sudo ./deploy-production.sh
```

### Step 3: Configure API Keys
```bash
# Edit environment variables
sudo nano /opt/harshita-ai-brain/.env

# Add your API keys:
GROQ_API_KEY=your-groq-key-here
GEMINI_API_KEY=your-gemini-key-here
OPENROUTER_API_KEY=your-openrouter-key-here
```

### Step 4: Restart Application
```bash
cd /opt/harshita-ai-brain
pm2 restart harshita-ai-brain
```

---

## 🐳 Alternative: Docker Deployment

### Prerequisites:
```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Deployment Steps:
```bash
# Clone repository
git clone https://github.com/nnsp58/Harshita-AI.git
cd Harshita-AI

# Create environment file
cp .env.production.example .env
nano .env  # Add your API keys

# Build and start services
docker-compose up -d --build

# Check logs
docker-compose logs -f harshita-ai-brain
```

---

## 🔧 Manual Deployment (Advanced Users)

### Step 1: System Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install dependencies
sudo apt install -y nginx redis-server sqlite3 tesseract-ocr imagemagick poppler-utils
```

### Step 2: Application Setup
```bash
# Create application directory
sudo mkdir -p /opt/harshita-ai-brain
sudo chown -R $USER:$USER /opt/harshita-ai-brain

# Copy application
cp -r /path/to/harshita-ai-brain/* /opt/harshita-ai-brain/
cd /opt/harshita-ai-brain

# Install dependencies
npm install --production

# Setup database
npm run db:push
```

### Step 3: Environment Configuration
```bash
# Copy environment template
cp .env.production.example .env
nano .env  # Configure all variables
```

### Step 4: Nginx Configuration
```bash
# Copy nginx config
sudo cp nginx.conf /etc/nginx/nginx.conf
sudo nano /etc/nginx/nginx.conf  # Update domain/server names

# Enable site
sudo ln -sf /etc/nginx/sites-available/harshita-ai-brain /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5: SSL Certificate
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Step 6: Process Management
```bash
# Install PM2
sudo npm install -g pm2

# Start application
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

---

## 🔍 Post-Deployment Checks

### Health Check:
```bash
curl https://your-domain.com/health
```

### Application Logs:
```bash
pm2 logs harshita-ai-brain
tail -f /opt/harshita-ai-brain/logs/combined.log
```

### Service Status:
```bash
sudo systemctl status nginx
sudo systemctl status redis-server
pm2 status
```

---

## 🔐 Security Checklist

- [ ] **Firewall**: UFW configured with only necessary ports
- [ ] **SSL**: Let's Encrypt certificate installed
- [ ] **API Keys**: All sensitive keys in environment variables
- [ ] **File Permissions**: Correct ownership and permissions
- [ ] **Database**: Access restricted to application user
- [ ] **Backups**: Automated backup system configured
- [ ] **Monitoring**: PM2 monitoring active
- [ ] **Rate Limiting**: Nginx rate limiting configured

---

## 📊 Monitoring & Maintenance

### Daily Monitoring:
```bash
# Check application health
pm2 monit

# Check disk usage
df -h

# Check memory usage
free -h

# Check logs for errors
grep "ERROR" /opt/harshita-ai-brain/logs/combined.log | tail -10
```

### Weekly Maintenance:
```bash
# Update application
cd /opt/harshita-ai-brain
git pull origin master
npm update
pm2 restart harshita-ai-brain

# Clean up old logs
pm2 flush
find /opt/harshita-ai-brain/logs -name "*.log" -mtime +7 -delete
```

### Monthly Maintenance:
```bash
# SSL certificate renewal
sudo certbot renew
sudo systemctl reload nginx

# System updates
sudo apt update && sudo apt upgrade -y
```

---

## 🚨 Troubleshooting

### Application Not Starting:
```bash
# Check PM2 status
pm2 status
pm2 logs harshita-ai-brain

# Check environment variables
cat /opt/harshita-ai-brain/.env | grep -v PASSWORD
```

### Database Issues:
```bash
# Check database file
ls -la /opt/harshita-ai-brain/data/
sqlite3 /opt/harshita-ai-brain/data/prod.db ".tables"
```

### Nginx Issues:
```bash
# Test configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log
```

### SSL Issues:
```bash
# Check certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew
```

---

## 📞 Support

For deployment issues:
- Check logs in `/opt/harshita-ai-brain/logs/`
- Verify API keys are correctly set
- Ensure all system dependencies are installed
- Check network connectivity to external services

---

## 🎯 Performance Optimization

### For High Traffic:
1. **Enable Redis clustering**
2. **Add load balancer (nginx upstream)**
3. **Increase PM2 instances**
4. **Add database connection pooling**
5. **Implement CDN for static assets**

### Monitoring Setup:
1. **PM2 monitoring**: `pm2 monit`
2. **Nginx access logs**: `/var/log/nginx/access.log`
3. **Application metrics**: Health endpoint
4. **External monitoring**: UptimeRobot, Grafana

---

## 📋 Deployment Checklist

- [ ] **Domain DNS**: Points to VPS IP
- [ ] **SSL Certificate**: Let's Encrypt configured
- [ ] **API Keys**: All AI providers configured
- [ ] **Database**: Schema migrated
- [ ] **File Permissions**: Correct ownership
- [ ] **Firewall**: UFW active
- [ ] **Backup**: Cron job configured
- [ ] **Monitoring**: PM2 active
- [ ] **Health Check**: Application responding
- [ ] **Test Features**: Upload document, AI processing

---

**🎉 Deployment Complete! Your HARSHITA AI BRAIN is now live on Contabo VPS!**