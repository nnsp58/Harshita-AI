// src/api/utils/upload.js - Upload Utility Functions

const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads/';

const ensureUploadDir = (subDir = '') => {
  const dir = subDir ? path.join(UPLOAD_DIR, subDir) : UPLOAD_DIR;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

const deleteFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
  return false;
};

const getFileInfo = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      return {
        exists: true,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    }
  } catch (error) {
    console.error('Error getting file info:', error);
  }
  return { exists: false };
};

const listFiles = (dir = UPLOAD_DIR, recursive = false) => {
  try {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && recursive) {
        files.push(...listFiles(fullPath, true));
      } else if (stat.isFile()) {
        files.push({
          name: item,
          path: fullPath,
          size: stat.size,
          modified: stat.mtime
        });
      }
    }
    
    return files;
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
};

module.exports = {
  ensureUploadDir,
  deleteFile,
  getFileInfo,
  listFiles,
  UPLOAD_DIR
};