# HARSHITA AI BRAIN - Docker Production Setup

# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Install system dependencies for OCR and image processing
RUN apk add --no-cache \
    tesseract-ocr \
    tesseract-ocr-data-eng \
    imagemagick \
    poppler-utils \
    sqlite \
    redis \
    && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p \
    data \
    uploads \
    processed \
    logs \
    screenshots \
    && chmod -R 755 /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S harsha -u 1001

# Change ownership
RUN chown -R harsha:nodejs /app
USER harsha

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]