// PDF Processing Agent for TA/DA Form Analysis
// Extracts travel data from Hindi TA/DA Naksha PDFs (Police/Govt format)

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
            console.log(`📄 Processing TA/DA PDF: ${path.basename(pdfPath)}`);
            const dataBuffer = fs.readFileSync(pdfPath);
            const data = await pdfParse(dataBuffer);
            const text = data.text;
            console.log(`📝 Extracted ${text.length} chars from ${data.numpages} page(s)`);

            const extractedData = this.analyzeTAContent(text, path.basename(pdfPath));
            this.processedData.set(path.basename(pdfPath), extractedData);
            return extractedData;
        } catch (error) {
            console.error(`❌ PDF processing error: ${error.message}`);
            return null;
        }
    }

    // Main analysis function
    analyzeTAContent(text, filename) {
        const data = {
            source: filename,
            department: this.inferDepartment(text, filename),
            employeeInfo: this.extractEmployeeInfo(text),
            journeys: this.extractJourneys(text),
            summary: {},
            extractedAt: new Date().toISOString()
        };

        // Calculate summary
        if (data.journeys.length > 0) {
            data.summary = {
                totalJourneys: data.journeys.length,
                totalDistance: data.journeys.reduce((s, j) => s + (j.distance || 0), 0),
                totalFare: data.journeys.reduce((s, j) => s + (j.fare || 0), 0),
                dateRange: this.getDateRange(data.journeys),
                travelTypes: [...new Set(data.journeys.map(j => j.travelType).filter(Boolean))],
            };
        }

        return data;
    }

    // Extract journey rows from the tabular data
    extractJourneys(text) {
        const journeys = [];

        // Pattern: date (DD-MM-YYYY or DD-MM-YY) followed by time (HH:MM)
        const dateTimePattern = /(\d{2}-\d{2}-\d{2,4})\s*(\d{1,2}:\d{2})/g;
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

        // Find all date-time pairs in the text
        const allDates = [];
        let match;
        while ((match = dateTimePattern.exec(text)) !== null) {
            allDates.push({ date: match[1], time: match[2], index: match.index });
        }

        // Process pairs (departure + arrival)
        for (let i = 0; i < allDates.length - 1; i += 2) {
            const dep = allDates[i];
            const arr = allDates[i + 1];
            if (!dep || !arr) break;

            // Get the text between/around these dates for context
            const contextStart = Math.max(0, dep.index - 10);
            const contextEnd = Math.min(text.length, (allDates[i + 2]?.index || arr.index + 200));
            const context = text.substring(contextStart, contextEnd);

            const journey = {
                departure: { date: dep.date, time: dep.time },
                arrival: { date: arr.date, time: arr.time },
                from: this.extractPlace(context, 'from'),
                to: this.extractPlace(context, 'to'),
                purpose: this.extractPurpose(context),
                travelType: this.extractTravelType(context),
                vehicleType: this.extractVehicleType(context),
                distance: this.extractNumber(context, 'distance'),
                fare: this.extractNumber(context, 'fare'),
                gdNumber: this.extractGDNumber(context),
            };

            journeys.push(journey);
        }

        // If paired approach didn't work well, try line-by-line
        if (journeys.length === 0) {
            return this.extractJourneysLineByLine(text);
        }

        return journeys;
    }

    // Fallback: line-by-line extraction
    extractJourneysLineByLine(text) {
        const journeys = [];
        const datePattern = /\d{2}-\d{2}-\d{2,4}/g;
        const segments = text.split(/(?=\d{2}-\d{2}-\d{2,4})/);

        for (const seg of segments) {
            const dateMatch = seg.match(/(\d{2}-\d{2}-\d{2,4})\s*(\d{1,2}:\d{2})/);
            if (!dateMatch) continue;

            // Look for fare numbers (typically 2-4 digit numbers)
            const numbers = [...seg.matchAll(/\b(\d{1,5})\b/g)].map(m => parseInt(m[1]));
            const fareNumbers = numbers.filter(n => n >= 10 && n <= 5000);
            const distNumbers = numbers.filter(n => n >= 1 && n <= 1000);

            const journey = {
                departure: { date: dateMatch[1], time: dateMatch[2] },
                arrival: { date: '', time: '' },
                from: '',
                to: '',
                purpose: this.extractPurpose(seg),
                travelType: this.extractTravelType(seg),
                vehicleType: this.extractVehicleType(seg),
                distance: distNumbers.length > 0 ? distNumbers[0] : 0,
                fare: fareNumbers.length > 0 ? fareNumbers[fareNumbers.length - 1] : 0,
                gdNumber: this.extractGDNumber(seg),
            };

            // Try to get arrival from same segment
            const allDates = [...seg.matchAll(/(\d{2}-\d{2}-\d{2,4})\s*(\d{1,2}:\d{2})/g)];
            if (allDates.length >= 2) {
                journey.arrival = { date: allDates[1][1], time: allDates[1][2] };
            }

            journeys.push(journey);
        }

        return journeys;
    }

    // Extract place names from context
    extractPlace(context, type) {
        // Hindi place patterns
        const placePatterns = [
            /थाना\s+([^\s,\n]+(?:\s+[^\s,\n]+)?)/,
            /पुलिस\s+लाइन\s+([^\s,\n]+)/,
            /बस\s+स्टैंड\s*([^\s,\n]*)/,
            /कोतवाली\s+([^\s,\n]+)/,
            /([^\s]+)\s+बस\s+स्टैंड/,
            /रिसर्व\s*पुलिस\s+लाइन\s+([^\s,\n]+)/i,
            /įरसेवő\s+पुिलस\s+लाइन\s+([^\s,\n]+)/,
            /įरज़वŊ\s+पुिलस\s+लाइन\s+([^\s,\n]+)/,
        ];

        for (const p of placePatterns) {
            const m = context.match(p);
            if (m) return m[0].trim().substring(0, 50);
        }

        // Try to find known places
        const knownPlaces = ['झाांसी', 'झांसी', 'उरई', 'कɄौज', 'कानपुर', 'छिबरामऊ', 'छिबिामऊ',
            'सौरीख', 'सौरिख', 'एरवा कटरा', 'नॉएडा', 'अयोȯा', 'अयोध्या', 'लखनऊ'];
        for (const place of knownPlaces) {
            if (context.includes(place)) return place;
        }

        return '';
    }

    // Extract purpose of travel
    extractPurpose(context) {
        const purposes = [
            { pattern: /VVIP|वी०आई०पी|vvip/i, label: 'VVIP Duty' },
            { pattern: /QRT|क्यू.*आर.*टी|क्य.*आिटी/i, label: 'QRT Duty' },
            { pattern: /कमान\s*ड्यूटी|कमान\s*ǰूटी/i, label: 'Command Duty' },
            { pattern: /गनर\s*ड्यूटी|गनर\s*ǰूटी/i, label: 'Gunner Duty' },
            { pattern: /ड्यूटी|ǰूटी|duty/i, label: 'Duty' },
            { pattern: /प्रशिक्षण|training/i, label: 'Training' },
            { pattern: /कोर्ट|court/i, label: 'Court' },
        ];

        for (const { pattern, label } of purposes) {
            if (pattern.test(context)) return label;
        }
        return 'Official Duty';
    }

    // Extract travel type
    extractTravelType(context) {
        if (/बस\s*से|बस\s*रोडवेज|रोडवेज/i.test(context)) return 'Bus';
        if (/ऑटो|auto/i.test(context)) return 'Auto';
        if (/ट्रेन|train|रेल/i.test(context)) return 'Train';
        if (/प्राइवेट|private|Ůाइवेट/i.test(context)) return 'Private';
        if (/सरकारी|govt/i.test(context)) return 'Government';
        return 'Bus';
    }

    // Extract vehicle type
    extractVehicleType(context) {
        if (/प्राइवेट\s*बस|Ůाइवेट/i.test(context)) return 'Private Bus';
        if (/सरकारी\s*बस|सरकारी/i.test(context)) return 'Government Bus';
        if (/रोडवेज/i.test(context)) return 'Roadways Bus';
        if (/ऑटो/i.test(context)) return 'Auto Rickshaw';
        return '';
    }

    // Extract numbers (distance/fare)
    extractNumber(context, type) {
        const numbers = [...context.matchAll(/\b(\d{1,5})\b/g)].map(m => parseInt(m[1]));
        if (type === 'fare') {
            // Fare is typically 10-5000
            const fares = numbers.filter(n => n >= 10 && n <= 5000);
            return fares.length > 0 ? fares[fares.length - 1] : 0;
        }
        if (type === 'distance') {
            // Distance typically 1-1000 km
            const dists = numbers.filter(n => n >= 1 && n <= 1000);
            return dists.length > 0 ? dists[0] : 0;
        }
        return 0;
    }

    // Extract GD number
    extractGDNumber(context) {
        const m = context.match(/\b(\d{2,6})\s*$/m) || context.match(/जी.*डी.*?(\d+)/);
        return m ? m[1] : '';
    }

    // Extract employee information
    extractEmployeeInfo(text) {
        const info = {};

        // Name patterns
        const nameMatch = text.match(/नाम\s*(?:व\s*)?(?:पद\s*(?:व\s*)?)?(?:नाम)?[\s:]*([^\n\r,]{3,30})/);
        if (nameMatch && nameMatch[1].trim().length > 2) {
            info.name = nameMatch[1].trim();
        }

        // PNO
        const pnoMatch = text.match(/(?:पीएनओ|PNO)\s*(?:नंबर)?\s*:?\s*([A-Z0-9]+)/i);
        if (pnoMatch) info.pno = pnoMatch[1];

        // Designation
        const desigMatch = text.match(/(?:पदनाम|पद)\s*:?\s*([^\n\r,]{3,30})/);
        if (desigMatch) info.designation = desigMatch[1].trim();

        // Pay scale / Vetan
        const payMatch = text.match(/(?:वेतन|वेतनमान)\s*:?\s*([^\n\r,]{2,20})/);
        if (payMatch) info.payScale = payMatch[1].trim();

        return info;
    }

    // Infer department from filename and content
    inferDepartment(text, filename) {
        const combined = (filename + ' ' + text.substring(0, 500)).toLowerCase();

        if (combined.includes('vvip') || combined.includes('वी०आई०पी')) return 'VVIP Duty';
        if (combined.includes('qrt') || combined.includes('क्यू आर टी')) return 'QRT Unit';
        if (combined.includes('छिबरामऊ') || combined.includes('छिबिामऊ')) return 'QRT Chhibramau';
        if (combined.includes('jhansi') || combined.includes('झांसी') || combined.includes('झाांसी')) return 'Jhansi Police';
        if (combined.includes('नागरिक') || combined.includes('नागरिक पुलिस')) return 'Nagrik Police';
        if (combined.includes('police') || combined.includes('पुलिस') || combined.includes('पुिलस')) return 'Police Department';
        if (combined.includes('रोहोत') || combined.includes('rohit')) return 'Reserve Police';

        return 'Police Department';
    }

    // Get date range from journeys
    getDateRange(journeys) {
        const dates = journeys
            .map(j => j.departure?.date)
            .filter(Boolean)
            .sort();
        if (dates.length === 0) return '';
        if (dates.length === 1) return dates[0];
        return `${dates[0]} to ${dates[dates.length - 1]}`;
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
            learningData.push({
                source: filename,
                department: data.department,
                employee: data.employeeInfo,
                totalJourneys: data.summary?.totalJourneys || 0,
                totalDistance: data.summary?.totalDistance || 0,
                totalFare: data.summary?.totalFare || 0,
                dateRange: data.summary?.dateRange || '',
                travelTypes: data.summary?.travelTypes || [],
            });
        }
        return learningData;
    }

    // Generate filled TA-DA form output (naksha format)
    generateNakshaOutput(data) {
        let output = '';
        output += `═══════════════════════════════════════════════════════\n`;
        output += `  नक्शा डी०ए०/टी०ए० — ${data.department}\n`;
        output += `═══════════════════════════════════════════════════════\n`;
        output += `📄 Source: ${data.source}\n`;
        if (data.employeeInfo?.name) output += `👤 Name: ${data.employeeInfo.name}\n`;
        if (data.employeeInfo?.designation) output += `📋 Designation: ${data.employeeInfo.designation}\n`;
        output += `\n`;
        output += `┌──────────────┬────────┬──────────────┬────────┬─────────────┬──────┬───────┐\n`;
        output += `│ Departure    │ Time   │ Arrival      │ Time   │ Purpose     │ Dist │ Fare  │\n`;
        output += `├──────────────┼────────┼──────────────┼────────┼─────────────┼──────┼───────┤\n`;

        for (const j of (data.journeys || [])) {
            const dep = `${j.departure?.date || ''}`.padEnd(12);
            const depT = `${j.departure?.time || ''}`.padEnd(6);
            const arr = `${j.arrival?.date || ''}`.padEnd(12);
            const arrT = `${j.arrival?.time || ''}`.padEnd(6);
            const purpose = `${j.purpose || ''}`.substring(0, 11).padEnd(11);
            const dist = `${j.distance || 0}`.padStart(4);
            const fare = `₹${j.fare || 0}`.padStart(5);
            output += `│ ${dep} │ ${depT} │ ${arr} │ ${arrT} │ ${purpose} │ ${dist} │ ${fare} │\n`;
        }

        output += `└──────────────┴────────┴──────────────┴────────┴─────────────┴──────┴───────┘\n`;
        output += `\n`;
        output += `📊 Summary:\n`;
        output += `   Total Journeys: ${data.summary?.totalJourneys || 0}\n`;
        output += `   Total Distance: ${data.summary?.totalDistance || 0} km\n`;
        output += `   Total Fare: ₹${data.summary?.totalFare || 0}\n`;
        output += `   Date Range: ${data.summary?.dateRange || 'N/A'}\n`;
        output += `   Travel Types: ${(data.summary?.travelTypes || []).join(', ')}\n`;

        return output;
    }
}

module.exports = { PDFProcessorAgent };
