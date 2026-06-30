const math = require('mathjs');
const nerdamer = require('nerdamer/all.min');

class MathSolver {
  /**
   * Evaluates basic arithmetic and statistical expressions safely.
   */
  static evaluate(expression, scope = {}) {
    try {
      return math.evaluate(expression, scope);
    } catch (e) {
      throw new Error(`MathJS Evaluation Error: ${e.message}`);
    }
  }

  /**
   * Solves an algebraic equation using Nerdamer.
   * Example: solveEquation('x^2 + 2x + 1 = 0', 'x')
   */
  static solveEquation(equation, variable = 'x') {
    try {
      const solution = nerdamer.solve(equation, variable);
      return solution.text();
    } catch (e) {
      throw new Error(`Algebra Solver Error: ${e.message}`);
    }
  }

  /**
   * Calculates the derivative of an expression.
   * Example: derivative('x^2', 'x')
   */
  static derivative(expression, variable = 'x') {
    try {
      const result = nerdamer(`diff(${expression}, ${variable})`);
      return result.text();
    } catch (e) {
      throw new Error(`Calculus (Derivative) Error: ${e.message}`);
    }
  }

  /**
   * Calculates the integral of an expression.
   * Example: integrate('x^2', 'x')
   */
  static integrate(expression, variable = 'x') {
    try {
      const result = nerdamer(`integrate(${expression}, ${variable})`);
      return result.text();
    } catch (e) {
      throw new Error(`Calculus (Integral) Error: ${e.message}`);
    }
  }

  /**
   * Simplifies an expression.
   * Example: simplify('2x + 3x')
   */
  static simplify(expression) {
    try {
      return nerdamer(expression).simplify().text();
    } catch (e) {
      return math.simplify(expression).toString();
    }
  }

  /**
   * Calculate EMI
   */
  static calculateEMI(principal, ratePerYear, months) {
    const r = (ratePerYear / 12) / 100;
    const p = principal;
    const n = months;
    if (r === 0) return p / n;
    return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }
}

module.exports = { MathSolver };
