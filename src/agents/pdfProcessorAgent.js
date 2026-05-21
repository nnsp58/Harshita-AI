// PDF Processing Agent for TA/DA Form Analysis
// Uses OCR and AI to extract data from historical TA/DA PDFs

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

class PDFProcessorAgent {
    constructor() {
        this.processedData = new Map();
    }

    // Process a TA/DA PDF file
    async processTAPDF(pdfPath) {
        try {
            console.log(`📄 Processing TA/DA PDF: ${pdfPath}`);

            // Read PDF file
            const dataBuffer = fs.readFileSync(pdfPath);
            const data = await pdfParse(dataBuffer);

            // Extract text content
            const text = data.text;
            console.log(`📝 Extracted text (${text.length} characters)`);

            // Analyze content for TA/DA data
            const extractedData = this.analyzeTAContent(text, path.basename(pdfPath));

            // Store processed data
            this.processedData.set(path.basename(pdfPath), extractedData);

            return extractedData;
        } catch (error) {
            console.error(`❌ PDF processing error for ${pdfPath}:`, error.message);
            return null;
        }
    }

    // Analyze TA/DA content using pattern matching and AI-like logic
    analyzeTAContent(text, filename) {
        const data = {
            source: filename,
            employeeInfo: this.extractEmployeeInfo(text),
            travelInfo: this.extractTravelInfo(text),
            financialInfo: this.extractFinancialInfo(text),
            department: this.inferDepartment(text, filename),
            extractedAt: new Date().toISOString()
        };

        console.log(`✅ Analyzed ${filename}:`, {
            employee: data.employeeInfo?.name,
            department: data.department,
            daRate: data.financialInfo?.daRate
        });

        return data;
    }

    // Extract employee information
    extractEmployeeInfo(text) {
        const patterns = {
            name: /(?:name|नाम)[\s:]*([^\n\r]+)/i,
            designation: /(?:designation|पदनाम|पद)[\s:]*([^\n\r]+)/i,
            pno: /(?:PNO|pno|क्रमांक)[\s:]*([A-Z0-9]+)/i,
            employeeId: /(?:EMP|emp|employee)[\s:]*([A-Z0-9]+)/i
        };

        const info = {};
        for (const [key, pattern] of Object.entries(patterns)) {
            const match = text.match(pattern);
            if (match) {
                info[key] = match[1].trim();
            }
        }

        // Infer pay scale from designation or other clues
        if (info.designation) {
            if (info.designation.toLowerCase().includes('junior') || info.designation.toLowerCase().includes('constable')) {
                info.payScale = 'level1';
            } else if (info.designation.toLowerCase().includes('senior') || info.designation.toLowerCase().includes('head')) {
                info.payScale = 'level4';
            } else {
                info.payScale = 'level3'; // Default
            }
        }

        return info;
    }

    // Extract travel information
    extractTravelInfo(text) {
        const patterns = {
            from: /(?:from|departure|प्रस्थान)[\s:]*([^\n\r,]+)/i,
            to: /(?:to|arrival|आगमन)[\s:]*([^\n\r,]+)/i,
            distance: /(?:distance|दूरी)[\s:]*(\d+)/i,
            days: /(?:days|halting|वास)[\s:]*(\d+)/i,
            purpose: /(?:purpose|उद्देश्य)[\s:]*([^\n\r]+)/i
        };

        const info = {};
        for (const [key, pattern] of Object.entries(patterns)) {
            const match = text.match(pattern);
            if (match) {
                info[key] = match[1].trim();
            }
        }

        return info;
    }

    // Extract financial information
    extractFinancialInfo(text) {
        const patterns = {
            fare: /(?:fare|भाड़ा)[\s:]*₹?(\d+(?:\.\d{2})?)/i,
            daRate: /(?:DA|दैनिक).*?₹?(\d+(?:\.\d{2})?)/i,
            conveyance: /(?:conveyance|परिवहन).*?₹?(\d+(?:\.\d{2})?)/i,
            total: /(?:total|कुल).*?₹?(\d+(?:\.\d{2})?)/i
        };

        const info = {};
        for (const [key, pattern] of Object.entries(patterns)) {
            const match = text.match(pattern);
            if (match) {
                info[key] = parseFloat(match[1]);
            }
        }

        // Calculate DA rate if possible
        if (info.daRate && !info.daRatePerDay) {
            info.daRatePerDay = info.daRate; // Assume it's already per day
        }

        return info;
    }

    // Infer department from filename and content
    inferDepartment(text, filename) {
        const filenameLower = filename.toLowerCase();
        const textLower = text.toLowerCase();

        if (filenameLower.includes('vvip') || filenameLower.includes('jhansi')) {
            return 'VVIP Duty Jhansi';
        } else if (filenameLower.includes('qrt') || filenameLower.includes('छिबरामऊ')) {
            return 'QRT Chhibramau';
        } else if (filenameLower.includes('police') || filenameLower.includes('पुलिस')) {
            return 'Police Department';
        } else if (textLower.includes('police') || textLower.includes('पुलिस')) {
            return 'Police Department';
        }

        return 'General Administration';
    }

    // Get all processed data
    getAllProcessedData() {
        return Array.from(this.processedData.entries());
    }

    // Get data for specific file
    getProcessedData(filename) {
        return this.processedData.get(filename);
    }

    // Export data for learning system
    exportForLearning() {
        const learningData = [];

        for (const [filename, data] of this.processedData) {
            if (data.employeeInfo && data.financialInfo && data.department) {
                learningData.push({
                    employeeId: data.employeeInfo.employeeId || `EMP_${filename.split('.')[0]}`,
                    department: data.department,
                    payScale: data.employeeInfo.payScale || 'level3',
                    daRate: data.financialInfo.daRatePerDay || data.financialInfo.daRate || 500,
                    date: data.extractedAt.split('T')[0],
                    source: filename
                });
            }
        }

        return learningData;
    }
}

module.exports = { PDFProcessorAgent };