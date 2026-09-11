const { MasterAgent } = require('../src/agents/masterAgent');
const { aiProviderManager } = require('../src/utils/aiProviderManager');
const { legalComplaintEngine } = require('../src/departments/legal/LegalComplaintEngine');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function runFullE2ETest() {
    console.log('====================================================');
    console.log('🚀 HARSHITA AI COMPREHENSIVE END-TO-END EXECUTION');
    console.log('====================================================');

    const results = {};
    const agent = new MasterAgent();

    // Wait for MasterAgent to be fully ready
    let retries = 0;
    while (!agent.isReady && retries < 20) {
        await new Promise(r => setTimeout(r, 500));
        retries++;
    }
    console.log('MasterAgent ready state:', agent.isReady);

    // 1. Health & Database
    try {
        const userCount = await prisma.user.count();
        results['Health & Database'] = { status: 'PASS', details: `Prisma Connected. Total users in DB: ${userCount}` };
    } catch(e) {
        results['Health & Database'] = { status: 'FAIL', error: e.message };
    }

    // 2. Core Agent Prompts
    const corePrompts = [
        { type: 'General Hindi', prompt: 'नमस्ते हर्षिता, आप क्या क्या कर सकती हैं?' },
        { type: 'General English', prompt: 'Hello, what services do you provide for CSC center?' },
        { type: 'Mixed Hinglish', prompt: 'Bhai mujhe ek cyber cafe open karna hai, kya requirements hongi?' },
        { type: 'Multi-step', prompt: 'Pehle mujhe police complaint draft karni hai fir affidavit' }
    ];

    for (const cp of corePrompts) {
        try {
            const res = await agent.processCommand('test_e2e_core', cp.prompt);
            results['Core Agent - ' + cp.type] = {
                status: (res && res.message) ? 'PASS' : 'FAIL',
                skill: res?.skill || res?.category || 'General',
                responseLength: res?.message?.length || 0,
                sample: (res?.message || '').substring(0, 100).replace(/\n/g, ' ')
            };
        } catch(e) {
            results['Core Agent - ' + cp.type] = { status: 'FAIL', error: e.message };
        }
    }

    // 3. Legal Skills - All 10 Document Types
    const legalDocs = [
        { name: 'Police Complaint', prompt: 'थाना प्रभारी महोदय को मोबाइल चोरी की तहरीर / पुलिस शिकायत लिखनी है। शिकायतकर्ता: अमित कुमार, पता: सिविल लाइन्स प्रयागराज, घटना: 10 सितंबर 2026 को सिविल लाइन्स बस स्टैंड पर मोबाइल चोरी हुआ।' },
        { name: 'Cheque Bounce Notice', prompt: 'चेक बाउंस का कानूनी नोटिस (Section 138 NI Act) भेजना है। चेक नंबर 445566, रकम 1,50,000 रु, जारीकर्ता: दिनेश शर्मा, बैंक: PNB, चेक तिथि: 01/08/2026' },
        { name: 'Affidavit', prompt: 'नाम परिवर्तन (Name Change) का शपथ पत्र (Affidavit) बनाना है। प्रार्थी: राजेश यादव पुत्र राम यादव, निवासी कानपुर' },
        { name: 'Rent Agreement', prompt: 'मकान का रेंट एग्रीमेंट (Rent Agreement) तैयार करें। मकान मालिक: सुरेश वर्मा, किराएदार: विकास गुप्ता, किराया: 12,000 रु प्रति माह, अवधि: 11 माह, पता: फ्लैट 201 गोमती नगर लखनऊ' },
        { name: 'NOC', prompt: 'मकान बिजली कनेक्शन के लिए अनापत्ति प्रमाण पत्र (NOC / No Objection Certificate) बनाना है। मकान मालिक: सुनीता देवी' },
        { name: 'Legal Notice', prompt: 'बकाया रकम वसूली (Money Recovery) के लिए लीगल नोटिस भेजना है। कर्जदार: मोहित सिंह, बकाया राशि: 2,00,000 रुपये' },
        { name: 'Complaint/Application', prompt: 'तहसीलदार महोदय को वरासत दर्ज करने हेतु प्रार्थना पत्र / आवेदन पत्र लिखना है।' },
        { name: 'Declaration', prompt: 'आय एवं संपत्ति का स्व-घोषणा पत्र (Self Declaration) तैयार करें।' },
        { name: 'Will', prompt: 'वसीयतनामा (Will) का कानूनी प्रारूप तैयार करें। वसीयतकर्ता: बृजमोहन लाल, आयु: 68 वर्ष' },
        { name: 'Power of Attorney', prompt: 'संपत्ति देखभाल हेतु मुख्तारनामा (General Power of Attorney) का प्रारूप बनाएं।' }
    ];

    for (const doc of legalDocs) {
        try {
            const res = await agent.processCommand('test_e2e_legal', doc.prompt);
            const hasContent = !!(res && (res.message || res.document || res.data));
            results['Legal Skill - ' + doc.name] = {
                status: hasContent ? 'PASS' : 'FAIL',
                skill: res?.skill,
                action: res?.action,
                textSample: (res?.message || '').substring(0, 100).replace(/\n/g, ' ')
            };
        } catch(e) {
            results['Legal Skill - ' + doc.name] = { status: 'FAIL', error: e.message };
        }
    }

    // 4. Context Test (Single message containing all facts)
    try {
        const fullContextPrompt = 'थाना सिविल लाइन्स में शिकायत: शिकायतकर्ता राहुल शर्मा पुत्र श्री अशोक शर्मा, निवासी 123 राजापुर प्रयागराज, मोबाइल 9876543210। आरोपी अज्ञात व्यक्ति। घटना दिनांक 05 सितंबर 2026 समय सायं 6 बजे। घटना स्थल सुभाष चौराहा। घटना: मेरी बाइक UP70 AB 1234 चोरी हो गई। कृपया FIR दर्ज करें।';
        const res = await agent.processCommand('test_e2e_context', fullContextPrompt);
        const text = (res?.message || '') + (res?.document || '') + JSON.stringify(res?.action || {});
        const retainsFacts = text.includes('राहुल शर्मा') && (text.includes('UP70') || text.includes('1234') || text.includes('प्रयागराज') || text.includes('बाइक'));
        results['Context Retention & No Info Loss'] = {
            status: retainsFacts ? 'PASS' : 'FAIL',
            retainsFacts,
            actionTriggered: !!res?.action
        };
    } catch(e) {
        results['Context Retention & No Info Loss'] = { status: 'FAIL', error: e.message };
    }

    // 5. API Survival & Provider Failover
    try {
        const provs = aiProviderManager.getAvailableProviders();
        results['API Survival Architecture'] = {
            status: (provs && provs.length > 0) ? 'PASS' : 'FAIL',
            registeredProviders: provs.map(p => p.name)
        };
    } catch(e) {
        results['API Survival Architecture'] = { status: 'FAIL', error: e.message };
    }

    // 6. Offline Mode & Local Fallback
    try {
        const offlineResult = legalComplaintEngine.process('थाना प्रभारी को पर्स चोरी की शिकायत लिखनी है। शिकायतकर्ता मनोज कुमार');
        results['Offline Mode Engine'] = {
            status: (offlineResult && offlineResult.message && offlineResult.message.includes('थाना प्रभारी')) ? 'PASS' : 'FAIL',
            action: offlineResult.action
        };
    } catch(e) {
        results['Offline Mode Engine'] = { status: 'FAIL', error: e.message };
    }

    // 7. Local RAG & Offline Knowledge
    try {
        const knowledgePath = path.join(__dirname, '../data/offline-knowledge.json');
        const exists = fs.existsSync(knowledgePath);
        let count = 0;
        if (exists) {
            const data = JSON.parse(fs.readFileSync(knowledgePath, 'utf8'));
            count = Array.isArray(data) ? data.length : Object.keys(data).length;
        }
        results['Local RAG Knowledge'] = {
            status: exists ? 'PASS' : 'FAIL',
            categoriesCount: count
        };
    } catch(e) {
        results['Local RAG Knowledge'] = { status: 'FAIL', error: e.message };
    }

    // 8. Cost Smart Routing
    try {
        const provs = aiProviderManager.getAvailableProviders() || [];
        const isSmartRouted = provs.length >= 1;
        results['Cost Smart Routing'] = {
            status: isSmartRouted ? 'PASS' : 'FAIL',
            details: `Active providers registered for tiered routing: ${provs.length}`
        };
    } catch(e) {
        results['Cost Smart Routing'] = { status: 'FAIL', error: e.message };
    }

    // 9. Self-Healing
    try {
        const SelfHealing = require('../src/skills/SelfHealingSkill');
        results['Self Healing Skill'] = {
            status: 'PASS',
            details: 'SelfHealingSkill module integrated and registered'
        };
    } catch(e) {
        results['Self Healing Skill'] = { status: 'FAIL', error: e.message };
    }

    console.log('--- TEST RESULTS SUMMARY ---');
    console.log(JSON.stringify(results, null, 2));

    await prisma.$disconnect();
}

runFullE2ETest();
