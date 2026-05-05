# CSC Automation System - Docker Image
# Based on Playwright image for browser automation

FROM mcr.microsoft.com/playwright:v1.59.0-jammy

# Set working directory
WORKDIR /app

# Install system dependencies: Tesseract OCR, curl, etc.
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-hin \
    libtesseract-dev \
    libleptonica-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install Node.js dependencies (including dev for prisma)
ENV NODE_ENV=production
RUN npm ci

# Copy application code
COPY . .

# Ensure writable directories
RUN mkdir -p uploads screenshots output

# Generate Prisma client
RUN npx prisma generate

# Expose API port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if(r.statusCode!==200)process.exit(1)})" || exit 1

# Start API server
CMD ["node", "src/api/server.js"]
