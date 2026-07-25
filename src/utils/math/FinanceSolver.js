class FinanceSolver {
  static calculateEMI(principal, ratePerYear, timeInMonths) {
    const r = (ratePerYear / 12) / 100;
    const p = principal;
    const n = timeInMonths;
    let emi = 0;
    
    if (r === 0) {
      emi = p / n;
    } else {
      emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }
    const totalPayment = emi * n;
    const totalInterest = totalPayment - p;

    return `Formula
EMI = [P x R x (1+R)^N]/[(1+R)^N-1]

Values
Principal (P) = ₹${p}
Yearly Rate = ${ratePerYear}%
Time (N) = ${n} months

Calculation
Monthly Rate (R) = ${ratePerYear}/12/100 = ${r.toFixed(5)}
EMI = (${p} × ${r.toFixed(5)} × (1+${r.toFixed(5)})^${n}) / ((1+${r.toFixed(5)})^${n} - 1)

Result
Monthly EMI: ₹${emi.toFixed(2)}
Total Interest: ₹${totalInterest.toFixed(2)}
Total Payment: ₹${totalPayment.toFixed(2)}`;
  }

  static calculateSimpleInterest(principal, rate, timeInYears) {
    const interest = (principal * rate * timeInYears) / 100;
    const amount = principal + interest;
    
    return `Formula
Simple Interest = (P × R × T) / 100

Values
Principal (P) = ₹${principal}
Rate (R) = ${rate}% p.a.
Time (T) = ${timeInYears} years

Calculation
Interest = (${principal} × ${rate} × ${timeInYears}) / 100 = ₹${interest.toFixed(2)}

Result
Interest: ₹${interest.toFixed(2)}
Total Amount: ₹${amount.toFixed(2)}`;
  }

  static calculateCompoundInterest(principal, rate, timeInYears, compoundsPerYear = 1) {
    const amount = principal * Math.pow((1 + (rate / 100) / compoundsPerYear), compoundsPerYear * timeInYears);
    const interest = amount - principal;

    return `Formula
Compound Interest Amount = P(1 + R/N)^(NT)

Values
Principal (P) = ₹${principal}
Rate (R) = ${rate}% p.a.
Time (T) = ${timeInYears} years
Compounds per Year (N) = ${compoundsPerYear}

Calculation
A = ${principal}(1 + ${rate/100}/${compoundsPerYear})^(${compoundsPerYear}×${timeInYears})
A = ₹${amount.toFixed(2)}

Result
Compound Interest: ₹${interest.toFixed(2)}
Total Amount: ₹${amount.toFixed(2)}`;
  }

  static calculateGST(amount, gstRate) {
    const gstAmount = (amount * gstRate) / 100;
    const total = amount + gstAmount;

    return `Formula
GST Amount = (Original Amount × GST%) / 100

Values
Original Amount = ₹${amount}
GST Rate = ${gstRate}%

Calculation
GST Amount = (${amount} × ${gstRate}) / 100 = ₹${gstAmount.toFixed(2)}
Total = ${amount} + ${gstAmount.toFixed(2)} = ₹${total.toFixed(2)}

Result
GST: ₹${gstAmount.toFixed(2)}
Total Price (inclusive): ₹${total.toFixed(2)}`;
  }
}

module.exports = { FinanceSolver };
