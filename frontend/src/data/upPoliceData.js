// ═══════════════════════════════════════════════════════════════
// Uttar Pradesh Police Data — Districts, Thanas, Kotwali, Police Lines, PAC
// Categories: कोतवाली, थाना, पुलिस लाइन, रिज़र्व पुलिस लाइन, PAC बटालियन
// ═══════════════════════════════════════════════════════════════

export const STATES = [
  { value: 'UP', label: 'उत्तर प्रदेश / Uttar Pradesh' },
]

// Unit Types for filtering
export const UNIT_TYPES = [
  { value: 'all', label: 'सभी / All' },
  { value: 'kotwali', label: 'कोतवाली' },
  { value: 'thana', label: 'थाना' },
  { value: 'police_line', label: 'पुलिस लाइन' },
  { value: 'reserve', label: 'रिज़र्व पुलिस लाइन' },
  { value: 'pac', label: 'PAC बटालियन' },
]

export const UP_DISTRICTS = [
  'आगरा', 'अलीगढ़', 'अम्बेडकर नगर', 'अमेठी', 'अमरोहा', 'औरैया',
  'अयोध्या', 'आजमगढ़', 'बागपत', 'बहराइच', 'बलिया', 'बलरामपुर',
  'बाँदा', 'बाराबंकी', 'बरेली', 'बस्ती', 'भदोही', 'बिजनौर',
  'बदायूँ', 'बुलंदशहर', 'चंदौली', 'चित्रकूट', 'देवरिया', 'एटा',
  'इटावा', 'फर्रुखाबाद', 'फतेहपुर', 'फिरोजाबाद', 'गौतमबुद्ध नगर',
  'गाजियाबाद', 'गाजीपुर', 'गोंडा', 'गोरखपुर', 'हमीरपुर',
  'हापुड़', 'हरदोई', 'हाथरस', 'जालौन', 'जौनपुर', 'झाँसी',
  'कन्नौज', 'कानपुर देहात', 'कानपुर नगर', 'कासगंज', 'कौशाम्बी',
  'कुशीनगर', 'लखीमपुर खीरी', 'ललितपुर', 'लखनऊ', 'महाराजगंज',
  'महोबा', 'मैनपुरी', 'मथुरा', 'मऊ', 'मेरठ', 'मिर्जापुर',
  'मुरादाबाद', 'मुजफ्फरनगर', 'पीलीभीत', 'प्रतापगढ़', 'प्रयागराज',
  'रायबरेली', 'रामपुर', 'सहारनपुर', 'संभल', 'संत कबीर नगर',
  'शाहजहाँपुर', 'शामली', 'श्रावस्ती', 'सिद्धार्थनगर', 'सीतापुर',
  'सोनभद्र', 'सुल्तानपुर', 'उन्नाव', 'वाराणसी',
]

// ═══════════════════════════════════════════════════════════════
// Police Units by District — { type, name }
// type: 'kotwali' | 'thana' | 'police_line' | 'reserve' | 'pac'
// ═══════════════════════════════════════════════════════════════
export const UP_POLICE_UNITS = {
  'कन्नौज': [
    // कोतवाली
    { type: 'kotwali', name: 'कोतवाली नगर कन्नौज' },
    { type: 'kotwali', name: 'कोतवाली देहात कन्नौज' },
    // थाना
    { type: 'thana', name: 'थाना सौरीख' },
    { type: 'thana', name: 'थाना छिबरामऊ' },
    { type: 'thana', name: 'थाना तिर्वा' },
    { type: 'thana', name: 'थाना जलालाबाद' },
    { type: 'thana', name: 'थाना गुरसहायगंज' },
    { type: 'thana', name: 'थाना इंदरगढ़' },
    { type: 'thana', name: 'थाना सकरावा' },
    { type: 'thana', name: 'थाना ठठिया' },
    { type: 'thana', name: 'थाना कानपुर रोड' },
    { type: 'thana', name: 'थाना हसनगंज' },
    { type: 'thana', name: 'महिला थाना कन्नौज' },
    // पुलिस लाइन / रिज़र्व
    { type: 'police_line', name: 'पुलिस लाइन कन्नौज' },
    { type: 'reserve', name: 'रिज़र्व पुलिस लाइन कन्नौज' },
  ],
  'कानपुर नगर': [
    { type: 'kotwali', name: 'कोतवाली कानपुर' },
    { type: 'kotwali', name: 'कोतवाली चकेरी' },
    { type: 'thana', name: 'थाना गोविंदनगर' },
    { type: 'thana', name: 'थाना कल्यानपुर' },
    { type: 'thana', name: 'थाना बर्रा' },
    { type: 'thana', name: 'थाना पनकी' },
    { type: 'thana', name: 'थाना बिठूर' },
    { type: 'thana', name: 'थाना सजेती' },
    { type: 'thana', name: 'थाना नौबस्ता' },
    { type: 'thana', name: 'थाना किदवई नगर' },
    { type: 'thana', name: 'थाना फजलगंज' },
    { type: 'thana', name: 'थाना बबुरपुरवा' },
    { type: 'thana', name: 'महिला थाना कानपुर' },
    { type: 'police_line', name: 'पुलिस लाइन कानपुर' },
    { type: 'reserve', name: 'रिज़र्व पुलिस लाइन कानपुर' },
  ],
  'लखनऊ': [
    { type: 'kotwali', name: 'कोतवाली लखनऊ' },
    { type: 'kotwali', name: 'कोतवाली चौक' },
    { type: 'thana', name: 'थाना हजरतगंज' },
    { type: 'thana', name: 'थाना गोमतीनगर' },
    { type: 'thana', name: 'थाना अलीगंज' },
    { type: 'thana', name: 'थाना इंदिरानगर' },
    { type: 'thana', name: 'थाना विभूतिखंड' },
    { type: 'thana', name: 'थाना आशियाना' },
    { type: 'thana', name: 'थाना मड़ियांव' },
    { type: 'thana', name: 'थाना काकोरी' },
    { type: 'thana', name: 'थाना मोहनलालगंज' },
    { type: 'thana', name: 'थाना गुडम्बा' },
    { type: 'thana', name: 'थाना सआदतगंज' },
    { type: 'thana', name: 'महिला थाना लखनऊ' },
    { type: 'police_line', name: 'पुलिस लाइन लखनऊ' },
    { type: 'reserve', name: 'रिज़र्व पुलिस लाइन लखनऊ' },
  ],
  'झाँसी': [
    { type: 'kotwali', name: 'कोतवाली झाँसी' },
    { type: 'kotwali', name: 'कोतवाली सिविल लाइन झाँसी' },
    { type: 'thana', name: 'थाना एलिट चौराहा' },
    { type: 'thana', name: 'थाना बरुआसागर' },
    { type: 'thana', name: 'थाना मोठ' },
    { type: 'thana', name: 'थाना गरौठा' },
    { type: 'thana', name: 'थाना चिरगाँव' },
    { type: 'thana', name: 'थाना बबीना' },
    { type: 'thana', name: 'महिला थाना झाँसी' },
    { type: 'police_line', name: 'पुलिस लाइन झाँसी' },
    { type: 'reserve', name: 'रिज़र्व पुलिस लाइन झाँसी' },
  ],
  'प्रयागराज': [
    { type: 'kotwali', name: 'कोतवाली प्रयागराज' },
    { type: 'kotwali', name: 'कोतवाली जॉर्ज टाउन' },
    { type: 'thana', name: 'थाना सिविल लाइन' },
    { type: 'thana', name: 'थाना धूमनगंज' },
    { type: 'thana', name: 'थाना करेली' },
    { type: 'thana', name: 'थाना नैनी' },
    { type: 'thana', name: 'थाना झूँसी' },
    { type: 'thana', name: 'थाना शंकरगढ़' },
    { type: 'thana', name: 'थाना मेजा' },
    { type: 'thana', name: 'महिला थाना प्रयागराज' },
    { type: 'police_line', name: 'पुलिस लाइन प्रयागराज' },
    { type: 'reserve', name: 'रिज़र्व पुलिस लाइन प्रयागराज' },
  ],
  'वाराणसी': [
    { type: 'kotwali', name: 'कोतवाली वाराणसी' },
    { type: 'kotwali', name: 'कोतवाली चौक' },
    { type: 'thana', name: 'थाना दशाश्वमेध' },
    { type: 'thana', name: 'थाना भेलूपुर' },
    { type: 'thana', name: 'थाना लंका' },
    { type: 'thana', name: 'थाना सिगरा' },
    { type: 'thana', name: 'थाना कैंट' },
    { type: 'thana', name: 'थाना चोलापुर' },
    { type: 'thana', name: 'थाना आदमपुर' },
    { type: 'thana', name: 'महिला थाना वाराणसी' },
    { type: 'police_line', name: 'पुलिस लाइन वाराणसी' },
    { type: 'reserve', name: 'रिज़र्व पुलिस लाइन वाराणसी' },
  ],
  'गोरखपुर': [
    { type: 'kotwali', name: 'कोतवाली गोरखपुर' },
    { type: 'kotwali', name: 'कोतवाली गोरखनाथ' },
    { type: 'thana', name: 'थाना कैंट' },
    { type: 'thana', name: 'थाना रामगढ़ताल' },
    { type: 'thana', name: 'थाना शाहपुर' },
    { type: 'thana', name: 'थाना पिपराइच' },
    { type: 'thana', name: 'थाना बाँसगाँव' },
    { type: 'thana', name: 'थाना खोराबार' },
    { type: 'thana', name: 'महिला थाना गोरखपुर' },
    { type: 'police_line', name: 'पुलिस लाइन गोरखपुर' },
    { type: 'reserve', name: 'रिज़र्व पुलिस लाइन गोरखपुर' },
  ],
  'आगरा': [
    { type: 'kotwali', name: 'कोतवाली आगरा' },
    { type: 'kotwali', name: 'कोतवाली ताजगंज' },
    { type: 'thana', name: 'थाना सदर बाजार' },
    { type: 'thana', name: 'थाना हरीपर्वत' },
    { type: 'thana', name: 'थाना शाहगंज' },
    { type: 'thana', name: 'थाना एत्मादपुर' },
    { type: 'thana', name: 'थाना फतेहाबाद' },
    { type: 'thana', name: 'थाना लोहामंडी' },
    { type: 'thana', name: 'थाना जगदीशपुरा' },
    { type: 'thana', name: 'महिला थाना आगरा' },
    { type: 'police_line', name: 'पुलिस लाइन आगरा' },
    { type: 'reserve', name: 'रिज़र्व पुलिस लाइन आगरा' },
  ],
  'मेरठ': [
    { type: 'kotwali', name: 'कोतवाली मेरठ' },
    { type: 'kotwali', name: 'कोतवाली सिविल लाइन मेरठ' },
    { type: 'thana', name: 'थाना लिसाड़ी गेट' },
    { type: 'thana', name: 'थाना ब्रह्मपुरी' },
    { type: 'thana', name: 'थाना सरधना' },
    { type: 'thana', name: 'थाना मवाना' },
    { type: 'thana', name: 'थाना मेडिकल' },
    { type: 'thana', name: 'महिला थाना मेरठ' },
    { type: 'police_line', name: 'पुलिस लाइन मेरठ' },
    { type: 'reserve', name: 'रिज़र्व पुलिस लाइन मेरठ' },
  ],
  'अयोध्या': [
    { type: 'kotwali', name: 'कोतवाली अयोध्या' },
    { type: 'kotwali', name: 'कोतवाली फैजाबाद' },
    { type: 'thana', name: 'थाना कैंट' },
    { type: 'thana', name: 'थाना बीकापुर' },
    { type: 'thana', name: 'थाना रुदौली' },
    { type: 'thana', name: 'थाना मिल्कीपुर' },
    { type: 'thana', name: 'महिला थाना अयोध्या' },
    { type: 'police_line', name: 'पुलिस लाइन अयोध्या' },
    { type: 'reserve', name: 'रिज़र्व पुलिस लाइन अयोध्या' },
  ],
}

// ═══════════════════════════════════════════════════════════════
// PAC Battalions — Provincial Armed Constabulary (33 Battalions)
// ═══════════════════════════════════════════════════════════════
export const PAC_BATTALIONS = [
  { name: '1st PAC Battalion, मेरठ', location: 'मेरठ' },
  { name: '2nd PAC Battalion, आगरा', location: 'आगरा' },
  { name: '3rd PAC Battalion, बरेली', location: 'बरेली' },
  { name: '4th PAC Battalion, कानपुर', location: 'कानपुर' },
  { name: '5th PAC Battalion, प्रयागराज', location: 'प्रयागराज' },
  { name: '6th PAC Battalion, लखनऊ', location: 'लखनऊ' },
  { name: '7th PAC Battalion, मुरादाबाद', location: 'मुरादाबाद' },
  { name: '8th PAC Battalion, वाराणसी', location: 'वाराणसी' },
  { name: '9th PAC Battalion, गोरखपुर', location: 'गोरखपुर' },
  { name: '10th PAC Battalion, सीतापुर', location: 'सीतापुर' },
  { name: '11th PAC Battalion, अलीगढ़', location: 'अलीगढ़' },
  { name: '12th PAC Battalion, गाजियाबाद', location: 'गाजियाबाद' },
  { name: '13th PAC Battalion, मथुरा', location: 'मथुरा' },
  { name: '14th PAC Battalion, झाँसी', location: 'झाँसी' },
  { name: '15th PAC Battalion, बाँदा', location: 'बाँदा' },
  { name: '16th PAC Battalion, फैजाबाद', location: 'अयोध्या' },
  { name: '17th PAC Battalion, सुल्तानपुर', location: 'सुल्तानपुर' },
  { name: '18th PAC Battalion, आजमगढ़', location: 'आजमगढ़' },
  { name: '19th PAC Battalion, बलिया', location: 'बलिया' },
  { name: '20th PAC Battalion, देवरिया', location: 'देवरिया' },
  { name: '21st PAC Battalion, बस्ती', location: 'बस्ती' },
  { name: '22nd PAC Battalion, बहराइच', location: 'बहराइच' },
  { name: '23rd PAC Battalion, लखीमपुर', location: 'लखीमपुर खीरी' },
  { name: '24th PAC Battalion, शाहजहाँपुर', location: 'शाहजहाँपुर' },
  { name: '25th PAC Battalion, रामपुर', location: 'रामपुर' },
  { name: '26th PAC Battalion, सहारनपुर', location: 'सहारनपुर' },
  { name: '27th PAC Battalion, मुजफ्फरनगर', location: 'मुजफ्फरनगर' },
  { name: '28th PAC Battalion, बुलंदशहर', location: 'बुलंदशहर' },
  { name: '29th PAC Battalion, इटावा', location: 'इटावा' },
  { name: '30th PAC Battalion, फर्रुखाबाद', location: 'फर्रुखाबाद' },
  { name: '31st PAC Battalion, बदायूँ', location: 'बदायूँ' },
  { name: '32nd PAC Battalion, पीलीभीत', location: 'पीलीभीत' },
  { name: '33rd PAC Battalion, गौतमबुद्ध नगर', location: 'गौतमबुद्ध नगर' },
  // Women PAC Battalions
  { name: 'रानी अवंतीबाई लोधी महिला PAC, बदायूँ', location: 'बदायूँ' },
  { name: 'ऊदा देवी महिला PAC, लखनऊ', location: 'लखनऊ' },
  { name: 'झलकारी बाई महिला PAC, गोरखपुर', location: 'गोरखपुर' },
]

// Helper: Get all units for a district (thana + kotwali + police line + PAC)
export function getUnitsForDistrict(district, typeFilter = 'all') {
  const units = UP_POLICE_UNITS[district] || []
  const pacInDistrict = PAC_BATTALIONS.filter(p => p.location === district).map(p => ({ type: 'pac', name: p.name }))
  const allUnits = [...units, ...pacInDistrict]

  if (typeFilter === 'all') return allUnits
  return allUnits.filter(u => u.type === typeFilter)
}

// ═══════════════════════════════════════════════════════════════
// Designations with Pay Details (7th Pay Commission)
// ═══════════════════════════════════════════════════════════════
export const DESIGNATIONS = [
  { label: 'आरक्षी / Constable', value: 'आरक्षी', payLevel: 'Level-3', gradePay: '2000', basicPay: '21700' },
  { label: 'हेड कांस्टेबल / Head Constable', value: 'हेड कांस्टेबल', payLevel: 'Level-4', gradePay: '2400', basicPay: '25500' },
  { label: 'ASI / उप निरीक्षक', value: 'उप निरीक्षक (ASI)', payLevel: 'Level-5', gradePay: '2800', basicPay: '29200' },
  { label: 'SI / दरोगा', value: 'दरोगा (SI)', payLevel: 'Level-6', gradePay: '4200', basicPay: '35400' },
  { label: 'Inspector / निरीक्षक', value: 'निरीक्षक', payLevel: 'Level-7', gradePay: '4600', basicPay: '44900' },
  { label: 'SHO / थानाध्यक्ष', value: 'थानाध्यक्ष (SHO)', payLevel: 'Level-7', gradePay: '4600', basicPay: '44900' },
  { label: 'CO / Circle Officer', value: 'वृत्ताधिकारी (CO)', payLevel: 'Level-10', gradePay: '5400', basicPay: '56100' },
  { label: 'DSP / उप पुलिस अधीक्षक', value: 'उप पुलिस अधीक्षक', payLevel: 'Level-10', gradePay: '5400', basicPay: '56100' },
  { label: 'SP / पुलिस अधीक्षक', value: 'पुलिस अधीक्षक', payLevel: 'Level-13', gradePay: '8700', basicPay: '123100' },
  { label: 'Driver / चालक', value: 'चालक', payLevel: 'Level-2', gradePay: '1900', basicPay: '19900' },
  { label: 'Clerk / लिपिक', value: 'लिपिक', payLevel: 'Level-2', gradePay: '1900', basicPay: '19900' },
  { label: 'PAC Constable / PAC आरक्षी', value: 'PAC आरक्षी', payLevel: 'Level-3', gradePay: '2000', basicPay: '21700' },
  { label: 'PAC Head Constable', value: 'PAC हेड कांस्टेबल', payLevel: 'Level-4', gradePay: '2400', basicPay: '25500' },
  { label: 'PAC Sub Inspector', value: 'PAC उप निरीक्षक', payLevel: 'Level-6', gradePay: '4200', basicPay: '35400' },
  { label: 'Company Commander', value: 'कंपनी कमांडर', payLevel: 'Level-7', gradePay: '4600', basicPay: '44900' },
]

// Pay Levels (7th Pay Commission)
export const PAY_LEVELS = [
  { value: 'Level-1', label: 'Level-1 (₹18,000-56,900)', gradePay: '1800' },
  { value: 'Level-2', label: 'Level-2 (₹19,900-63,200)', gradePay: '1900' },
  { value: 'Level-3', label: 'Level-3 (₹21,700-69,100)', gradePay: '2000' },
  { value: 'Level-4', label: 'Level-4 (₹25,500-81,100)', gradePay: '2400' },
  { value: 'Level-5', label: 'Level-5 (₹29,200-92,300)', gradePay: '2800' },
  { value: 'Level-6', label: 'Level-6 (₹35,400-1,12,400)', gradePay: '4200' },
  { value: 'Level-7', label: 'Level-7 (₹44,900-1,42,400)', gradePay: '4600' },
  { value: 'Level-8', label: 'Level-8 (₹47,600-1,51,100)', gradePay: '4800' },
  { value: 'Level-9', label: 'Level-9 (₹53,100-1,67,800)', gradePay: '5400' },
  { value: 'Level-10', label: 'Level-10 (₹56,100-1,77,500)', gradePay: '5400' },
  { value: 'Level-11', label: 'Level-11 (₹67,700-2,08,700)', gradePay: '6600' },
  { value: 'Level-12', label: 'Level-12 (₹78,800-2,09,200)', gradePay: '7600' },
  { value: 'Level-13', label: 'Level-13 (₹1,23,100-2,15,900)', gradePay: '8700' },
]

// Years
export const YEARS = Array.from({ length: 10 }, (_, i) => {
  const y = new Date().getFullYear() - i
  return { value: String(y), label: String(y) }
})

// Duty purposes — comprehensive UP Police duty list
export const DUTY_PURPOSES = [
  // VVIP / Suraksha
  'VVIP ड्यूटी',
  'सुरक्षा ड्यूटी',
  'निगरानी ड्यूटी',
  'ऊर्जा मंत्री जी के यहाँ आवास सुरक्षा ड्यूटी',
  'मुख्यमंत्री जी की सुरक्षा ड्यूटी',
  'राज्यपाल सुरक्षा ड्यूटी',
  'मंत्री जी आवास सुरक्षा ड्यूटी',
  'विधायक सुरक्षा ड्यूटी',
  'सांसद सुरक्षा ड्यूटी',
  'न्यायाधीश सुरक्षा ड्यूटी',
  'पाइलट कार ड्यूटी',
  'एस्कॉर्ट ड्यूटी',
  // QRT / Reserve
  'QRT ड्यूटी',
  'रिज़र्व ड्यूटी',
  'कमान ड्यूटी',
  'गनर ड्यूटी',
  // Routine
  'गश्त ड्यूटी',
  'पेट्रोलिंग',
  'नाका ड्यूटी',
  'चेकिंग ड्यूटी',
  // Court / Investigation
  'कोर्ट पेशी',
  'गवाही ड्यूटी',
  'मुलजिम पेशी',
  'पुलिस अभिरक्षा',
  'जेल ड्यूटी',
  // Investigation
  'विवेचना',
  'छापेमारी',
  'गिरफ्तारी ड्यूटी',
  'तलाशी ड्यूटी',
  // Crowd control
  'बंदोबस्त',
  'मेला ड्यूटी',
  'जुलूस ड्यूटी',
  'कानून व्यवस्था',
  'दंगा नियंत्रण',
  // Election
  'चुनाव ड्यूटी',
  'मतगणना ड्यूटी',
  'पोलिंग बूथ ड्यूटी',
  // Training & Other
  'प्रशिक्षण',
  'मीटिंग ड्यूटी',
  'विभागीय कार्य',
  'अन्य (Other - खुद लिखें)',
]

// Travel modes
export const TRAVEL_MODES = ['बस से', 'ऑटो', 'ट्रेन', 'बाइक', 'कार', 'पैदल', 'टैक्सी']

// Vehicle types
export const VEHICLE_TYPES = ['सरकारी', 'प्राइवेट', 'रोडवेज', 'निजी']
