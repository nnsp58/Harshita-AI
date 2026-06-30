# PRD 14 — Rural Help Engine

## Overview

The Rural Help Engine is designed specifically for Indian rural users — providing access to government schemes, village-level services, agriculture support, and complaint writing in simple Hindi.

---

## Rural Skills

| Skill | Hindi Name | Description | Offline |
|-------|------------|-------------|---------|
| Electricity Complaint | बिजली शिकायत | Power outage, voltage issues | ✅ |
| Pension Help | पेंशन सहायता | Old age, widow, disability pension | ✅ |
| Government Scheme | सरकारी योजना | PM Awas, Ujjwala, Kisan Samman | ❌ |
| Farmer Support | किसान सहायता | Crop info, MSP, market prices | ❌ |
| Tubewell Complaint | ट्यूबवेल शिकायत | Handpump/tubewell repair requests | ✅ |
| Village Mapping | गाँव मैपिंग | Village boundary, land records | ❌ |
| Gram Panchayat | ग्राम पंचायत | Panchayat services, forms | ✅ |
| Certificate Writer | प्रमाण पत्र | Income, caste, residence certificates | ✅ |
| Application Writer | आवेदन लेखन | Government applications in Hindi | ✅ |
| Complaint Writer | शिकायत लेखन | Formal complaints to authorities | ✅ |

---

## Government Schemes Database

| Scheme | Hindi Name | Department |
|--------|------------|------------|
| PM Awas Yojana | पीएम आवास योजना | Housing |
| PM Kisan Samman | पीएम किसान सम्मान | Agriculture |
| Ujjwala Yojana | उज्ज्वला योजना | LPG Gas |
| Atal Pension | अटल पेंशन योजना | Pension |
| Sukanya Samriddhi | सुकन्या समृद्धि | Girl Child |
| Jan Dhan | जन धन योजना | Banking |
| Ayushman Bharat | आयुष्मान भारत | Health |
| Mudra Yojana | मुद्रा योजना | Business Loan |
| Fasal Bima | फसल बीमा योजना | Crop Insurance |
| Mahatma Gandhi NREGA | मनरेगा | Employment |

---

## Design Principles for Rural Users

1. **Simple Hindi** — No technical jargon, no English terms
2. **Voice First** — Many rural users prefer speaking over typing
3. **Step-by-Step** — Guide through process one step at a time
4. **Offline Capable** — Templates and forms work without internet
5. **Low Data** — Minimal data consumption
6. **Large Text** — Accessible font sizes
7. **Icon-Based Navigation** — Visual cues for illiterate users

---

## Example Interaction

```
User: "bijli nahi aa rahi hai 3 din se"

AI Response:
⚡ बिजली शिकायत दर्ज करने के लिए:

आपका नाम: _______________
गाँव/मोहल्ला: _______________
जिला: _______________
उपभोक्ता नंबर: _______________
कितने दिन से बिजली नहीं है: 3 दिन

📞 शिकायत नंबर: 1912

📝 क्या मैं आपके लिए बिजली विभाग को शिकायत पत्र लिखूँ?
```
