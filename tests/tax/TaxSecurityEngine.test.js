const { TaxSecurityEngine } = require('../../src/departments/tax/TaxSecurityEngine');

describe('TaxSecurityEngine', () => {
  it('should encrypt and decrypt correctly', () => {
    const originalText = 'ABCDE1234F';
    const encrypted = TaxSecurityEngine.encrypt(originalText);
    expect(encrypted).not.toBeNull();
    expect(encrypted).not.toEqual(originalText);
    
    const decrypted = TaxSecurityEngine.decrypt(encrypted);
    expect(decrypted).toEqual(originalText);
  });

  it('should handle empty strings', () => {
    expect(TaxSecurityEngine.encrypt(null)).toBeNull();
    expect(TaxSecurityEngine.decrypt(null)).toBeNull();
  });

  it('should mask PAN correctly', () => {
    const pan = 'ABCDE1234F';
    const masked = TaxSecurityEngine.maskPan(pan);
    expect(masked).toEqual('AB*****34F');
  });

  it('should mask Aadhaar correctly', () => {
    const aadhaar = '123456789012';
    const masked = TaxSecurityEngine.maskAadhaar(aadhaar);
    expect(masked).toEqual('********9012');
  });
});
