// Project Report Generation Agent
// Learns from project report PDFs and generates business project reports automatically

const fs = require('fs');
const path = require('path');

class ProjectReportAgent {
    constructor() {
        this.templates = new Map();
        this.formulas = new Map();
        this.learnedReports = new Map();
        this.loadDefaultTemplates();
        this.loadDefaultFormulas();
    }

    // Load default templates based on analyzed PDF
    loadDefaultTemplates() {
        this.templates.set('pmegp_business', {
            sections: [
                'project_at_glance',
                'entrepreneur_details',
                'cost_of_project',
                'machinery_equipment',
                'means_of_financing',
                'working_capital',
                'repayment_schedule',
                'depreciation_schedule',
                'production_sales',
                'expenses',
                'profit_loss_projection',
                'balance_sheet',
                'cash_flow',
                'ratios_analysis',
                'conclusion'
            ],
            structure: {
                project_at_glance: {
                    project_name: '',
                    entrepreneur_name: '',
                    address: '',
                    constitution: 'Individual',
                    cost_of_project: 0,
                    means_of_finance: {},
                    payback_period: '',
                    implementation_period: '',
                    break_even_point: '',
                    power_requirement: '',
                    employment_generation: '',
                    raw_materials: ''
                },
                cost_of_project: {
                    fixed_capital: {
                        machinery: 0,
                        workshed: 0,
                        preliminary: 0,
                        furniture: 0,
                        contingency: 0
                    },
                    working_capital: 0
                }
            }
        });
    }

    // Load formulas from analyzed PDF
    loadDefaultFormulas() {
        this.formulas.set('depreciation', {
            description: 'Straight-line depreciation calculation',
            calculate: (cost, rate, year, totalYears = 10) => {
                if (year > totalYears) return 0;
                return (cost * rate * year) / 100; // Cumulative depreciation
            }
        });

        this.formulas.set('dscr', {
            description: 'Debt Service Coverage Ratio',
            calculate: (netProfit, depreciation, interestTerm, installment, interestWC = 0) => {
                const numerator = netProfit + depreciation;
                const denominator = interestTerm + installment + interestWC;
                return denominator > 0 ? (numerator / denominator) : 0;
            }
        });

        this.formulas.set('break_even', {
            description: 'Break-even point percentage',
            calculate: (fixedCost, sales, variableCost) => {
                const contribution = sales - variableCost;
                return contribution > 0 ? ((fixedCost / contribution) * 100) : 0;
            }
        });

        this.formulas.set('net_profit', {
            description: 'Net profit calculation',
            calculate: (sales, productionCost, adminCost, depreciation, interest) => {
                return sales - productionCost - adminCost - depreciation - interest;
            }
        });

        this.formulas.set('working_capital', {
            description: 'Working capital requirement',
            calculate: (rawMaterials, workInProgress, finishedGoods, receivables, expenses) => {
                return (rawMaterials * 1.5) + workInProgress + finishedGoods + receivables + expenses;
            }
        });
    }

    // Learn from a project report PDF
    async learnFromReport(pdfPath) {
        try {
            console.log(`📚 Learning from project report: ${pdfPath}`);

            // In a real implementation, this would use PDF parsing
            // For now, we'll simulate learning from the Narayan report

            const reportKey = path.basename(pdfPath, '.pdf');
            const learnedData = {
                template: 'pmegp_business',
                formulas: Array.from(this.formulas.keys()),
                assumptions: {
                    capacityUtilization: [70, 80, 85, 90, 90], // Year 1-5
                    interestRate: 5,
                    depreciationRate: 10,
                    repaymentPeriod: 8,
                    implementationPeriod: 4
                },
                learnedAt: new Date().toISOString()
            };

            this.learnedReports.set(reportKey, learnedData);
            console.log(`✅ Learned patterns from ${reportKey}`);

            return learnedData;
        } catch (error) {
            console.error(`❌ Learning error for ${pdfPath}:`, error.message);
            return null;
        }
    }

    // Generate a project report based on learned templates
    async generateReport(inputs, templateType = 'pmegp_business') {
        try {
            console.log(`📄 Generating project report using ${templateType} template`);

            const template = this.templates.get(templateType);
            if (!template) {
                throw new Error(`Template ${templateType} not found`);
            }

            const report = {
                metadata: {
                    generatedAt: new Date().toISOString(),
                    template: templateType,
                    version: '1.0'
                },
                sections: {}
            };

            // Generate each section
            for (const section of template.sections) {
                report.sections[section] = await this.generateSection(section, inputs);
            }

            // Apply formulas for calculations
            report.calculations = this.applyFormulas(inputs);

            console.log(`✅ Generated complete project report`);
            return report;
        } catch (error) {
            console.error(`❌ Report generation error:`, error.message);
            return null;
        }
    }

    // Generate individual report section
    async generateSection(sectionName, inputs) {
        switch (sectionName) {
            case 'project_at_glance':
                return {
                    project_name: inputs.projectName || 'Business Project',
                    entrepreneur_name: inputs.entrepreneurName || 'Entrepreneur Name',
                    address: inputs.address || 'Business Address',
                    constitution: inputs.constitution || 'Individual',
                    cost_of_project: inputs.totalCost || 0,
                    means_of_finance: inputs.finance || {},
                    payback_period: inputs.paybackPeriod || '5 Years',
                    implementation_period: inputs.implementationPeriod || '4 Months',
                    break_even_point: inputs.breakEvenPoint || '50%',
                    power_requirement: inputs.powerRequirement || '5 KW',
                    employment_generation: inputs.employment || '5 Persons',
                    raw_materials: inputs.rawMaterials || 'Local Materials'
                };

            case 'cost_of_project':
                return {
                    fixed_capital: {
                        machinery: inputs.machineryCost || 0,
                        workshed: inputs.workshedCost || 0,
                        preliminary: inputs.preliminaryCost || 0,
                        furniture: inputs.furnitureCost || 0,
                        contingency: inputs.contingencyCost || 0
                    },
                    working_capital: inputs.workingCapital || 0
                };

            case 'profit_loss_projection':
                return this.generateProfitLossProjection(inputs);

            case 'balance_sheet':
                return this.generateBalanceSheet(inputs);

            case 'cash_flow':
                return this.generateCashFlow(inputs);

            default:
                return { message: `${sectionName} section generated` };
        }
    }

    // Generate profit & loss projection
    generateProfitLossProjection(inputs) {
        const years = inputs.projectionYears || 5;
        const projection = [];

        for (let year = 1; year <= years; year++) {
            const sales = inputs.salesProjection?.[year - 1] || 0;
            const productionCost = inputs.productionCost?.[year - 1] || 0;
            const adminCost = inputs.adminCost?.[year - 1] || 0;

            const depreciation = this.formulas.get('depreciation').calculate(
                inputs.machineryCost || 0, 10, year
            );

            const interest = inputs.interestProjection?.[year - 1] || 0;
            const netProfit = this.formulas.get('net_profit').calculate(
                sales, productionCost, adminCost, depreciation, interest
            );

            projection.push({
                year,
                sales,
                production_cost: productionCost,
                administrative_cost: adminCost,
                depreciation,
                interest,
                net_profit: netProfit
            });
        }

        return projection;
    }

    // Generate balance sheet
    generateBalanceSheet(inputs) {
        // Simplified balance sheet generation
        return {
            liabilities: {
                capital: inputs.ownCapital || 0,
                term_loan: inputs.termLoan || 0,
                working_capital_loan: inputs.workingCapitalLoan || 0
            },
            assets: {
                fixed_assets: inputs.machineryCost || 0,
                current_assets: inputs.workingCapital || 0
            }
        };
    }

    // Generate cash flow
    generateCashFlow(inputs) {
        // Simplified cash flow
        return {
            operating_activities: inputs.netProfit || 0,
            investing_activities: -(inputs.machineryCost || 0),
            financing_activities: (inputs.termLoan || 0) + (inputs.ownCapital || 0)
        };
    }

    // Apply all formulas for calculations
    applyFormulas(inputs) {
        const calculations = {};

        // Break-even analysis
        const fixedCost = (inputs.adminCost?.[0] || 0) + (inputs.preliminaryCost || 0);
        const sales = inputs.salesProjection?.[0] || 0;
        const variableCost = inputs.productionCost?.[0] || 0;

        calculations.break_even_point = this.formulas.get('break_even').calculate(
            fixedCost, sales, variableCost
        );

        // DSCR for each year
        calculations.dscr = [];
        const plProjection = this.generateProfitLossProjection(inputs);
        for (const year of plProjection) {
            const dscr = this.formulas.get('dscr').calculate(
                year.net_profit,
                year.depreciation,
                year.interest,
                inputs.installment || 0
            );
            calculations.dscr.push({
                year: year.year,
                dscr: dscr
            });
        }

        return calculations;
    }

    // Export report as PDF/HTML
    async exportReport(report, format = 'html') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `project_report_${timestamp}`;

        if (format === 'html') {
            const html = this.generateHTMLReport(report);
            const filePath = path.join(__dirname, '../../output', `${filename}.html`);
            fs.writeFileSync(filePath, html, 'utf8');
            return filePath;
        }

        // For PDF, would need additional library
        return null;
    }

    // Generate HTML report
    generateHTMLReport(report) {
        let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Project Report - ${report.metadata?.template || 'Business'}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .section { margin-bottom: 30px; border: 1px solid #ddd; padding: 20px; }
                .section h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 5px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f8f9fa; }
                .highlight { background-color: #e9ecef; }
            </style>
        </head>
        <body>
            <h1>Project Report</h1>
            <p><strong>Generated:</strong> ${report.metadata?.generatedAt || new Date().toISOString()}</p>
            <p><strong>Template:</strong> ${report.metadata?.template || 'Business'}</p>
        `;

        // Add each section
        for (const [sectionName, sectionData] of Object.entries(report.sections || {})) {
            html += `<div class="section">`;
            html += `<h2>${sectionName.replace(/_/g, ' ').toUpperCase()}</h2>`;

            if (Array.isArray(sectionData)) {
                html += '<table>';
                if (sectionData.length > 0) {
                    html += '<tr>';
                    Object.keys(sectionData[0]).forEach(key => {
                        html += `<th>${key.replace(/_/g, ' ').toUpperCase()}</th>`;
                    });
                    html += '</tr>';

                    sectionData.forEach(row => {
                        html += '<tr>';
                        Object.values(row).forEach(value => {
                            html += `<td>${value}</td>`;
                        });
                        html += '</tr>';
                    });
                }
                html += '</table>';
            } else if (typeof sectionData === 'object') {
                html += '<table>';
                for (const [key, value] of Object.entries(sectionData)) {
                    html += `<tr><td>${key.replace(/_/g, ' ').toUpperCase()}</td><td>${JSON.stringify(value)}</td></tr>`;
                }
                html += '</table>';
            } else {
                html += `<p>${sectionData}</p>`;
            }

            html += '</div>';
        }

        // Add calculations
        if (report.calculations) {
            html += `<div class="section">`;
            html += `<h2>CALCULATIONS & ANALYSIS</h2>`;
            html += `<p><strong>Break-even Point:</strong> ${report.calculations.break_even_point?.toFixed(2)}%</p>`;

            if (report.calculations.dscr) {
                html += '<h3>DSCR Analysis</h3><table>';
                html += '<tr><th>Year</th><th>DSCR</th></tr>';
                report.calculations.dscr.forEach(item => {
                    html += `<tr><td>${item.year}</td><td>${item.dscr.toFixed(2)}</td></tr>`;
                });
                html += '</table>';
            }
            html += '</div>';
        }

        html += '</body></html>';
        return html;
    }

    // Get learning statistics
    getLearningStats() {
        return {
            learnedReports: this.learnedReports.size,
            availableTemplates: Array.from(this.templates.keys()),
            availableFormulas: Array.from(this.formulas.keys()),
            learningEnabled: true
        };
    }
}

module.exports = { ProjectReportAgent };