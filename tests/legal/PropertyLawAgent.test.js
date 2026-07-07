const { MasterLegalAgent } = require('../../src/departments/legal/MasterLegalAgent');

describe('MasterLegalAgent -> PropertyLawAgent Integration', () => {
  let masterAgent;

  beforeEach(() => {
    masterAgent = new MasterLegalAgent();
  });

  it('should block Gift Deed generation if mandatory property info is missing', async () => {
    const context = {
      intent: 'I want to gift my property to my daughter',
      memory: {
        owner: 'Nar Narayan Singh',
        donee: 'Harshita',
        giftPercentage: 50
      }
    };

    const result = await masterAgent.processRequest(context);
    expect(result.status).toEqual('WAITING_FOR_INFO');
    expect(result.missingFields).toContain('Khasra Number');
    expect(result.missingFields).toContain('Property Area');
    expect(result.missingFields).toContain('Two Witnesses (Mandatory)');
  });

  it('should successfully generate Gift Deed if all info is present', async () => {
    const context = {
      intent: 'gift 50% property',
      memory: {
        owner: 'Nar Narayan Singh',
        donee: 'Harshita',
        giftPercentage: 50,
        relationship: 'daughter',
        propertyDetails: {
          khasraNumber: '420/1',
          area: '500 sq yards',
          village: 'Sikhera',
          tehsil: 'Bulandshahr',
          district: 'Bulandshahr'
        },
        witnesses: ['Witness1', 'Witness2']
      }
    };

    const result = await masterAgent.processRequest(context);
    expect(result.status).toEqual('SUCCESS');
    expect(result.document).toContain('GIFT DEED');
    expect(result.document).toContain('Nar Narayan Singh');
    expect(result.document).toContain('Harshita');
    expect(result.document).toContain('420/1');
    expect(result.document).toContain('50%');
    expect(result.score).toBeGreaterThan(80);
  });
});
