class AlgebraSolver {
  /**
   * Solves a quadratic equation by middle-term splitting (factorization)
   * Equation format expected: ax^2 + bx + c = 0
   */
  static solveQuadraticByFactorization(a, b, c) {
    const ac = a * c;
    let factor1 = null;
    let factor2 = null;

    // Find two numbers that multiply to ac and add to b
    for (let i = -Math.abs(ac); i <= Math.abs(ac); i++) {
      if (i === 0) continue;
      if (ac % i === 0) {
        let j = ac / i;
        if (i + j === b) {
          factor1 = i;
          factor2 = j;
          break;
        }
      }
    }

    if (factor1 === null || factor2 === null) {
      return "इस समीकरण के गुणनखंड (factors) आसानी से नहीं निकाले जा सकते। इसके लिए Quadratic Formula (श्रीधराचार्य सूत्र) का ही इस्तेमाल करना पड़ेगा।";
    }

    const root1 = -factor1 / a;
    const root2 = -factor2 / a;

    let steps = `Formula
गुणनखंड विधि (Factorization Method / Middle-Term Splitting)

Values
समीकरण (Equation): ${a === 1 ? '' : a}x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0
यहाँ a=${a}, b=${b}, c=${c}
a × c = ${ac}

Calculation
स्टेप 1: बीच वाले पद (${b}x) को ऐसे दो हिस्सों में तोड़ें जिनका गुणा ${ac} हो और जोड़ ${b} हो।
वे दो संख्याएँ हैं: ${factor1} और ${factor2}

स्टेप 2: समीकरण को फिर से लिखें:
${a === 1 ? '' : a}x² ${factor1 >= 0 ? '+' : ''}${factor1}x ${factor2 >= 0 ? '+' : ''}${factor2}x ${c >= 0 ? '+' : ''}${c} = 0

स्टेप 3: Common (उभयनिष्ठ) बाहर निकालें:
x(${a}x ${factor1 >= 0 ? '+' : ''}${factor1}) ${factor2 >= 0 ? '+' : ''}${factor2/a}(${a}x ${factor1 >= 0 ? '+' : ''}${factor1}) = 0
(${a}x ${factor1 >= 0 ? '+' : ''}${factor1}) (x ${factor2/a >= 0 ? '+' : ''}${factor2/a}) = 0

Result
अतः x के दो मान होंगे:
x = ${root1}
x = ${root2}`;

    return steps;
  }
}

module.exports = { AlgebraSolver };
