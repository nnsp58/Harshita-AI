const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); // Will need to add to package.json

class FileProcessorAgent {
  constructor() {
    this.uploadDir = path.join(__dirname, '../uploads');
    this.processedDir = path.join(__dirname, '../processed');

    // Ensure directories exist
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
    if (!fs.existsSync(this.processedDir)) {
      fs.mkdirSync(this.processedDir, { recursive: true });
    }
  }

  // Process photo - resize and optimize
  async processPhoto(inputPath, options = {}) {
    const {
      maxWidth = 800,
      maxHeight = 600,
      quality = 80,
      format = 'jpeg'
    } = options;

    const fileName = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(this.processedDir, `${fileName}_processed.${format}`);

    try {
      await sharp(inputPath)
        .resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);

      console.log(`📸 Photo processed: ${inputPath} -> ${outputPath} (${stats.size} bytes)`);

      return {
        success: true,
        inputPath,
        outputPath,
        size: stats.size,
        format,
        dimensions: await this.getImageDimensions(outputPath)
      };
    } catch (error) {
      console.error('Error processing photo:', error);
      return {
        success: false,
        inputPath,
        error: error.message
      };
    }
  }

  // Get image dimensions
  async getImageDimensions(filePath) {
    try {
      const metadata = await sharp(filePath).metadata();
      return {
        width: metadata.width,
        height: metadata.height
      };
    } catch (error) {
      return null;
    }
  }

  // Process PDF - compress and optimize (mock implementation)
  async processPDF(inputPath, options = {}) {
    const {
      quality = 'medium', // low, medium, high
      maxSizeMB = 2
    } = options;

    const fileName = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(this.processedDir, `${fileName}_compressed.pdf`);

    try {
      // For now, just copy the file (in production, use pdf-lib or similar)
      fs.copyFileSync(inputPath, outputPath);

      const stats = fs.statSync(outputPath);

      console.log(`📄 PDF processed: ${inputPath} -> ${outputPath} (${stats.size} bytes)`);

      return {
        success: true,
        inputPath,
        outputPath,
        size: stats.size,
        pages: 1, // Mock page count
        compressionRatio: 1.0
      };
    } catch (error) {
      console.error('Error processing PDF:', error);
      return {
        success: false,
        inputPath,
        error: error.message
      };
    }
  }

  // Process document files
  async processDocument(inputPath, documentType) {
    const ext = path.extname(inputPath).toLowerCase();

    if (['.jpg', '.jpeg', '.png', '.bmp'].includes(ext)) {
      return await this.processPhoto(inputPath, {
        maxWidth: documentType === 'photo' ? 400 : 800,
        maxHeight: documentType === 'photo' ? 500 : 600,
        quality: 85
      });
    } else if (ext === '.pdf') {
      return await this.processPDF(inputPath, {
        quality: 'medium',
        maxSizeMB: 2
      });
    } else {
      // For other files, just copy
      const fileName = path.basename(inputPath);
      const outputPath = path.join(this.processedDir, fileName);
      fs.copyFileSync(inputPath, outputPath);

      const stats = fs.statSync(outputPath);
      return {
        success: true,
        inputPath,
        outputPath,
        size: stats.size,
        format: ext.slice(1)
      };
    }
  }

  // Process all files for a user
  async processUserFiles(userId, filePaths) {
    const results = [];
    const processedFiles = {};

    for (const [type, filePath] of Object.entries(filePaths)) {
      if (fs.existsSync(filePath)) {
        try {
          const result = await this.processDocument(filePath, type);
          results.push(result);

          if (result.success) {
            processedFiles[type] = result.outputPath;
          }
        } catch (error) {
          console.error(`Error processing ${type}:`, error);
          results.push({
            success: false,
            inputPath: filePath,
            documentType: type,
            error: error.message
          });
        }
      } else {
        console.warn(`File not found: ${filePath}`);
        results.push({
          success: false,
          inputPath: filePath,
          documentType: type,
          error: 'File not found'
        });
      }
    }

    return {
      userId,
      processedFiles,
      results,
      processedAt: new Date()
    };
  }

  // Validate file before processing
  validateFile(filePath) {
    const errors = [];

    if (!fs.existsSync(filePath)) {
      errors.push('File does not exist');
      return { valid: false, errors };
    }

    const stats = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf', '.bmp'];

    if (!allowedTypes.includes(ext)) {
      errors.push(`File type ${ext} not supported`);
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (stats.size > maxSize) {
      errors.push(`File size ${stats.size} exceeds maximum allowed size ${maxSize}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      size: stats.size,
      type: ext,
      name: path.basename(filePath)
    };
  }

  // Clean up old processed files
  cleanupOldFiles(days = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const files = fs.readdirSync(this.processedDir);
    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(this.processedDir, file);
      const stats = fs.statSync(filePath);

      if (stats.mtime < cutoff) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    }

    console.log(`🧹 Cleaned up ${deletedCount} old processed files`);
    return deletedCount;
  }

  // Get storage stats
  getStorageStats() {
    const getDirSize = (dirPath) => {
      let totalSize = 0;
      const files = fs.readdirSync(dirPath);

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
      }

      return totalSize;
    };

    return {
      uploads: {
        size: getDirSize(this.uploadDir),
        fileCount: fs.readdirSync(this.uploadDir).length
      },
      processed: {
        size: getDirSize(this.processedDir),
        fileCount: fs.readdirSync(this.processedDir).length
      }
    };
  }

  // Batch process multiple users
  async batchProcessUsers(userFileMap) {
    const results = [];

    for (const [userId, filePaths] of Object.entries(userFileMap)) {
      try {
        const result = await this.processUserFiles(userId, filePaths);
        results.push(result);
      } catch (error) {
        results.push({
          userId,
          error: error.message,
          processedAt: new Date()
        });
      }
    }

    return results;
  }

  /**
   * Execute method for MasterAgent compatibility
   */
  async execute(taskData) {
    const { action, filePath, documentType, userId } = taskData;

    switch (action) {
      case 'process':
        if (!filePath) {
          return {
            success: false,
            message: 'No file path provided. Please specify file path.',
            requiresManualInput: true,
            fieldName: 'filePath'
          };
        }
        const result = await this.processDocument(filePath, documentType || 'general');
        return {
          success: result.success,
          message: result.success ? 
            `File processed: ${result.outputPath} (${result.size} bytes)` : 
            `Processing failed: ${result.error}`,
          data: result
        };

      case 'compress':
      case 'resize':
        return await this.execute({
          ...taskData,
          action: 'process'
        });

      case 'get_stats':
        return {
          success: true,
          data: this.getStorageStats(),
          message: 'Storage stats retrieved'
        };

      case 'cleanup':
        const deleted = this.cleanupOldFiles();
        return {
          success: true,
          message: `Cleaned up ${deleted} old files`
        };

      default:
        return {
          success: false,
          message: `Unknown action: ${action}. Use: process, compress, resize, get_stats, cleanup`
        };
    }
  }
}

module.exports = { FileProcessorAgent };