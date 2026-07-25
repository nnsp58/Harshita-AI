class TrigonometrySolver {
  /**
   * Evaluates a basic trig function (sin, cos, tan) given an angle in degrees.
   */
  static evaluate(func, angleDegrees) {
    const angleRad = angleDegrees * (Math.PI / 180);
    let result = 0;
    
    switch(func.toLowerCase()) {
      case 'sin': result = Math.sin(angleRad); break;
      case 'cos': result = Math.cos(angleRad); break;
      case 'tan': result = Math.tan(angleRad); break;
      case 'cot': result = 1 / Math.tan(angleRad); break;
      case 'sec': result = 1 / Math.cos(angleRad); break;
      case 'cosec': result = 1 / Math.sin(angleRad); break;
      default: throw new Error(`Unknown trig function: ${func}`);
    }

    return `Formula
Trigonometry Evaluation

Values
Function = ${func}
Angle = ${angleDegrees}°

Calculation
${func}(${angleDegrees}°)

Result
${result.toFixed(4)}`;
  }
}

module.exports = { TrigonometrySolver };
