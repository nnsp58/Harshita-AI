#!/bin/bash

# HARSHITA AI BRAIN - VPS Setup Helper
# Run this on your Contabo VPS before deployment

set -e

echo "🚀 HARSHITA AI BRAIN - VPS Setup Helper"
echo "========================================"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root: sudo $0"
   exit 1
fi

echo "✅ Running as root"

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install basic tools
echo "🔧 Installing basic tools..."
apt install -y curl wget git htop vim ufw fail2ban

# Setup firewall
echo "🔥 Configuring firewall..."
ufw --force enable
ufw allow ssh
ufw allow 80
ufw allow 443
ufw --force reload

echo "✅ Basic setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Upload your application code to /tmp/harshita-ai-brain/"
echo "2. Run: sudo bash /tmp/harshita-ai-brain/deploy-production.sh"
echo "3. Configure API keys in /opt/harshita-ai-brain/.env"
echo "4. Access your app at: http://your-server-ip"
echo ""
echo "🔗 Useful commands:"
echo "- Check status: pm2 status"
echo "- View logs: pm2 logs harshita-ai-brain"
echo "- Restart app: pm2 restart harshita-ai-brain"
echo ""
echo "🎉 Setup complete! Ready for deployment."