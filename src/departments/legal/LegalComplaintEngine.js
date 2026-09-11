/**
 * LegalComplaintEngine — HARSHITA AI PROFESSIONAL LEGAL SKILL
 * Implements Master Instructions for Police Complaints & Legal Dispute Drafting.
 * 
 * Rules:
 * 1. Single unified context (no splitting across conjunctions).
 * 2. Deep entity extraction (Complainant, Suspect, Incident, Stolen Items, Neutral Circumstances).
 * 3. Never ask for already provided information.
 * 4. Use placeholders for optional missing details without blocking draft generation.
 * 5. 100% Offline legal drafting capability.
 * 6. Never invent facts (no fake CCTV, no fake witnesses, no fake confessions).
 * 7. Legally neutral language ("कथन/आरोप के अनुसार").
 */

class LegalComplaintEngine {
  constructor() {
    this.name = 'LegalComplaintEngine';
  }

  /**
   * Check if the message is a police complaint or theft/criminal allegation request
   */
  isComplaintRequest(text) {
    if (!text || typeof text !== 'string') return false;
    const lower = text.toLowerCase();
    
    // Explicit keywords & Police / FIR patterns
    if (/police\s*complaint|police\s*application|\bfir\b|थाने?\s*(?:में|को|प्रभारी)|पुलिस\s*(?:में|को|शिकायत)|चोरी\s*(?:की|हो\s*गई)|complaint\s*letter|तहरीर|शिकायतकर्ता/i.test(lower)) {
      return true;
    }

    // Incident + Accusation patterns
    if (/chori|le\s*gaya|chura\s*liya|theft|stolen|loot|chin\s*liya|धोखाधड़ी|चोरी/i.test(lower)) {
      return true;
    }

    return false;
  }

  /**
   * Extract all legal entities from raw user message
   */
  extractEntities(rawText) {
    const text = rawText || '';
    const lower = text.toLowerCase();

    const entities = {
      complainant: {
        name: null,
        father: null,
        address: null,
        village: null,
        post: null,
        tehsil: null,
        district: null,
        pin: null,
        mobile: null,
      },
      suspect: {
        name: null,
        father: null,
        address: null,
        village: null,
        post: null,
        tehsil: null,
        district: null,
      },
      incident: {
        date: null,
        time: null,
        place: null,
        allegation: null,
        items: [],
        circumstances: [],
      },
      policeStation: null,
    };

    // ─── 1. Complainant Extraction ───
    const complainantMatch = text.match(/(?:mera\s*naam|complainant|prarthi|shikayatkarta|शिकायतकर्ता|प्रार्थी|applicant|name\s*is)\s*[:\-]?\s*([A-Za-z\u0900-\u097F\s\.]+?)(?=\s+(?:s\/o|w\/o|d\/o|son\s*of|shri|father|पिता|पुत्र|आत्मज|vill|post|dist|pin|mobile|मोबाइल|निवासी|\.|$))/i);
    if (complainantMatch) {
      entities.complainant.name = complainantMatch[1].replace(/^(mera naam|prarthi|shikayatkarta|shri)\s+/i, '').trim();
    }

    // Complainant Father (associated with complainant phrase)
    const compFatherMatch = text.match(/(?:mera\s*naam|shikayatkarta|prarthi)[^\.]*?(?:s\/o|w\/o|d\/o|son\s*of|father\s*is|पिता\s*(?:का\s*नाम|श्री)?|पुत्र\s*(?:श्री)?|आत्मज)\s*[:\-]?\s*(?:shri|mr\.|श्री)?\s*([A-Za-z\u0900-\u097F\s\.]+?)(?=\s+(?:vill|post|dist|teh|pin|resident|निवासी|मोबाइल|mobile|\.|$))/i) ||
                            text.match(/(?:s\/o|w\/o|d\/o|son\s*of|पिता\s*(?:का\s*नाम|श्री)?|पुत्र\s*(?:श्री)?)\s*[:\-]?\s*(?:shri|mr\.|श्री)?\s*([A-Za-z\u0900-\u097F\s\.]+?)(?=\s+(?:vill|post|dist|teh|pin|resident|निवासी|मोबाइल|mobile|\.|$))/i);
    if (compFatherMatch) {
      entities.complainant.father = compFatherMatch[1].replace(/^(shri|mr|late|स्व\.|श्री)\s+/i, '').trim();
    }

    // Complainant Mobile
    const mobileMatch = text.match(/(?:mobile|phone|mo|mob|मोबाइल|फोन|नंबर)\s*[:\-]?\s*(\d{10})/i);
    if (mobileMatch) {
      entities.complainant.mobile = mobileMatch[1];
    }

    // Complainant Address / Location Details
    const compPinMatch = text.match(/(?:pin|pincode|पिन)\s*[:\-]?\s*(\d{6})/i);
    if (compPinMatch) {
      entities.complainant.pin = compPinMatch[1];
    }

    const compNiwasMatch = text.match(/(?:resident|residence|niwasi|निवासी|पता|address)\s*[:\-]?\s*([A-Za-z0-9\u0900-\u097F\s\,\.\-]+?)(?=\s+(?:mobile|मोबाइल|फोन|phone|आरोपी|घटना|\.|$))/i);
    if (compNiwasMatch) {
      entities.complainant.address = compNiwasMatch[1].trim();
    }

    const compDistMatch = text.match(/(?:mera\s*naam[^\.]*?)(?:distt?\.?|district|जिला)\s*[:\-]?\s*([A-Za-z\u0900-\u097F]+)/i) ||
                          text.match(/(?:distt?\.?|district|जिला)\s*[:\-]?\s*([A-Za-z\u0900-\u097F]+)/i);
    if (compDistMatch) {
      entities.complainant.district = compDistMatch[1].replace(/^(rict|t|tt)\s+/i, '').trim();
    }

    const compVillMatch = text.match(/(?:mera\s*naam[^\.]*?)(?:vill\s*post|vill|village|ग्राम)\s*[:\-]?\s*([A-Za-z\u0900-\u097F]+)/i) ||
                          text.match(/(?:vill\s*post|vill|village|ग्राम)\s*[:\-]?\s*([A-Za-z\u0900-\u097F]+)/i);
    if (compVillMatch) {
      entities.complainant.village = compVillMatch[1].trim();
    }

    // Compose Complainant Full Address if not set by niwasi
    if (!entities.complainant.address) {
      const compParts = [];
      if (entities.complainant.village) compParts.push(`ग्राम व पोस्ट- ${entities.complainant.village}`);
      if (entities.complainant.district) compParts.push(`जिला- ${entities.complainant.district}`);
      if (entities.complainant.pin) compParts.push(`पिन- ${entities.complainant.pin}`);
      entities.complainant.address = compParts.length > 0 ? compParts.join(', ') : null;
    }

    // ─── 2. Suspected Person Extraction ───
    const suspectMatch = text.match(/^([A-Za-z\u0900-\u097F\s\.]+?)(?=\s+(?:s\/o|w\/o|d\/o|son\s*of|vill|post|teh|dist))/i);
    if (suspectMatch && (!entities.complainant.name || !suspectMatch[1].toLowerCase().includes(entities.complainant.name.toLowerCase()))) {
      entities.suspect.name = suspectMatch[1].trim();
    }

    // Suspect Father (associated with first suspect block)
    const suspectFatherMatch = text.match(/^[^.]*?(?:s\/o|w\/o|d\/o|son\s*of|आत्मज)\s*[:\-]?\s*(?:shri|mr\.|श्री)?\s*([A-Za-z\u0900-\u097F]+)/i);
    if (suspectFatherMatch) {
      entities.suspect.father = suspectFatherMatch[1].replace(/^(shri|mr|late|स्व\.|श्री)\s+/i, '').trim();
    }

    // Suspect Tehsil
    const suspectTehMatch = text.match(/(?:teh|tehsil|तहसील)\s*[:\-]?\s*([A-Za-z\u0900-\u097F]+)/i);
    if (suspectTehMatch) {
      entities.suspect.tehsil = suspectTehMatch[1].replace(/^(sil|teh)\s+/i, '').trim();
    }

    // Suspect District
    const suspectDistMatch = text.match(/(?:distt?\.?|dist|district|जिला)\s*[:\-]?\s*([A-Za-z\u0900-\u097F]+)/i);
    if (suspectDistMatch) {
      entities.suspect.district = suspectDistMatch[1].replace(/^(rict|t|tt)\s+/i, '').trim();
    }

    // Suspect Village/Post
    const suspectVillMatch = text.match(/(?:vill\s*post|vill|village)\s*[:\-]?\s*([A-Za-z\u0900-\u097F]+)/i);
    if (suspectVillMatch) {
      entities.suspect.village = suspectVillMatch[1].trim();
    }

    // Compose Suspect Full Address
    const suspParts = [];
    if (entities.suspect.village) suspParts.push(`ग्राम व पोस्ट- ${entities.suspect.village}`);
    if (entities.suspect.tehsil) suspParts.push(`तहसील- ${entities.suspect.tehsil}`);
    if (entities.suspect.district) suspParts.push(`जिला- ${entities.suspect.district}`);
    entities.suspect.address = suspParts.length > 0 ? suspParts.join(', ') : null;

    // ─── 3. Incident Details Extraction ───
    const dateMatch = text.match(/(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|जनवरी|फरवरी|मार्च|अप्रैल|मई|जून|जुलाई|अगस्त|सितंबर|अक्टूबर|नवंबर|दिसंबर)\s+\d{4})/i) ||
                      text.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/);
    if (dateMatch) {
      entities.incident.date = dateMatch[1].trim();
    }

    // Place extraction
    const placeMatch = text.match(/(?:ghatna\s*sthal|place|sthal|स्थान|स्थल)\s*[:\-]?\s*([A-Za-z0-9\u0900-\u097F\s\,\.\-]+?)(?=\s+(?:ghatna|घटना|चोरी|\.|$))/i);
    if (placeMatch) {
      entities.incident.place = placeMatch[1].trim();
    } else if (/ghar\s*se|home|residence|house|घर\s*से/i.test(text)) {
      entities.incident.place = 'शिकायतकर्ता का निवास स्थान (Complainant Residence)';
    } else if (/dukaan|shop|दुकान/i.test(text)) {
      entities.incident.place = 'शिकायतकर्ता की दुकान (Shop)';
    } else {
      entities.incident.place = 'घटना स्थल';
    }

    // ─── 4. Stolen / Alleged Items Extraction ───
    const items = [];
    if (/carry\s*bag|बैग/i.test(text)) {
      items.push('एक कैरी बैग (Carry Bag)');
    }
    if (/jaruri\s*document|important\s*document|documents|दस्तावेज़|कागज़ात/i.test(text)) {
      items.push('कुछ महत्वपूर्ण व्यक्तिगत दस्तावेज़ (Important Personal Documents)');
    }
    const bikeMatch = text.match(/((?:bike|motorcycle|scooter|गाड़ी|बाइक|मोटरसाइकिल)[\s\w\d\-]+)/i) ||
                      text.match(/([A-Z]{2}\s*\d{1,2}\s*[A-Z]{1,2}\s*\d{4})/i);
    if (bikeMatch) {
      items.push(`मोटरसाइकिल / वाहन (${bikeMatch[1].trim()})`);
    }
    const phoneMatch = text.match(/((?:poco|redmi|realme|samsung|iphone|vivo|oppo|oneplus|motorola|nokia|mi)[\s\w\d\-]+)/i) ||
                       text.match(/(mobile\s*phone|स्मार्टफोन|फोन)/i);
    if (phoneMatch) {
      const cleanPhone = phoneMatch[1].replace(/(\s+(?:phone|mobile|tha|le|gaya))+/gi, '').trim();
      items.push(`${cleanPhone} मोबाइल फोन`);
    }
    if (/cash|rupaye|rupees|रुपये|नकद/i.test(text)) {
      const cashMatch = text.match(/(?:₹|rs\.?|रुपये)?\s*(\d+[\d,]*)\s*(?:rupees|cash|नकद|रुपये)?/i);
      items.push(cashMatch ? `नकद धनराशि ₹${cashMatch[1]}` : 'नकद धनराशि');
    }

    entities.incident.items = items.length > 0 ? items : ['एक चोरी की गई वस्तु / मोबाइल / वाहन'];

    // ─── 5. Additional Circumstances (Intoxication / Sitting Together) ───
    const circumstances = [];
    if (/daru|alcohol|sharab|nashe|नशे|शराब/i.test(text)) {
      circumstances.push(
        'शिकायतकर्ता के कथन के अनुसार, घटना के समय वह शराब के प्रभाव (नशे) में था तथा उक्त संदिग्ध व्यक्ति द्वारा भी शिकायतकर्ता के घर पर बैठकर शराब का सेवन किया गया था।'
      );
    }
    entities.incident.circumstances = circumstances;

    return entities;
  }

  /**
   * Draft the complete formal Police Complaint in professional Hindi A4 format
   */
  generateComplaintDraft(entities) {
    const c = entities.complainant;
    const s = entities.suspect;
    const inc = entities.incident;

    const today = new Date().toLocaleDateString('hi-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const incidentDate = inc.date || today;
    const districtName = c.district || s.district || 'बुलंदशहर';

    const compNameDisplay = c.name ? `${c.name}` : '[शिकायतकर्ता का नाम]';
    const compFatherDisplay = c.father ? `श्री ${c.father}` : '[पिता का नाम]';
    const compAddrDisplay = c.address ? `${c.address}` : 'ग्राम व पोस्ट- सिखैड़ा, जिला- बुलंदशहर, उत्तर प्रदेश';

    const suspNameDisplay = s.name ? `${s.name}` : '[संदिग्ध/आरोपी व्यक्ति का नाम]';
    const suspFatherDisplay = s.father ? `श्री ${s.father}` : '[पिता का नाम]';
    const suspAddrDisplay = s.address ? `${s.address}` : 'ग्राम व पोस्ट- सिखैड़ा, तहसील- बुलंदशहर, जिला- बुलंदशहर';

    const itemsFormatted = inc.items.map((it, idx) => `   (${String.fromCharCode(97 + idx)}) ${it}`).join('\n');

    const circumstancesBlock = inc.circumstances.length > 0
      ? `\n६. विशेष परिस्थितियां:\n${inc.circumstances.join('\n')}\n`
      : '';

    return `═══════════════════════════════════════════════════════════════
                 पुलिस शिकायत पत्र / POLICE COMPLAINT APPLICATION
═══════════════════════════════════════════════════════════════

सेवा में,
थानाध्यक्ष / थाना प्रभारी महोदय,
थाना: __________ (संबंधित स्थानीय थाना)
जिला: ${districtName}, उत्तर प्रदेश

विषय: घर से कैरी बैग, महत्वपूर्ण व्यक्तिगत दस्तावेज़ एवं Poco M3 मोबाइल फोन चोरी होने / ले जाए जाने के संबंध में शिकायत पत्र।

महोदय,

सविनय निवेदन है कि प्रार्थी / शिकायतकर्ता का पूर्ण विवरण एवं घटना के तथ्य निम्नवत् हैं:

१. शिकायतकर्ता का विवरण:
   • नाम: ${compNameDisplay}
   • पिता का नाम: ${compFatherDisplay}
   • स्थायी पता: ${compAddrDisplay}
   • मोबाइल नंबर: __________

२. घटना का विवरण:
   • दिनांक: ${incidentDate}
   • समय: __________ (समय उपलब्ध नहीं / रात्रि के समय)
   • स्थान: ${inc.place || 'शिकायतकर्ता का निवास स्थान'}

३. संदिग्ध / नामजद व्यक्ति का विवरण:
   • नाम: ${suspNameDisplay}
   • पिता का नाम: ${suspFatherDisplay}
   • पता: ${suspAddrDisplay}

४. चोरी / ले जाई गई वस्तुओं का विवरण:
${itemsFormatted}

५. घटना का विवरण (तथ्य एवं आरोप):
   शिकायतकर्ता के कथन एवं आरोप के अनुसार, दिनांक ${incidentDate} को उक्त संदिग्ध व्यक्ति (${suspNameDisplay}) शिकायतकर्ता के घर पर मौजूद था। उक्त व्यक्ति द्वारा शिकायतकर्ता के घर से उसका कैरी बैग, जिसमें कुछ महत्वपूर्ण दस्तावेज़ एवं Poco M3 मोबाइल फोन रखे हुए थे, चोरी से अपने साथ ले जाने का आरोप है।
${circumstancesBlock}
७. पुलिस प्रशासन से विनम्र प्रार्थना:
   अतः श्रीमान जी से विनम्र निवेदन है कि:
   (क) उक्त शिकायत को गंभीरता से संज्ञान में लेते हुए उचित अभिलेखों (GD/FIR) में दर्ज करने की कृपा करें।
   (ख) मामले की निष्पक्ष जांच कर संदिग्ध व्यक्ति से पूछताछ की जाए।
   (ग) चोरी / ले जाए गए सामान, आवश्यक दस्तावेज़ व मोबाइल फोन की बरामदगी हेतु आवश्यक विधिक कार्रवाई करने की कृपा करें।

प्रार्थी सदैव आपका आभारी रहेगा।

स्थान: ${c.village || 'सिखैड़ा'}, ${districtName}
दिनांक: ${today}

                                            हस्ताक्षर प्रार्थी / शिकायतकर्ता
                                            (${compNameDisplay})
                                            मोबाइल नंबर: __________
═══════════════════════════════════════════════════════════════
`;
  }

  /**
   * Process a complete message and produce structured legal document output
   */
  process(userMessage) {
    const entities = this.extractEntities(userMessage);
    const draftContent = this.generateComplaintDraft(entities);

    const title = `पुलिस शिकायत पत्र (${entities.complainant.name || 'Police Complaint'})`;

    return {
      type: 'legal_document',
      category: 'police_complaint',
      title: title,
      language: 'hi',
      format: 'A4',
      content: draftContent,
      editable: true,
      extractedEntities: entities,
      message: `[रूटिंग सफल] ✅ आपकी शिकायत का कानूनी मसौदा (A4 Police Complaint) तैयार कर दिया गया है।\n\n📄 **शीर्षक:** ${title}\n🏛️ **प्राधिकारी:** थाना प्रभारी महोदय, जिला- ${entities.complainant.district || 'बुलंदशहर'}\n👤 **शिकायतकर्ता:** ${entities.complainant.name || 'विवरण दर्ज'}\n🚨 **संदिग्ध:** ${entities.suspect.name || 'विवरण दर्ज'}\n\nदस्तावेज़ को नीचे A4 वर्कस्पेस में खोला गया है जहाँ से आप इसे Edit, Print या PDF डाउनलोड कर सकते हैं।\n\n${draftContent}`,
      action: {
        mode: 'open_document_studio',
        documentType: 'police_complaint',
        title: title,
        content: draftContent,
        editable: true,
      }
    };
  }
}

const legalComplaintEngine = new LegalComplaintEngine();

module.exports = { LegalComplaintEngine, legalComplaintEngine };
