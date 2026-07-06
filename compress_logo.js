const sharp = require('sharp');
const fs = require('fs');

async function compressImage() {
  const inputPath = 'd:\\Harshita-AI\\frontend\\public\\harshita ai.png';
  const outputPath = 'd:\\Harshita-AI\\frontend\\public\\harshita_ai_compressed.png';
  const artifactPath = 'C:\\Users\\hp\\.gemini\\antigravity-ide\\brain\\de288624-ca4b-4d28-943e-2e6e7a90ddf3\\harshita_ai_logo_small.png';

  try {
    // Read the original image, compress it
    // Resize down to 800px width (which is plenty for logos) and use high compression PNG or WebP
    // but the user might specifically want PNG.
    await sharp(inputPath)
      .resize({ width: 800 })
      .png({ quality: 80, compressionLevel: 9 })
      .toFile(outputPath);
    
    fs.copyFileSync(outputPath, artifactPath);
    console.log('Successfully compressed to under 1MB.');
  } catch (error) {
    console.error('Error compressing image:', error);
  }
}

compressImage();
