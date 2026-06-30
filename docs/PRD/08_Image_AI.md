# PRD 08 — Image AI Engine

## Overview

The Image AI Engine provides image generation, editing, and processing capabilities — from logos and posters to passport photos and OCR.

---

## Existing Implementation

### PhotoMakerSkill
**File:** `src/skills/PhotoMakerSkill.js`
- Passport photo generation
- ID card photo formatting

### DocumentOcrSkill
**File:** `src/skills/DocumentOcrSkill.js`
- Text extraction from images (Tesseract.js)
- Aadhaar, PAN, marksheet data extraction

### FileProcessorSkill
**File:** `src/skills/FileProcessorSkill.js`
- Image compression
- Format conversion
- Resize

---

## v2.0 Image Skills

| Skill | Description | Offline | API Required |
|-------|-------------|---------|-------------|
| Logo Generator | AI-generated logos from description | ❌ | Image Gen API |
| Poster Maker | Event posters, flyers | ❌ | Image Gen API |
| Banner Creator | Social media banners, headers | ❌ | Image Gen API |
| OCR | Text extraction from images | ✅ | Tesseract.js |
| Background Removal | Remove/replace image backgrounds | ❌ | Image API |
| Image Enhancement | Upscale, denoise, sharpen | ❌ | Image API |
| Passport Photo | Standard passport size formatting | ✅ | Sharp |
| ID Card Generator | Employee/student ID cards | ✅ | Sharp/Canvas |
| Image Compression | Reduce file size | ✅ | Sharp |
| Image Resize | Resize to specific dimensions | ✅ | Sharp |
| Format Conversion | JPG ↔ PNG ↔ WebP ↔ SVG | ✅ | Sharp |
| Product Image | E-commerce product photos | ❌ | Image Gen API |
| QR Code Generator | Generate QR codes | ✅ | qrcode lib |

---

## Input Schema

```javascript
ImageInputSchema = z.object({
  action: z.enum([
    'generate_logo', 'generate_poster', 'generate_banner',
    'ocr', 'remove_background', 'enhance',
    'passport_photo', 'id_card',
    'compress', 'resize', 'convert', 'qr_code'
  ]),
  prompt: z.string().optional(),          // For AI generation
  imagePath: z.string().optional(),       // For processing existing images
  outputFormat: z.enum(['jpg', 'png', 'webp', 'svg']).optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  quality: z.number().min(1).max(100).optional(),
  language: z.enum(['hi', 'en']).default('hi'),  // For OCR
});
```

---

## Dependencies

- `sharp` — Image processing (already installed)
- `tesseract.js` — OCR (already installed)
- AI Image Generation API — For logo/poster/banner generation
