/**
 * Validates an Indian Aadhaar number using the Verhoeff checksum algorithm.
 *
 * @param {string} aadhaarNumber - The 12-digit Aadhaar number to validate.
 * @returns {boolean} True if the Aadhaar number is valid, false otherwise.
 */
function validateAadhaar(aadhaarNumber) {
  // Check if the input is a string and has a length of 12 characters
  if (typeof aadhaarNumber !== 'string' || aadhaarNumber.length !== 12) {
    return false;
  }

  // Check if the input contains only digits
  if (!/^\d+$/.test(aadhaarNumber)) {
    return false;
  }

  // Define the Verhoeff multiplication table
  const multiplicationTable = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
  ];

  // Define the Verhoeff permutation table
  const permutationTable = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
  ];

  // Calculate the Verhoeff checksum
  let checksum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(aadhaarNumber[i]);
    const permutationIndex = (checksum + digit) % 10;
    checksum = permutationTable[i % 8][permutationIndex];
  }

  // Return true if the checksum is 0, false otherwise
  return checksum === 0;
}

// Example usage:
console.log(validateAadhaar('123456789012')); // Replace with a valid Aadhaar number