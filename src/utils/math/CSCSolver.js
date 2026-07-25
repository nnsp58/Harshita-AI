class CSCSolver {
  static calculateStampDuty(propertyValue, isFemaleOwner = false, isRural = false) {
    // UP standard approx (can vary)
    // Male: 7%, Female: 6% (discounted)
    // Rural: 1% extra discount or 1% extra panchayat tax depending on area, assuming basic rules
    
    let rate = isFemaleOwner ? 6 : 7;
    // Example: add 1% if urban, so rural is rate-1 or rate. Let's just keep simple rate
    const duty = (propertyValue * rate) / 100;
    const registrationFee = Math.min((propertyValue * 1) / 100, 20000); // 1% capped at 20k

    return `Formula
Stamp Duty = (Property Value × Duty Rate) / 100
Registration Fee = 1% of Value (Capped at ₹20,000)

Values
Property Value = ₹${propertyValue}
Owner Gender = ${isFemaleOwner ? 'Female' : 'Male'}
Rate Applicable = ${rate}%

Calculation
Stamp Duty = (${propertyValue} × ${rate}) / 100 = ₹${duty}
Reg Fee = ${propertyValue} × 1% (Cap 20000) = ₹${registrationFee}

Result
Stamp Duty: ₹${duty}
Registration Fee: ₹${registrationFee}
Total Cost: ₹${duty + registrationFee}`;
  }
}

module.exports = { CSCSolver };
