import{o as e}from"./rolldown-runtime-DAXXjFlN.js";import{n as t,t as n}from"./jsx-runtime-qcxWs1lu.js";var r=e(t(),1),i=n();function a(){let[e,t]=(0,r.useState)({senderName:``,senderAddress:``,receiverName:``,receiverAddress:``,reason:``}),[n,a]=(0,r.useState)(!1),[o,s]=(0,r.useState)(``),c=e=>{let{name:n,value:r}=e.target;t(e=>({...e,[n]:r}))};return(0,i.jsxs)(`div`,{style:{padding:`20px`,fontFamily:`sans-serif`,maxWidth:`1200px`,margin:`0 auto`},children:[(0,i.jsx)(`h2`,{style:{borderBottom:`2px solid #333`,paddingBottom:`10px`},children:`⚖️ Harshita AI — Legal Notice Workspace`}),(0,i.jsx)(`p`,{style:{color:`#666`},children:`भेजने वाले और विपक्षी की जानकारी भरें, Master AI एडवोकेट लेटरहेड स्टाइल में लीगल नोटिस तैयार कर देगा।`}),(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`30px`,marginTop:`20px`,flexWrap:`wrap`},children:[(0,i.jsxs)(`div`,{style:{flex:`1`,minWidth:`300px`,background:`#f9f9f9`,padding:`20px`,borderRadius:`8px`,boxShadow:`0 2px 4px rgba(0,0,0,0.05)`},children:[(0,i.jsx)(`h3`,{style:{marginTop:`0`},children:`👤 क्लाइंट का विवरण (Sender Info)`}),(0,i.jsx)(`label`,{style:{display:`block`,margin:`10px 0 5px`},children:`नाम (Sender Name):`}),(0,i.jsx)(`input`,{type:`text`,name:`senderName`,value:e.senderName,onChange:c,style:{width:`100%`,padding:`8px`,borderRadius:`4px`,border:`1px solid #ccc`}}),(0,i.jsx)(`label`,{style:{display:`block`,margin:`10px 0 5px`},children:`पता (Sender Address):`}),(0,i.jsx)(`textarea`,{name:`senderAddress`,value:e.senderAddress,onChange:c,rows:`2`,style:{width:`100%`,padding:`8px`,borderRadius:`4px`,border:`1px solid #ccc`,resize:`vertical`}}),(0,i.jsx)(`hr`,{style:{margin:`20px 0`,border:`0`,borderTop:`1px solid #ddd`}}),(0,i.jsx)(`h3`,{style:{marginTop:`0`},children:`🚨 विपक्षी का विवरण (Receiver Info)`}),(0,i.jsx)(`label`,{style:{display:`block`,margin:`10px 0 5px`},children:`नाम (Opposite Party):`}),(0,i.jsx)(`input`,{type:`text`,name:`receiverName`,value:e.receiverName,onChange:c,style:{width:`100%`,padding:`8px`,borderRadius:`4px`,border:`1px solid #ccc`}}),(0,i.jsx)(`label`,{style:{display:`block`,margin:`10px 0 5px`},children:`पता (Receiver Address):`}),(0,i.jsx)(`textarea`,{name:`receiverAddress`,value:e.receiverAddress,onChange:c,rows:`2`,style:{width:`100%`,padding:`8px`,borderRadius:`4px`,border:`1px solid #ccc`,resize:`vertical`}}),(0,i.jsx)(`label`,{style:{display:`block`,margin:`10px 0 5px`},children:`नोटिस का कारण (Reason):`}),(0,i.jsx)(`textarea`,{name:`reason`,value:e.reason,onChange:c,rows:`3`,placeholder:`उदा. चेक बाउंस (Sec 138 NI Act), मकान खाली न करना...`,style:{width:`100%`,padding:`8px`,borderRadius:`4px`,border:`1px solid #ccc`,resize:`vertical`}}),(0,i.jsx)(`button`,{onClick:()=>{a(!0);let t=`
[ADVOCATE LETTERHEAD FORMAT]

REGD. A.D. / SPEED POST
LEGAL NOTICE

To,
${e.receiverName||`[OPPOSITE PARTY NAME]`}
${e.receiverAddress||`[RECEIVER ADDRESS]`}

From: 
${e.senderName||`[CLIENT / SENDER NAME]`}
${e.senderAddress||`[SENDER ADDRESS]`}

Sir/Madam,

Under the instructions of and on behalf of my client ${e.senderName||`[SENDER]`}, I hereby serve you with the following Legal Notice:

1. That my client is a peace-loving citizen and resides at the aforementioned address.
2. That you, the addressee, have committed the following act:
   ${e.reason||`[REASON / CAUSE OF ACTION e.g., Cheque Bounce under Section 138 NI Act, Rent Default etc.]`}
3. That despite repeated requests and reminders by my client, you have failed to comply with your legal obligations.
4. That your actions have caused severe mental agony and financial loss to my client.

I, therefore, call upon you through this Legal Notice to rectify the above-mentioned default and comply with my client's demands within 15 DAYS from the date of receipt of this notice.

Take note that if you fail to comply within the stipulated 15 days, my client has given me clear instructions to initiate appropriate civil/criminal legal proceedings against you in a court of competent jurisdiction, and you shall be held liable for all costs and consequences thereof.

Copy retained in my office for record.

Signature 
(Advocate Name)
Enrollment No: [REDACTED]
    `;setTimeout(()=>{s(t.trim()),a(!1)},800)},style:{marginTop:`20px`,width:`100%`,padding:`12px`,background:`#dc3545`,color:`#fff`,border:`none`,borderRadius:`4px`,cursor:`pointer`,fontSize:`16px`,fontWeight:`bold`},children:n?`🔄 नोटिस तैयार हो रहा है...`:`✍️ लीगल नोटिस जेनरेट करें`})]}),(0,i.jsxs)(`div`,{style:{flex:`1.2`,minWidth:`350px`,border:`1px solid #ddd`,borderRadius:`8px`,padding:`20px`,background:`#fff`,boxShadow:`0 4px 6px rgba(0,0,0,0.02)`},children:[(0,i.jsx)(`h3`,{style:{marginTop:`0`,color:`#2c3e50`},children:`📄 विलेख पूर्वावलोकन (Live Legal Preview)`}),o?(0,i.jsxs)(`div`,{children:[(0,i.jsx)(`pre`,{style:{whiteSpace:`pre-wrap`,background:`#f8f9fa`,padding:`20px`,borderRadius:`6px`,fontSize:`14px`,lineHeight:`1.6`,borderLeft:`4px solid #dc3545`,fontFamily:`monospace`,color:`#333`},children:o}),(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`10px`,marginTop:`15px`},children:[(0,i.jsx)(`button`,{onClick:()=>alert(`PDF Downloading...`),style:{flex:1,padding:`10px`,background:`#28a745`,color:`#fff`,border:`none`,borderRadius:`4px`,cursor:`pointer`,fontWeight:`bold`},children:`📥 Download PDF`}),(0,i.jsx)(`button`,{onClick:()=>{navigator.clipboard.writeText(o),alert(`लीगल नोटिस कॉपी हो गया है!`)},style:{flex:1,padding:`10px`,background:`#6c757d`,color:`#fff`,border:`none`,borderRadius:`4px`,cursor:`pointer`,fontWeight:`bold`},children:`📋 Copy Draft`})]})]}):(0,i.jsx)(`div`,{style:{display:`flex`,height:`80%`,alignItems:`center`,justifyContent:`center`,color:`#999`,border:`2px dashed #ddd`,borderRadius:`6px`,padding:`40px`,textAlign:`center`},children:`फ़ॉर्म भरें और ड्राफ्ट जेनरेट करें।`})]})]})]})}export{a as default};