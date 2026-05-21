// DA Rate Learning System for Harshita AI
// Learns from historical TA/DA submissions to provide accurate department-specific rates

class DARateLearner {
    constructor() {
        this.historicalData = new Map(); // department -> employee -> submissions
        this.departmentRates = new Map(); // department -> average DA rate
        this.employeeHistory = new Map(); // employee -> department history
        this.learningEnabled = true;
    }

    // Add historical TA/DA submission data
    addHistoricalSubmission(employeeId, department, payScale, daRate, submissionDate) {
        if (!this.historicalData.has(department)) {
            this.historicalData.set(department, new Map());
        }

        if (!this.historicalData.get(department).has(employeeId)) {
            this.historicalData.get(department).set(employeeId, []);
        }

        this.historicalData.get(department).get(employeeId).push({
            payScale,
            daRate,
            date: submissionDate
        });

        // Update employee department history
        if (!this.employeeHistory.has(employeeId)) {
            this.employeeHistory.set(employeeId, []);
        }
        this.employeeHistory.get(employeeId).push({
            department,
            daRate,
            date: submissionDate
        });

        this.updateDepartmentRates(department);
    }

    // Update average DA rates for department
    updateDepartmentRates(department) {
        const deptData = this.historicalData.get(department);
        if (!deptData) return;

        let totalRate = 0;
        let count = 0;

        for (const employeeSubmissions of deptData.values()) {
            for (const submission of employeeSubmissions) {
                totalRate += submission.daRate;
                count++;
            }
        }

        if (count > 0) {
            this.departmentRates.set(department, totalRate / count);
        }
    }

    // Get recommended DA rate for employee
    getRecommendedDARate(employeeId, department, payScale) {
        // First, check employee's historical rates in this department
        if (this.employeeHistory.has(employeeId)) {
            const employeeDepts = this.employeeHistory.get(employeeId);
            const deptHistory = employeeDepts.filter(h => h.department === department);

            if (deptHistory.length > 0) {
                // Return the most recent DA rate for this employee in this department
                const sortedHistory = deptHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
                return sortedHistory[0].daRate;
            }
        }

        // If no employee history, use department average
        if (this.departmentRates.has(department)) {
            return this.departmentRates.get(department);
        }

        // Fallback to standard rates based on pay scale
        return this.getStandardDARate(payScale);
    }

    // Get standard DA rates (government rules)
    getStandardDARate(payScale) {
        const standardRates = {
            'level1': 450, // Level 1-5
            'level2': 500, // Level 6-8
            'level3': 650, // Level 9-11
            'level4': 750  // Level 12-13
        };
        return standardRates[payScale] || 500;
    }

    // Get department suggestions based on employee history
    getDepartmentSuggestions(employeeId) {
        if (!this.employeeHistory.has(employeeId)) {
            return [];
        }

        const deptCount = {};
        const employeeDepts = this.employeeHistory.get(employeeId);

        employeeDepts.forEach(entry => {
            deptCount[entry.department] = (deptCount[entry.department] || 0) + 1;
        });

        return Object.entries(deptCount)
            .sort(([,a], [,b]) => b - a)
            .map(([dept, count]) => ({ department: dept, submissionCount: count }));
    }

    // Import data from PDF analysis (simulated)
    importFromPDFAnalysis(pdfData) {
        // This would be called after PDF OCR processing
        // pdfData format: { employeeId, department, payScale, daRate, date }
        this.addHistoricalSubmission(
            pdfData.employeeId,
            pdfData.department,
            pdfData.payScale,
            pdfData.daRate,
            pdfData.date
        );
    }

    // Get learning statistics
    getLearningStats() {
        return {
            totalDepartments: this.historicalData.size,
            totalEmployees: this.employeeHistory.size,
            departmentRates: Object.fromEntries(this.departmentRates),
            learningEnabled: this.learningEnabled
        };
    }

    // Enable/disable learning
    setLearningMode(enabled) {
        this.learningEnabled = enabled;
    }
}

// Global instance
const daRateLearner = new DARateLearner();

// Sample historical data (would be loaded from database/PDFs)
daRateLearner.addHistoricalSubmission('EMP001', 'Police Department', 'level3', 650, '2024-01-15');
daRateLearner.addHistoricalSubmission('EMP001', 'Police Department', 'level3', 650, '2024-02-20');
daRateLearner.addHistoricalSubmission('EMP002', 'VVIP Duty', 'level4', 750, '2024-01-10');
daRateLearner.addHistoricalSubmission('EMP003', 'QRT Chhibramau', 'level3', 700, '2024-03-05');

module.exports = { DARateLearner, daRateLearner };