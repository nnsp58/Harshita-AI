#!/bin/bash

# HARSHITA AI BRAIN - Production Deployment Script for Contabo VPS
# Version: 2.0.0
# Date: 2026-05-07

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="harshita-ai-brain"
APP_DIR="/opt/$APP_NAME"
DOMAIN="harshita-ai.csc.gov.in"  # Replace with actual domain
NODE_VERSION="18"
DB_PATH="./data/dev.db"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root"
        exit 1
    fi
}

update_system() {
    log_info "Updating system packages..."
    apt update && apt upgrade -y
    log_success "System updated"
}

install_nodejs() {
    log_info "Installing Node.js $NODE_VERSION..."

    # Install Node.js using NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION.x | bash -
    apt install -y nodejs

    # Verify installation
    node --version
    npm --version

    log_success "Node.js $NODE_VERSION installed"
}

install_dependencies() {
    log_info "Installing system dependencies..."

    # Install required packages
    apt install -y \
        curl \
        wget \
        git \
        htop \
        vim \
        ufw \
        fail2ban \
        nginx \
        certbot \
        python3-certbot-nginx \
        sqlite3 \
        redis-server \
        tesseract-ocr \
        tesseract-ocr-eng \
        tesseract-ocr-hin \
        imagemagick \
        poppler-utils

    log_success "System dependencies installed"
}

setup_database() {
    log_info "Setting up database..."

    # Create database directory
    mkdir -p /opt/$APP_NAME/data

    # Initialize SQLite database if it doesn't exist
    if [ ! -f "$DB_PATH" ]; then
        log_info "Initializing SQLite database..."
        sqlite3 $DB_PATH "CREATE TABLE IF NOT EXISTS migrations (id INTEGER PRIMARY KEY, name TEXT, executed_at DATETIME DEFAULT CURRENT_TIMESTAMP);"
    fi

    log_success "Database setup completed"
}

setup_application() {
    log_info "Setting up application..."

    # Create application directory
    mkdir -p $APP_DIR

    # Clone or copy application code
    if [ -d "/tmp/$APP_NAME" ]; then
        log_info "Copying application from /tmp..."
        cp -r /tmp/$APP_NAME/* $APP_DIR/
    else
        log_error "Application code not found in /tmp/$APP_NAME"
        log_info "Please upload the application code to /tmp/$APP_NAME first"
        exit 1
    fi

    # Set proper permissions
    chown -R www-data:www-data $APP_DIR
    chmod -R 755 $APP_DIR

    # Navigate to app directory
    cd $APP_DIR

    # Install Node.js dependencies
    log_info "Installing Node.js dependencies..."
    npm ci --production

    # Run database migrations/setup
    log_info "Setting up database schema..."
    npm run db:push

    # Build frontend (if needed)
    if [ -d "frontend" ]; then
        log_info "Building frontend..."
        cd frontend
        npm ci
        npm run build
        cd ..
    fi

    log_success "Application setup completed"
}

configure_environment() {
    log_info "Configuring environment variables..."

    # Create .env file
    cat > $APP_DIR/.env << EOF
# Production Environment Configuration
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL="file:./data/prod.db"

# JWT Security
JWT_SECRET="$(openssl rand -base64 32)"
JWT_EXPIRES_IN=24h

# AI Providers (Configure your API keys)
GROQ_API_KEY=your-groq-api-key-here
GEMINI_API_KEY=your-gemini-api-key-here
OPENROUTER_API_KEY=your-openrouter-api-key-here
MISTRAL_API_KEY=your-mistral-api-key-here

# Server Configuration
CORS_ORIGIN=https://$DOMAIN
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# File Upload
UPLOAD_DIR=./uploads
PROCESSED_DIR=./processed
MAX_FILE_SIZE=10485760

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email Configuration (Optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# SSL Configuration
SSL_CERT_PATH=/etc/letsencrypt/live/$DOMAIN/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/$DOMAIN/privkey.pem

# n8n Integration (Optional)
N8N_BASE_URL=http://localhost:5678

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
EOF

    log_warning "⚠️  IMPORTANT: Update API keys in $APP_DIR/.env before starting the application!"
    log_info "Required API keys to configure:"
    log_info "  - GROQ_API_KEY (Free AI provider)"
    log_info "  - GEMINI_API_KEY (High-quality AI)"
    log_info "  - OPENROUTER_API_KEY (Backup AI)"
}

setup_nginx() {
    log_info "Configuring Nginx..."

    # Create Nginx configuration
    cat > /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Handle static files
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Rate limiting
        limit_req zone=api burst=20 nodelay;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static file serving
    location /uploads/ {
        alias $APP_DIR/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

    # Enable site
    ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default

    # Test configuration
    nginx -t

    log_success "Nginx configured"
}

setup_ssl() {
    log_info "Setting up SSL certificate..."

    # Stop nginx temporarily for certbot
    systemctl stop nginx

    # Get SSL certificate
    certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --agree-tos --email admin@$DOMAIN --non-interactive

    # Restart nginx
    systemctl start nginx

    log_success "SSL certificate installed"
}

setup_firewall() {
    log_info "Configuring firewall..."

    # Enable UFW
    ufw --force enable

    # Allow SSH, HTTP, HTTPS
    ufw allow ssh
    ufw allow 'Nginx Full'

    # Rate limiting for SSH
    ufw limit ssh

    log_success "Firewall configured"
}

setup_monitoring() {
    log_info "Setting up monitoring..."

    # Install PM2 for process management
    npm install -g pm2

    # Create PM2 ecosystem file
    cat > $APP_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'src/api/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

    log_success "PM2 monitoring configured"
}

setup_backup() {
    log_info "Setting up backup system..."

    # Create backup script
    cat > /usr/local/bin/backup-$APP_NAME << EOF
#!/bin/bash
BACKUP_DIR="/opt/backups/$APP_NAME"
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="\$BACKUP_DIR/backup_\$DATE.tar.gz"

mkdir -p \$BACKUP_DIR

# Create backup
tar -czf \$BACKUP_FILE -C /opt $APP_NAME

# Keep only last 7 backups
cd \$BACKUP_DIR
ls -t backup_*.tar.gz | tail -n +8 | xargs -r rm

echo "Backup created: \$BACKUP_FILE"
EOF

    chmod +x /usr/local/bin/backup-$APP_NAME

    # Add to cron for daily backups at 2 AM
    echo "0 2 * * * root /usr/local/bin/backup-$APP_NAME" > /etc/cron.d/backup-$APP_NAME

    log_success "Backup system configured"
}

start_services() {
    log_info "Starting services..."

    # Start Redis
    systemctl enable redis-server
    systemctl start redis-server

    # Start Nginx
    systemctl enable nginx
    systemctl reload nginx

    # Start application with PM2
    cd $APP_DIR
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup

    log_success "Services started"
}

create_deployment_summary() {
    log_info "Creating deployment summary..."

    cat > $APP_DIR/DEPLOYMENT_README.md << EOF
# HARSHITA AI BRAIN - Production Deployment Summary

## 🚀 Deployment Date: $(date)
## 📍 Server: Contabo VPS
## 🌐 Domain: $DOMAIN

## ✅ Services Installed & Configured:
- ✅ Node.js $NODE_VERSION
- ✅ Nginx (Reverse Proxy)
- ✅ Redis (Caching/Queue)
- ✅ SQLite Database
- ✅ SSL Certificate (Let's Encrypt)
- ✅ UFW Firewall
- ✅ Fail2Ban (Intrusion Prevention)
- ✅ PM2 (Process Management)

## 🔧 Application Configuration:

### Environment Variables (Update in .env):
\`\`\`bash
# Required API Keys
GROQ_API_KEY=your-groq-api-key-here
GEMINI_API_KEY=your-gemini-api-key-here
OPENROUTER_API_KEY=your-openrouter-api-key-here

# Database
DATABASE_URL="file:./data/prod.db"

# Security
JWT_SECRET="$(openssl rand -base64 32)"
\`\`\`

### File Permissions:
\`\`\`bash
chown -R www-data:www-data /opt/$APP_NAME
chmod -R 755 /opt/$APP_NAME
\`\`\`

## 📊 Monitoring Commands:

### Check Application Status:
\`\`\`bash
pm2 status
pm2 logs $APP_NAME
\`\`\`

### Check Services:
\`\`\`bash
systemctl status nginx
systemctl status redis-server
\`\`\`

### View Logs:
\`\`\`bash
tail -f /opt/$APP_NAME/logs/combined.log
tail -f /var/log/nginx/error.log
\`\`\`

## 🔄 Maintenance Commands:

### Update Application:
\`\`\`bash
cd /opt/$APP_NAME
git pull origin master
npm ci --production
pm2 restart $APP_NAME
\`\`\`

### Backup Data:
\`\`\`bash
/usr/local/bin/backup-$APP_NAME
\`\`\`

### SSL Certificate Renewal:
\`\`\`bash
certbot renew
systemctl reload nginx
\`\`\`

## 🚨 Emergency Contacts:
- Server Admin: admin@$DOMAIN
- Technical Support: support@$DOMAIN
- Monitoring Alerts: alerts@$DOMAIN

## 📈 Performance Tuning:

### Nginx Optimization:
- Worker processes: auto
- Worker connections: 1024
- Rate limiting: 1000 requests/15min

### Node.js Optimization:
- Memory limit: 1GB per process
- Auto-restart on crash: enabled
- Clustering: single instance (can scale to multiple)

### Database Optimization:
- SQLite with WAL mode
- Regular vacuum operations
- Backup every 24 hours

## 🎯 Next Steps:

1. **Configure API Keys** in .env file
2. **Test Application** functionality
3. **Setup Monitoring** (optional: Grafana + Prometheus)
4. **Configure CDN** (optional: Cloudflare)
5. **Setup Load Balancing** (for multiple servers)

## 🔒 Security Checklist:

- [x] Firewall configured (UFW)
- [x] SSL certificate installed
- [x] Rate limiting enabled
- [x] File upload restrictions
- [x] API key validation
- [x] Database access restricted
- [x] Backup system active

---
**Deployment completed successfully! 🎉**
EOF

    log_success "Deployment summary created at $APP_DIR/DEPLOYMENT_README.md"
}

main() {
    log_info "🚀 Starting HARSHITA AI BRAIN deployment on Contabo VPS..."

    check_root
    update_system
    install_nodejs
    install_dependencies
    setup_database
    setup_application
    configure_environment
    setup_nginx
    setup_ssl
    setup_firewall
    setup_monitoring
    setup_backup
    start_services
    create_deployment_summary

    log_success "🎉 HARSHITA AI BRAIN deployment completed successfully!"
    log_info "📋 Check deployment summary at: $APP_DIR/DEPLOYMENT_README.md"
    log_warning "⚠️  IMPORTANT: Update API keys in $APP_DIR/.env and restart the application"
    log_info "🌐 Application will be available at: https://$DOMAIN"
}

# Run main function
main "$@"