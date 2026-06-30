const { BaseSkill } = require('./BaseSkill');
const { z } = require('zod');
const { MathSolver } = require('../utils/MathSolver');

class MathSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'math_skill';
    this.displayName = 'गणित और कैलकुलेटर';
    this.displayNameEn = 'Mathematics & Calculator';
    this.category = 'math';
    this.description = 'गणित के सवाल, प्रतिशत, अनुपात और ब्याज (EMI/Tax) निकालता है।';
    this.descriptionEn = 'Calculates basic math, percentage, ratio, and financial math (EMI/Tax).';
    
    this.intents = [
      'math_arithmetic',
      'math_percentage',
      'math_average',
      'math_ratio',
      'math_statistics',
      'math_financial',
      'math_scientific',
      'math_emi',
      'math_tax',
      'math_interest',
      'math_algebra',
      'math_calculus'
    ];
    
    this.keywords = {
      hi: ['गणित', 'जोड़ो', 'घटाओ', 'गुणा', 'भाग', 'प्रतिशत', 'ब्याज', 'कैलकुलेटर', 'अवकलन', 'समाकलन', 'बीजगणित', 'हल'],
      en: ['math', 'calculate', 'add', 'subtract', 'multiply', 'divide', 'percentage', 'interest', 'emi', 'algebra', 'calculus', 'integrate', 'derive', 'solve'],
      hinglish: ['hisab', 'guna', 'bhag', 'jodo', 'percent', 'byaj', 'solve']
    };

    this.canRunOffline = true; // Pure computation
    this.priority = 7;

    // Define specific input schema
    this.inputSchema = z.object({
      operation: z.enum(['add', 'subtract', 'multiply', 'divide', 'percentage', 'emi', 'interest', 'evaluate']).optional(),
      expression: z.string().optional(),
      numbers: z.array(z.number()).optional(),
      principal: z.number().optional(),
      rate: z.number().optional(),
      time: z.number().optional(),
    });
  }

  async execute(context) {
    const { message, intent, params = {} } = context;
    const lowerMessage = message.toLowerCase();

    // 1. Calculus (Derivatives & Integrals)
    if (lowerMessage.includes('integrate') || lowerMessage.includes('integral') || lowerMessage.includes('समाकलन')) {
      const match = lowerMessage.match(/integrate\s+([a-z0-9\+\-\*\/\^\(\)\s]+)/);
      if (match) {
        const expr = match[1].trim();
        const result = MathSolver.integrate(expr);
        return this._routeOutput(`Integral of ${expr}`, `### Calculus: Integration\n\n**Problem:**\nFind the integral of ${expr}\n\n**Result:**\n${result} + C\n\n**Explanation:**\nThis is derived using symbolic integration rules.`, true);
      }
    }

    if (lowerMessage.includes('derivative') || lowerMessage.includes('differentiate') || lowerMessage.includes('अवकलन')) {
      const match = lowerMessage.match(/(?:derivative|differentiate|diff)\s+(?:of\s+)?([a-z0-9\+\-\*\/\^\(\)\s]+)/);
      if (match) {
        const expr = match[1].trim();
        const result = MathSolver.derivative(expr);
        return this._routeOutput(`Derivative of ${expr}`, `### Calculus: Differentiation\n\n**Problem:**\nFind the derivative of ${expr}\n\n**Result:**\n${result}\n\n**Explanation:**\nThis is derived using symbolic differentiation rules.`, true);
      }
    }

    // 2. Algebra (Solving equations)
    if (lowerMessage.includes('solve') || lowerMessage.includes('हल करें')) {
      const match = lowerMessage.match(/solve\s+([a-z0-9\+\-\*\/\^\(\)\s\=]+)/);
      if (match) {
        const expr = match[1].trim();
        const result = MathSolver.solveEquation(expr);
        return this._routeOutput(`Solution for ${expr}`, `### Algebra: Equation Solving\n\n**Equation:**\n${expr}\n\n**Solution:**\n${result}`, true);
      }
    }

    // 3. Try to safely evaluate a standard mathematical expression if found
    const expressionMatch = message.match(/[0-9]+(?:\.[0-9]+)?\s*[\+\-\*\/\%\^]\s*[0-9]+(?:\.[0-9]+)?/);
    if (expressionMatch && !lowerMessage.includes('solve')) {
      try {
        const expr = message.replace(/[a-zA-Z]/g, '').trim();
        if (expr.match(/^[0-9\+\-\*\/\%\^\.\(\)\s]+$/)) {
          const result = MathSolver.evaluate(expr);
          return this._routeOutput('Calculation', `${expr} = **${result}**`, false);
        }
      } catch (e) {
        // Fallback
      }
    }

    // 4. EMI calculation fallback pattern
    if (intent === 'math_emi' || lowerMessage.includes('emi')) {
      return this._calculateEMI(message);
    }

    return this._reply('मैं गणित, बीजगणित (Algebra), और कैलकुलस (Calculus) हल कर सकती हूँ। कृपया अपना सवाल बताएं। (जैसे: "integrate x^2" या "solve x^2 + 2x + 1 = 0")');
  }

  _routeOutput(title, content, isLongDerivation) {
    if (isLongDerivation) {
      // P0 Requirement: Long derivations go to Document Workspace
      // We prepend 'REPORT' so the frontend detects it as a document
      return this._reply(`REPORT: ${title}\n\n${content}`, { category: 'document' });
    }
    return this._reply(content, { category: 'conversation' });
  }

  _calculateEMI(message) {
    // Basic extraction logic
    const numbers = message.match(/\d+(?:\.\d+)?/g);
    if (numbers && numbers.length >= 3) {
      const p = parseFloat(numbers[0]);
      const r = parseFloat(numbers[1]) / 12 / 100;
      const n = parseFloat(numbers[2]); // Assuming months
      const emi = MathSolver.calculateEMI(p, r * 12 * 100, n);
      return this._routeOutput('EMI Calculation', `आपके लोन की अनुमानित EMI होगी: **₹${emi.toFixed(2)}** प्रति माह।`, false);
    }
    return this._reply('EMI निकालने के लिए मुझे मूलधन (Loan amount), ब्याज दर (Interest Rate) और समय (महीनों में) बताएं।');
  }

  async verify(input, result) {
    if (!result || !result.message) {
      return { verified: false, confidence: 0, issues: ['Result message is missing'] };
    }
    // Verify that the result contains a number (the answer)
    if (!/\d/.test(result.message)) {
      return { verified: false, confidence: 0.5, issues: ['Result does not seem to contain a numerical answer'] };
    }
    return { verified: true, confidence: 1.0, issues: [] };
  }
}

module.exports = { MathSkill };
