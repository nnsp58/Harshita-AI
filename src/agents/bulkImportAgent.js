/**
 * BulkImportAgent
 * 
 * VLE ek Excel file upload karta hai jisme multiple candidates hote hain.
 * Yeh agent Excel ko parse karke har candidate ka record banata hai
 * aur batch mein automation jobs queue karta hai.
 * 
 * Cost: ₹0 — uses 'xlsx' library (free, open-source)
 * 
 * Excel Format (har row = 1 candidate):
 * Name | Father Name | DOB | Gender | Category | Aadhaar | PAN | Phone | Email | Address | State | District | Pincode | Service
 */

const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// Expected column headers (case-insensitive matching)
const COLUMN_MAP = {
  'name': 'fullName',
  'full name': 'fullName',
  'candidate name': 'fullName',
  'pura naam': 'fullName',

  'father name': 'fatherName',
  'father\'s name': 'fatherName',
  'pita ka naam': 'fatherName',

  'mother name': 'motherName',
  'mother\'s name': 'motherName',

  'dob': 'dob',
  'date of birth': 'dob',
  'janm tithi': 'dob',
  'birth date': 'dob',

  'gender': 'gender',
  'ling': 'gender',

  'category': 'category',
  'caste': 'category',
  'varg': 'category',

  'aadhaar': 'aadhaar',
  'aadhar': 'aadhaar',
  'aadhaar no': 'aadhaar',
  'aadhar number': 'aadhaar',

  'pan': 'pan',
  'pan no': 'pan',
  'pan number': 'pan',

  'phone': 'phone',
  'mobile': 'phone',
  'mobile no': 'phone',
  'phone number': 'phone',
  'mobile number': 'phone',

  'email': 'email',
  'email id': 'email',

  'address': 'address',
  'pata': 'address',

  'state': 'state',
  'rajya': 'state',

  'district': 'district',
  'jila': 'district',

  'pincode': 'pincode',
  'pin': 'pincode',
  'pin code': 'pincode',

  'service': 'serviceType',
  'service type': 'serviceType',
  'seva': 'serviceType',
  'portal': 'serviceType',
};

class BulkImportAgent {
  /**
   * Parse Excel file and return array of candidate profiles
   * @param {string} filePath - Path to uploaded .xlsx or .csv file
   * @returns {{ candidates: Array, errors: Array, total: number }}
   */
  async parseExcel(filePath) {
    console.log(`[BulkImport] Parsing: ${filePath}`);

    const ext = path.extname(filePath).toLowerCase();
    if (!['.xlsx', '.xls', '.csv'].includes(ext)) {
      throw new Error(`Unsupported file format: ${ext}. Use .xlsx, .xls, or .csv`);
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1); // First worksheet

    // Convert to array of objects (first row = headers)
    const rawRows = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header row
        const rowData = {};
        row.eachCell((cell, colNumber) => {
          const headerCell = worksheet.getCell(1, colNumber);
          if (headerCell && headerCell.value) {
            rowData[headerCell.value.toString()] = cell.value || '';
          }
        });
        rawRows.push(rowData);
      }
    });

    if (rawRows.length === 0) {
      throw new Error('Excel file is empty or has no data rows');
    }

    const candidates = [];
    const errors = [];

    rawRows.forEach((row, idx) => {
      try {
        const candidate = this._mapRow(row, idx + 2); // +2 because row 1 = header
        if (candidate) candidates.push(candidate);
      } catch (err) {
        errors.push({ row: idx + 2, error: err.message, data: row });
      }
    });

    console.log(`[BulkImport] ✅ Parsed ${candidates.length} candidates, ${errors.length} errors`);
    return { candidates, errors, total: rawRows.length, sheet: sheetName };
  }

  _mapRow(row, rowNum) {
    const mapped = {};

    // Normalize column headers and map to our field names
    for (const [rawCol, value] of Object.entries(row)) {
      const normalizedCol = rawCol.trim().toLowerCase();
      const fieldName = COLUMN_MAP[normalizedCol];
      if (fieldName && value !== '') {
        mapped[fieldName] = String(value).trim();
      }
    }

    // Require at minimum: name + phone OR aadhaar
    if (!mapped.fullName) {
      throw new Error(`Row ${rowNum}: Name (naam) column missing or empty`);
    }
    if (!mapped.phone && !mapped.aadhaar) {
      throw new Error(`Row ${rowNum}: Need at least Phone or Aadhaar for ${mapped.fullName}`);
    }

    // Normalize service type
    if (mapped.serviceType) {
      mapped.serviceType = this._normalizeService(mapped.serviceType);
    }

    // Build structured candidate profile (matches what BaseBot expects)
    return {
      rowNum,
      personal: {
        fullName: mapped.fullName || '',
        fatherName: mapped.fatherName || '',
        motherName: mapped.motherName || '',
        dob: mapped.dob || '',
        gender: mapped.gender || '',
        category: mapped.category || '',
      },
      contact: {
        phone: mapped.phone || '',
        email: mapped.email || '',
      },
      documents: {
        aadhaar: mapped.aadhaar || '',
        pan: mapped.pan || '',
      },
      address: {
        line1: mapped.address || '',
        state: mapped.state || '',
        district: mapped.district || '',
        pincode: mapped.pincode || '',
      },
      serviceType: mapped.serviceType || null, // Which portal to fill
      _rawRow: mapped,
    };
  }

  _normalizeService(service) {
    const s = service.toLowerCase().trim();
    if (s.includes('ssc')) return 'ssc';
    if (s.includes('army') || s.includes('sainik')) return 'army';
    if (s.includes('railway') || s.includes('rrb')) return 'railway';
    if (s.includes('bank') || s.includes('ibps') || s.includes('sbi')) return 'banking';
    if (s.includes('police')) return 'police';
    if (s.includes('postal') || s.includes('post')) return 'postal';
    if (s.includes('ration')) return 'ration';
    if (s.includes('apprentice')) return 'apprenticeship';
    return s;
  }

  /**
   * Generate a sample Excel template file for VLEs
   * @returns {string} path to generated template
   */
  async generateTemplate(outputDir = process.cwd()) {
    const templatePath = path.join(outputDir, 'candidate_bulk_template.xlsx');

    const headers = [
      'Name', 'Father Name', 'Mother Name', 'DOB', 'Gender', 'Category',
      'Aadhaar', 'PAN', 'Phone', 'Email',
      'Address', 'State', 'District', 'Pincode', 'Service'
    ];

    const sampleRows = [
      ['Ramesh Kumar',   'Suresh Kumar',   'Meena Devi',  '15/08/1998', 'Male',   'OBC', '987654321012', 'ABCDE1234F', '9876543210', 'ramesh@gmail.com', 'Village Bhadohi', 'Uttar Pradesh', 'Varanasi',   '221010', 'SSC'],
      ['Sunita Sharma',  'Rajesh Sharma',  'Kavita Devi', '22/03/2000', 'Female', 'SC',  '123456789012', 'XYZAB5678G', '8765432109', 'sunita@gmail.com', 'Mohalla Kashipur', 'Uttar Pradesh', 'Allahabad', '211001', 'Army'],
      ['Amit Yadav',     'Vinod Yadav',    'Rekha Devi',  '05/11/1999', 'Male',   'OBC', '456789012345', 'PQRST9012H', '7654321098', 'amit@gmail.com',   'Near Railway Station', 'Bihar',       'Patna',     '800001', 'Railway'],
    ];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Candidates');

    // Add headers
    worksheet.addRow(headers);

    // Add sample data
    sampleRows.forEach(row => worksheet.addRow(row));

    // Style columns
    worksheet.columns = headers.map(() => ({ width: 15 }));

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }
    };

    await workbook.xlsx.writeFile(templatePath);

    console.log(`[BulkImport] ✅ Template generated: ${templatePath}`);
    return templatePath;
  }
}

module.exports = { BulkImportAgent };
