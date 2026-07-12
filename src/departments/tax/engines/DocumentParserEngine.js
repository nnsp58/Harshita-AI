class DocumentParserEngine {
  /**
   * Mock OCR extraction for Form 16 / AIS / 26AS
   * In production, this would call an external OCR API (Google Doc AI / AWS Textract)
   */
  static async extractTaxData(documentType, documentBuffer, mimeType) {
    console.log(`[DocumentParser] Simulating OCR extraction for ${documentType}...`);
    
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulated Extraction Results based on Doc Type
    if (documentType === 'FORM_16') {
      return {
        employer: "Tata Consultancy Services Ltd",
        grossSalary: 850000,
        tdsDeducted: 45000,
        professionalTax: 2500,
        standardDeduction: 50000,
        deductions80C: 120000,
        confidence: 0.95
      };
    }

    if (documentType === 'AIS') {
      return {
        bankInterest: 12500,
        dividendIncome: 4500,
        mutualFundSales: 25000,
        tdsDeducted: 1250,
        confidence: 0.98
      };
    }

    if (documentType === '26AS') {
      return {
        totalTdsDeposited: 46250,
        confidence: 0.99
      };
    }

    throw new Error(`Unsupported document type: ${documentType}`);
  }
}

module.exports = { DocumentParserEngine };
