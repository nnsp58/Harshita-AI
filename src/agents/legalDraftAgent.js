/**
 * LegalDraftAgent - Handles legal document drafting
 * 
 * Supported documents:
 *   - Affidavit (Sapath Patra)
 *   - Self Declaration
 *   - Rent Agreement (basic)
 *   - NOC (No Objection Certificate)
 * 
 * Login required: No
 * Uses AI for drafting (OpenAI)
 */

const fs = require('fs');
const path = require('path');
const { aiProviderManager } = require('../utils/aiProviderManager');

const DOCUMENT_TEMPLATES = {
  affidavit: {
    name: 'Affidavit (Sapath Patra)',
    requiredFields: ['fullName', 'fatherName', 'address', 'purpose'],
    template: `
AFFIDAVIT / SAPATH PATRA

I, {{fullName}}, S/o / D/o {{fatherName}}, 
resident of {{address}}, 
do hereby solemnly affirm and declare as under:

1. That I am a citizen of India.
2. That my date of birth is {{dob}}.
3. That the purpose of this affidavit is: {{purpose}}.
4. That the facts stated above are true and correct to the best of my knowledge and belief.
5. That nothing material has been concealed therefrom.

DEPONENT

Place: {{city}}
Date: {{date}}

Verification:
Verified at {{city}} on {{date}} that the contents of this affidavit are true 
and correct to the best of my knowledge and belief.

DEPONENT
`
  },
  declaration: {
    name: 'Self Declaration',
    requiredFields: ['fullName', 'purpose'],
    template: `
SELF DECLARATION

I, {{fullName}}, S/o / D/o {{fatherName}},
resident of {{address}},
hereby declare that:

{{declarationText}}

I declare that the above information is true and correct to the best of my knowledge.

Signature: _______________
Name: {{fullName}}
Date: {{date}}
Place: {{city}}
`
  },
  noc: {
    name: 'No Objection Certificate',
    requiredFields: ['fullName', 'purpose', 'issuedTo'],
    template: `
NO OBJECTION CERTIFICATE

Date: {{date}}

To Whom It May Concern,

This is to certify that I/We, {{fullName}}, 
have no objection to {{issuedTo}} for the purpose of {{purpose}}.

This NOC is issued upon the request of the above-mentioned person/entity.

Authorized Signatory: _______________
Name: {{fullName}}
Address: {{address}}
Contact: {{phone}}
`
  },
  rent_agreement: {
    name: 'Rent Agreement',
    requiredFields: ['landlordName', 'tenantName', 'propertyAddress', 'rentAmount', 'duration'],
    template: `
RENT AGREEMENT

This Rent Agreement is made on {{date}} between:

LANDLORD: {{landlordName}}, residing at {{landlordAddress}}
(hereinafter referred to as the "Landlord")

AND

TENANT: {{tenantName}}, residing at {{tenantPreviousAddress}}
(hereinafter referred to as the "Tenant")

PROPERTY: {{propertyAddress}}

TERMS AND CONDITIONS:

1. RENT: Rs. {{rentAmount}} per month, payable by the {{paymentDay}}th of each month.
2. SECURITY DEPOSIT: Rs. {{securityDeposit}}.
3. DURATION: {{duration}} months, starting from {{startDate}}.
4. The tenant shall use the premises only for residential purposes.
5. The tenant shall not sublet the premises.

IN WITNESS WHEREOF, the parties have signed this agreement.

Landlord Signature: _______________    Tenant Signature: _______________
Name: {{landlordName}}                Name: {{tenantName}}

Witness 1: _______________
Witness 2: _______________
`
  }
};

class LegalDraftAgent {
  constructor() {
    this.name = 'LegalDraftAgent';
    this.templates = DOCUMENT_TEMPLATES;
    
    const available = aiProviderManager.getAvailableProviders();
    console.log('[LegalDraftAgent] Available providers:', available.join(', ') || 'none');
    const preferred = aiProviderManager.getEffectiveProvider(this.name);
    console.log('[LegalDraftAgent] Using provider:', preferred);
  }

  /**
   * Execute legal draft task
   */
  async execute(taskData) {
    const { action, documentType, userData, customText } = taskData;

    switch (action) {
      case 'draft':
        return await this._draftDocument(documentType, userData, customText);
      case 'list_templates':
        return this._listTemplates();
      case 'ai_draft':
        return await this._aiDraft(documentType, userData, customText);
      default:
        return {
          success: false,
          error: 'unknown_action',
          message: `Unknown action: ${action}. Available: draft, list_templates, ai_draft`
        };
    }
  }

  /**
   * Draft document using template
   */
  async _draftDocument(documentType, userData, customText) {
    const template = DOCUMENT_TEMPLATES[documentType];
    if (!template) {
      return {
        success: false,
        agent: this.name,
        error: 'unknown_template',
        message: `Unknown document type: ${documentType}. Available: ${Object.keys(DOCUMENT_TEMPLATES).join(', ')}`
      };
    }

    // Check required fields
    const missing = template.requiredFields.filter(f => !this._getFieldValue(f, userData));
    if (missing.length > 0) {
      return {
        success: false,
        agent: this.name,
        error: 'missing_fields',
        message: `Missing required fields: ${missing.join(', ')}`,
        requiredFields: template.requiredFields
      };
    }

    // Fill template
    let content = template.template;
    const today = new Date().toLocaleDateString('en-IN');

    const replacements = {
      fullName: userData?.personal?.fullName || userData?.fullName || '',
      fatherName: userData?.personal?.fatherName || userData?.fatherName || '',
      motherName: userData?.personal?.motherName || userData?.motherName || '',
      address: this._formatAddress(userData?.address) || userData?.address || '',
      city: userData?.address?.city || userData?.city || '',
      dob: userData?.personal?.dob || userData?.dob || '',
      phone: userData?.contact?.phone || userData?.phone || '',
      date: today,
      purpose: userData?.purpose || customText || '',
      declarationText: customText || '',
      issuedTo: userData?.issuedTo || '',
      landlordName: userData?.landlordName || '',
      landlordAddress: userData?.landlordAddress || '',
      tenantName: userData?.tenantName || '',
      tenantPreviousAddress: userData?.tenantPreviousAddress || '',
      propertyAddress: userData?.propertyAddress || '',
      rentAmount: userData?.rentAmount || '',
      securityDeposit: userData?.securityDeposit || '',
      duration: userData?.duration || '',
      startDate: userData?.startDate || today,
      paymentDay: userData?.paymentDay || '5'
    };

    for (const [key, value] of Object.entries(replacements)) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    // Save to file
    const fileName = `${documentType}_${Date.now()}.txt`;
    const filePath = path.join(this.outputDir, fileName);
    fs.writeFileSync(filePath, content, 'utf8');

    console.log(`[LegalDraftAgent] Document drafted: ${filePath}`);

    return {
      success: true,
      agent: this.name,
      action: 'draft',
      documentType,
      documentName: template.name,
      filePath,
      content,
      message: `${template.name} drafted successfully. Saved to: ${filePath}`
    };
  }

  /**
   * AI-powered document drafting
   */
    async _aiDraft(documentType, userData, customText) {
      const client = aiProviderManager.getClient('LegalDraftAgent');
      if (!client) {
        console.log('[LegalDraftAgent] AI not available, falling back to template.');
        return await this._draftDocument(documentType, userData, customText);
      }

      const prompt = `
Draft a professional ${documentType} document in English with these details:

Name: ${userData?.personal?.fullName || userData?.fullName || 'N/A'}
Father's Name: ${userData?.personal?.fatherName || userData?.fatherName || 'N/A'}
Address: ${this._formatAddress(userData?.address) || 'N/A'}
Purpose: ${userData?.purpose || customText || 'N/A'}
Date: ${new Date().toLocaleDateString('en-IN')}

Additional: ${customText || 'None'}

Make it legally sound. Format properly with sections.
      `;

      try {
        const model = aiProviderManager.getModel('LegalDraftAgent');
        console.log(`[LegalDraftAgent] Using ${aiProviderManager.getEffectiveProvider('LegalDraftAgent')} (${model})`);
        
        const completion = await client.chat.completions.create({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 1500
        });

        const content = completion.choices[0].message.content;
        const fileName = `${documentType}_${Date.now()}.txt`;
        const filePath = path.join(process.cwd(), 'output', 'legal_drafts', fileName);
        
        if (!fs.existsSync(path.dirname(filePath))) {
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
        }
        
        fs.writeFileSync(filePath, content);
        
        return {
          success: true,
          agent: this.name,
          action: 'ai_draft',
          documentType,
          message: `Legal draft created using AI. Saved: ${filePath}`,
          filePath,
          preview: content.substring(0, 300) + '...'
        };
        
      } catch (error) {
        console.error('[LegalDraftAgent] AI draft error:', error.message);
        return await this._draftDocument(documentType, userData, customText);
      }
   }

  /**
   * List available templates
   */
  _listTemplates() {
    const templates = Object.entries(DOCUMENT_TEMPLATES).map(([key, val]) => ({
      key,
      name: val.name,
      requiredFields: val.requiredFields
    }));

    let msg = '\n=== Available Legal Document Templates ===\n\n';
    for (const t of templates) {
      msg += `[${t.key}] ${t.name}\n`;
      msg += `  Required: ${t.requiredFields.join(', ')}\n\n`;
    }
    msg += '===\n';

    return {
      success: true,
      agent: this.name,
      templates,
      message: msg
    };
  }

  /**
   * Format address object to string
   */
  _formatAddress(addr) {
    if (!addr) return '';
    if (typeof addr === 'string') return addr;
    return [addr.line1, addr.line2, addr.city, addr.district, addr.state, addr.pincode]
      .filter(Boolean)
      .join(', ');
  }

  /**
   * Get field value from nested userData
   */
  _getFieldValue(field, userData) {
    if (!userData) return null;

    // Check direct
    if (userData[field]) return userData[field];

    // Check nested
    for (const section of Object.values(userData)) {
      if (typeof section === 'object' && section !== null && section[field]) {
        return section[field];
      }
    }

    return null;
  }
}

module.exports = { LegalDraftAgent };
