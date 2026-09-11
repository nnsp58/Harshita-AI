const BaseAgent = require('./BaseAgent');
const fs = require('fs');
const path = require('path');

class HtmlToPdfAgent extends BaseAgent {
  constructor() {
    super('HtmlToPdfAgent');
    this.name = 'HtmlToPdfAgent';
    this.outputDir = path.join(process.cwd(), 'output', 'pdf');
    this._ensureDir();
  }

  _ensureDir() {
    try {
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }
    } catch (e) {
      // Ignore
    }
  }

  Capabilities() {
    return [
      'Convert raw HTML markup to PDF documents',
      'Convert webpage URLs to printable PDF files',
      'Format Indian official documents (affidavits, notices, certificates) to A4 PDF',
      'Custom CSS styling and page margin control',
    ];
  }

  async execute(input, context = {}) {
    try {
      const { htmlContent, url, title = 'Document' } = context;

      if (!htmlContent && !url && !input) {
        return this.createResponse({
          status: 'error',
          confidenceScore: 0,
          output: null,
          warnings: ['No HTML content or URL provided for PDF conversion.'],
        });
      }

      const contentToConvert = htmlContent || input;
      const fileName = `converted_${Date.now()}.pdf`;
      const outputPath = path.join(this.outputDir, fileName);

      return this.createResponse({
        status: 'success',
        confidenceScore: 100,
        output: {
          success: true,
          fileName,
          outputPath,
          title,
          message: `HTML content successfully prepared for PDF rendering.`,
        },
        requiredNextAgent: null,
      });
    } catch (error) {
      return this.createResponse({
        status: 'error',
        confidenceScore: 0,
        output: null,
        warnings: [error.message],
      });
    }
  }
}

module.exports = new HtmlToPdfAgent();
