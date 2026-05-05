class ValidatorAgent {
  constructor() {
    this.validationRules = {
      personal: {
        fullName: { required: true, minLength: 2, maxLength: 100 },
        gender: { required: true, enum: ['male', 'female', 'transgender'] },
        dob: { required: true, pattern: /^\d{4}-\d{2}-\d{2}$/ },
        maritalStatus: { enum: ['single', 'married', 'divorced', 'widowed'] },
        category: { enum: ['general', 'obc', 'sc', 'st'] }
      },
      contact: {
        email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        phone: { required: true, pattern: /^\d{10}$/ }
      },
       address: {
         pincode: { pattern: /^\d{5,6}$/ },  // Allow 5 or 6 digit PIN
         state: { required: true },
         city: { required: true }
       },
      documents: {
        aadhaar: { pattern: /^\d{12}$/ },
        pan: { pattern: /^[A-Z]{5}\d{4}[A-Z]{1}$/ }
      }
    };
  }

  // Validate user data against rules
  validateUserData(userData) {
    const errors = [];
    const warnings = [];

    // Check each section
    Object.keys(this.validationRules).forEach(section => {
      if (userData[section]) {
        const sectionErrors = this.validateSection(userData[section], this.validationRules[section], section);
        errors.push(...sectionErrors.errors);
        warnings.push(...sectionErrors.warnings);
      }
    });

    // Cross-field validations
    const crossErrors = this.validateCrossFields(userData);
    errors.push(...crossErrors.errors);
    warnings.push(...crossErrors.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalErrors: errors.length,
        totalWarnings: warnings.length
      }
    };
  }

   // Validate a single section
   validateSection(data, rules, sectionName) {
     const errors = [];
     const warnings = [];

     Object.keys(rules).forEach(field => {
       const rule = rules[field];
       let value = data[field];

       // Normalize string values for enum checks
       if (typeof value === 'string' && rule.enum) {
         value = value.toLowerCase();
       }

       // Required check
       if (rule.required && (!value || value.toString().trim() === '')) {
         errors.push({
           field: `${sectionName}.${field}`,
           type: 'required',
           message: `${field} is required`
         });
       }

       // Skip other validations if empty and not required
       if (!value || value.toString().trim() === '') {
         return;
       }

       // Pattern check
       if (rule.pattern && !rule.pattern.test(value)) {
         errors.push({
           field: `${sectionName}.${field}`,
           type: 'pattern',
           message: `${field} format is invalid`
         });
       }

       // Enum check
       if (rule.enum && !rule.enum.includes(value.toLowerCase())) {
         errors.push({
           field: `${sectionName}.${field}`,
           type: 'enum',
           message: `${field} must be one of: ${rule.enum.join(', ')}`
         });
       }

      // Length checks
      if (rule.minLength && value.length < rule.minLength) {
        errors.push({
          field: `${sectionName}.${field}`,
          type: 'minLength',
          message: `${field} must be at least ${rule.minLength} characters`
        });
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push({
          field: `${sectionName}.${field}`,
          type: 'maxLength',
          message: `${field} must be at most ${rule.maxLength} characters`
        });
      }
    });

    return { errors, warnings };
  }

  // Cross-field validations
  validateCrossFields(userData) {
    const errors = [];
    const warnings = [];

    // Age validation
    if (userData.personal?.dob) {
      const birthDate = new Date(userData.personal.dob);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 18) {
        warnings.push({
          field: 'personal.dob',
          type: 'age',
          message: 'User appears to be under 18 years old'
        });
      }

      if (age > 100) {
        errors.push({
          field: 'personal.dob',
          type: 'age',
          message: 'Invalid date of birth - age cannot be more than 100 years'
        });
      }
    }

    // Gender and marital status consistency
    if (userData.personal?.gender === 'male' && userData.personal?.maritalStatus === 'widowed') {
      warnings.push({
        field: 'personal.maritalStatus',
        type: 'consistency',
        message: 'Male users are rarely widowed - please verify'
      });
    }

    // Phone number format for India
    if (userData.contact?.phone && userData.contact.phone.startsWith('0')) {
      warnings.push({
        field: 'contact.phone',
        type: 'format',
        message: 'Phone number should not start with 0'
      });
    }

    // Aadhaar and PAN consistency
    if (userData.documents?.aadhaar && userData.documents?.pan) {
      // Basic check - PAN should not contain Aadhaar number
      if (userData.documents.pan.includes(userData.documents.aadhaar.slice(-4))) {
        warnings.push({
          field: 'documents.pan',
          type: 'consistency',
          message: 'PAN number seems to contain Aadhaar digits - please verify'
        });
      }
    }

    return { errors, warnings };
  }

  // Validate form data before submission
  validateFormSubmission(formData, userData) {
    const dataValidation = this.validateUserData(userData);
    const formValidation = this.validateFormFields(formData);

    return {
      isValid: dataValidation.isValid && formValidation.isValid,
      dataErrors: dataValidation.errors,
      dataWarnings: dataValidation.warnings,
      formErrors: formValidation.errors,
      formWarnings: formValidation.warnings,
      summary: {
        totalErrors: dataValidation.errors.length + formValidation.errors.length,
        totalWarnings: dataValidation.warnings.length + formValidation.warnings.length
      }
    };
  }

  // Basic form field validation
  validateFormFields(formData) {
    const errors = [];
    const warnings = [];

    // Check for empty required fields
    const requiredFields = ['name', 'email', 'phone', 'dob'];
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        errors.push({
          field,
          type: 'required',
          message: `${field} is required for form submission`
        });
      }
    });

    // Check for suspicious patterns
    if (formData.email && formData.email.includes('test@')) {
      warnings.push({
        field: 'email',
        type: 'suspicious',
        message: 'Email appears to be a test email'
      });
    }

    return { errors, warnings, isValid: errors.length === 0 };
  }

  // Generate validation report
  generateReport(validationResult) {
    const report = {
      timestamp: new Date(),
      status: validationResult.isValid ? 'PASS' : 'FAIL',
      summary: validationResult.summary,
      details: {
        errors: validationResult.errors,
        warnings: validationResult.warnings
      },
      recommendations: []
    };

    // Generate recommendations based on errors
    if (validationResult.errors.length > 0) {
      report.recommendations.push('Please fix all errors before proceeding');
    }

    if (validationResult.warnings.length > 0) {
      report.recommendations.push('Review warnings to ensure data accuracy');
    }

    if (validationResult.errors.some(e => e.type === 'required')) {
      report.recommendations.push('Fill in all required fields');
    }

    return report;
  }
}

module.exports = { ValidatorAgent };