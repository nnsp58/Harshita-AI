class MathTheorySolver {
  /**
   * Offline Engine for answering Mathematical Concepts, Rules, and Puzzles.
   */
  static getConcept(query) {
    const q = query.toLowerCase();

    // Power of 0 Concept
    if (/(?:ghat|power).*?0/i.test(q) || q.includes('^0') || q.includes('**0')) {
      return `Formula
Exponent Rule (घातांक का नियम)

Concept
a⁰ = 1 (where a ≠ 0)

Explanation
किसी भी संख्या की घात (power) 0 होने पर उसका मान 1 होता है।
कारण: a² / a² = 1 होता है। और घातांक के नियम से a^(2-2) = a⁰ होता है। इसलिए a⁰ = 1

Result
1 की घात 0 का मतलब 1 है।`;
    }

    // 1 = ? Concept
    if (q.includes('1=?') || q.includes('1 = ?') || q.includes('1 =?')) {
      return `Formula
Identity / Calculus Concept

Concept
1 is a Universal Identity.

Explanation
1. Basic Math: 1 = 1 (Identity Property)
2. Calculus (अवकलन): d/dx (1) = 0
3. Trigonometry: 1 = sin²(x) + cos²(x)
4. Exponents: 1 = x⁰

Result
1 का मान संदर्भ (context) पर निर्भर करता है।`;
    }

    // Pi (π) Concept
    if (/(?:pi|पाई).*?(?:value|man|maan|kya)/i.test(q)) {
      return `Formula
Pi (π) Constant

Concept
π = Circumference / Diameter

Explanation
पाई (π) किसी भी वृत्त (circle) की परिधि और उसके व्यास का अनुपात है। यह एक अपरिमेय (irrational) संख्या है।

Result
π का मान लगभग 3.14159 या 22/7 होता है।`;
    }

    // Derivative of Constant
    if (/(?:differentiation|derivative|avkal|avakalan).*?(?:constant|number)/i.test(q)) {
      return `Formula
Derivative of a Constant

Concept
d/dx (c) = 0

Explanation
अवकलन (Differentiation) किसी चीज़ के बदलने की दर (rate of change) बताता है। चूँकि एक constant number (जैसे 5, 10, 100) कभी नहीं बदलता, इसलिए उसकी बदलने की दर शून्य (0) होती है।

Result
किसी भी constant का अवकलन 0 होता है।`;
    }

    // a^3 + b^3 Identity (Specific question handle)
    if (q.includes('a+b=10') && q.includes('ab=21')) {
      return `Formula
बीजीय सर्वसमिका (Algebraic Identity): 
a³ + b³ = (a + b)³ - 3ab(a + b)

Values
a + b = 10
ab = 21

Calculation
a³ + b³ = (10)³ - 3 × 21 × (10)
a³ + b³ = 1000 - 630
a³ + b³ = 370

Result
a³ + b³ का मान 370 होगा।`;
    }

    // (a+b+c)^2 Expansion (Specific question handle)
    if (q.includes('a+b+c') && (q.includes('विस्तार') || q.includes('सिद्ध'))) {
      return `Formula
(a + b + c)² = a² + b² + c² + 2ab + 2bc + 2ca

Calculation (सिद्ध कैसे करें):
स्टेप 1: मान लीजिए (a + b) को हम एक पद 'x' मान लेते हैं। तो यह बन जाएगा: (x + c)²
स्टेप 2: (x + y)² का फार्मूला (x² + 2xy + y²) लगाएँ: x² + 2xc + c²
स्टेप 3: अब 'x' की जगह वापस (a + b) रख दें: (a + b)² + 2(a + b)c + c²
स्टेप 4: (a + b)² को खोलें और '2c' का (a + b) में गुणा करें: (a² + 2ab + b²) + (2ac + 2bc) + c²
स्टेप 5: इसे क्रम में सजा लें: a² + b² + c² + 2ab + 2bc + 2ca

Result
(a + b + c)² = a² + b² + c² + 2(ab + bc + ca) (सिद्ध हुआ)`;
    }

    // Default Fallback
    return null;
  }
}

module.exports = { MathTheorySolver };
