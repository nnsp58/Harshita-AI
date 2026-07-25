class LandSolver {
  /**
   * Calculates estimated area for a 4-sided irregular plot when angles/diagonals are unknown.
   * Outputs in a detailed, easy-to-understand step-by-step format.
   */
  static calculateFourSidedArea(front, back, left, right) {
    const avgWidth = (front + back) / 2;
    const avgLength = (left + right) / 2;
    const area = avgWidth * avgLength;

    const formattedOutput = `Formula
अनुमानित क्षेत्रफल (आमने-सामने की भुजाओं का औसत)

Values
पहली दीवार (Front) = ${front} फीट
सामने की दीवार (Back) = ${back} फीट
एक तरफ की दीवार (Left) = ${left} फीट
दूसरी तरफ की दीवार (Right) = ${right} फीट

Calculation
पहला कदम (Step 1): आमने-सामने वाली दीवारों को जोड़ें और आधा करें (औसत निकालें)
Front और Back: (${front} + ${back}) / 2 = ${avgWidth} फीट

दूसरा कदम (Step 2): दूसरी तरफ वाली दीवारों को जोड़ें और आधा करें
Left और Right: (${left} + ${right}) / 2 = ${avgLength} फीट

तीसरा कदम (Step 3): क्षेत्रफल निकालने के लिए दोनों नए अंकों का गुणा करें
क्षेत्रफल (Area) = ${avgWidth} × ${avgLength}

Result
आपके प्लॉट का अनुमानित (Estimated) क्षेत्रफल: **${area.toFixed(2)} वर्ग फीट (Square Feet)**
(गाँव में लेखपाल या अमीन भी इसी आसान तरीके का इस्तेमाल करते हैं!)`;

    return formattedOutput;
  }

  /**
   * Trapezium area: If opposite sides are parallel.
   */
  static trapeziumArea(parallelA, parallelB, height) {
    const area = ((parallelA + parallelB) / 2) * height;
    
    const formattedOutput = `Formula
Trapezium Area = ((a + b) / 2) × h

Values
Side A (parallel) = ${parallelA}
Side B (parallel) = ${parallelB}
Height (h) = ${height}

Calculation
Area = ((${parallelA} + ${parallelB}) / 2) × ${height} = ${area.toFixed(2)}

Result
Area
${area.toFixed(2)}`;

    return {
      area: area,
      text: formattedOutput,
      type: 'Exact Area'
    };
  }
}

module.exports = { LandSolver };
