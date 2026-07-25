class DateTimeSolver {
  static calculateAge(birthDateString) {
    const dob = new Date(birthDateString);
    if (isNaN(dob.getTime())) throw new Error("Invalid date format");
    
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return `Formula
Age Calculation
Age = Current Year - Birth Year (Adjusted for month/day)

Values
Date of Birth = ${dob.toISOString().split('T')[0]}
Current Date = ${today.toISOString().split('T')[0]}

Calculation
${today.getFullYear()} - ${dob.getFullYear()} (Adjusted)

Result
Age: ${age} Years`;
  }
}

module.exports = { DateTimeSolver };
