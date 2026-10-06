/**
 * Full Page Real-Time Translation Engine for AgroNova
 * Combines instant client-side DOM translation + Google Translate engine integration
 * Translates every element, card, advice, description, and button across the entire page.
 */

import { type Language } from "./agronova-demo";

// Dictionary mapping common phrases and dynamic text to target languages
export const translationDictionary: Record<string, Record<Exclude<Language, "en">, string>> = {
  // Navigation & General
  AgroNova: { bn: "এগ্রোনোভা", hi: "एग्रोनोवा", es: "AgroNova", sw: "AgroNova" },
  "Demo workspace": {
    bn: "ডেমো কর্মক্ষেত্র",
    hi: "डेमो कार्यक्षेत्र",
    es: "Espacio de prueba",
    sw: "Sehemu ya majaribio",
  },
  Nova: { bn: "নোভা", hi: "नोवा", es: "Nova", sw: "Nova" },
  NOVA: { bn: "নোভা", hi: "नोवा", es: "Nova", sw: "Nova" },
  "Farmer Workspace": {
    bn: "কৃষক কর্মক্ষেত্র",
    hi: "किसान कार्यक्षेत्र",
    es: "Espacio del agricultor",
    sw: "Sehemu ya mkulima",
  },
  "Live NASA Observations · Bangladesh Fields": {
    bn: "সরাসরি নাসা পর্যবেক্ষণ · বাংলাদেশের ফসলি জমি",
    hi: "लाइव नासा अवलोकन · बांग्लादेश के खेत",
    es: "Observaciones en vivo de la NASA · Campos de Bangladesh",
    sw: "Uchunguzi wa moja kwa moja wa NASA · Mashamba ya Bangladesh",
  },
  "My farm · Live NASA Observations": {
    bn: "আমার খামার · সরাসরি নাসা পর্যবেক্ষণ",
    hi: "मेरा खेत · लाइव नासा अवलोकन",
    es: "Mi finca · Observaciones de la NASA en vivo",
    sw: "Shamba langu · Uchunguzi wa NASA wa moja kwa moja",
  },
  Online: { bn: "অনলাইন", hi: "ऑनलाइन", es: "En línea", sw: "Mtandaoni" },
  "Offline · cached": {
    bn: "অফলাইন · ক্যাশ সংরক্ষিত",
    hi: "ऑफलाइन · कैश्ड",
    es: "Sin conexión · en caché",
    sw: "Nje ya mtandao · imehifadhiwa",
  },
  "You are offline. Showing cached field data.": {
    bn: "আপনি অফলাইনে আছেন। সংরক্ষিত তথ্য দেখানো হচ্ছে।",
    hi: "आप ऑफ़लाइन हैं। कैश्ड खेत डेटा दिखाया जा रहा है।",
    es: "Estás sin conexión. Mostrando datos de campo en caché.",
    sw: "Uko nje ya mtandao. Inayonyesha data iliyohifadhiwa.",
  },
  "Login / Signup": {
    bn: "লগইন / সাইন আপ",
    hi: "लॉगिन / साइन अप",
    es: "Iniciar sesión / Registrarse",
    sw: "Ingia / Jisajili",
  },
  "Sign out": { bn: "সাইন আউট", hi: "साइन आउट", es: "Cerrar sesión", sw: "Toka" },
  "Save plan": {
    bn: "পরিকল্পনা সংরক্ষণ",
    hi: "योजना सहेजें",
    es: "Guardar plan",
    sw: "Hifadhi mpango",
  },
  Save: { bn: "সংরক্ষণ", hi: "सहेजें", es: "Guardar", sw: "Hifadhi" },
  Saved: { bn: "সংরক্ষিত", hi: "सहेजा गया", es: "Guardado", sw: "Imehifadhiwa" },
  Share: { bn: "শেয়ার করুন", hi: "साझा करें", es: "Compartir", sw: "Shiriki" },
  "Export / Print": {
    bn: "রপ্তানি / প্রিন্ট",
    hi: "निर्यात / प्रिंट",
    es: "Exportar / Imprimir",
    sw: "Hamisha / Chapisha",
  },
  "Download PDF": {
    bn: "পিডিএফ ডাউনলোড",
    hi: "पीडीएफ डाउनलोड",
    es: "Descargar PDF",
    sw: "Pakua PDF",
  },
  Select: { bn: "নির্বাচন করুন", hi: "चुनें", es: "Seleccionar", sw: "Chagua" },
  Selected: { bn: "নির্বাচিত", hi: "चयनित", es: "Seleccionado", sw: "Imechaguliwa" },
  "View evidence": {
    bn: "প্রমাণ দেখুন",
    hi: "साक्ष्य देखें",
    es: "Ver evidencia",
    sw: "Tazama ushahidi",
  },
  "Why am I seeing this?": {
    bn: "আমি এটি কেন দেখছি?",
    hi: "मुझे यह क्यों दिख रहा है?",
    es: "¿Por qué veo esto?",
    sw: "Kwanini naona hii?",
  },

  // Tabs
  Field: { bn: "জমি", hi: "खेत", es: "Parcela", sw: "Shamba" },
  "Field health": {
    bn: "জমির স্বাস্থ্য",
    hi: "खेत का स्वास्थ्य",
    es: "Salud del campo",
    sw: "Afya ya shamba",
  },
  "Rotation Lab": {
    bn: "ফসল আবর্তন ল্যাব",
    hi: "फसल चक्र लैब",
    es: "Laboratorio de rotación",
    sw: "Maabara ya Mzunguko",
  },
  Compare: { bn: "তুলনা", hi: "तुलना", es: "Comparar", sw: "Linganisha" },
  "What-If": {
    bn: "পরিস্থিতি পরীক্ষা",
    hi: "क्या-अगर सिम्युलेटर",
    es: "¿Qué pasaría si?",
    sw: "Kielelezo cha Nini-Ikiwa",
  },
  "Crop Doctor": {
    bn: "ফসল ডাক্তার",
    hi: "फसल डॉक्टर",
    es: "Doctor de cultivos",
    sw: "Daktari wa Mazao",
  },
  "7-Day Forecast": {
    bn: "৭ দিনের পূর্বাভাস",
    hi: "7-दिन का पूर्वानुमान",
    es: "Pronóstico de 7 días",
    sw: "Utabiri wa Siku 7",
  },
  "Crop library": {
    bn: "ফসল তথ্যভান্ডার",
    hi: "फसल पुस्तकालय",
    es: "Biblioteca de cultivos",
    sw: "Maktaba ya mazao",
  },
  History: { bn: "ইতিহাস", hi: "इतिहास", es: "Historial", sw: "Historia" },
  "How it works": {
    bn: "কীভাবে কাজ করে",
    hi: "यह कैसे काम करता है",
    es: "Cómo funciona",
    sw: "Jinsi inavyofanya kazi",
  },
  Profile: { bn: "প্রোফাইল", hi: "प्रोफाइल", es: "Perfil", sw: "Wasifu" },
  "Ask Nova": {
    bn: "নোভাকে জিজ্ঞাসা করুন",
    hi: "नोवा से पूछें",
    es: "Pregunta a Nova",
    sw: "Uliza Nova",
  },

  // Field explorer
  "Step 1": { bn: "ধাপ ১", hi: "चरण 1", es: "Paso 1", sw: "Hatua ya 1" },
  "Choose your field": {
    bn: "আপনার জমি নির্বাচন করুন",
    hi: "अपना खेत चुनें",
    es: "Elige tu parcela",
    sw: "Chagua shamba lako",
  },
  "Search district or field…": {
    bn: "জেলা বা জমি অনুসন্ধান করুন…",
    hi: "जिला या खेत खोजें…",
    es: "Buscar distrito o parcela…",
    sw: "Tafuta wilaya au shamba…",
  },
  "Search district or field...": {
    bn: "জেলা বা জমি অনুসন্ধান করুন…",
    hi: "जिला या खेत खोजें…",
    es: "Buscar distrito o parcela…",
    sw: "Tafuta wilaya au shamba…",
  },
  "OpenStreetMap. Tap a pin to select a field, or tap anywhere on the map to pick coordinates.": {
    bn: "ওপেনস্ট্রিটম্যাপ। জমি নির্বাচন করতে পিনে ট্যাপ করুন, বা স্থানাঙ্ক নিতে মানচিত্রে যেকোনো স্থানে ট্যাপ করুন।",
    hi: "ओपनस्ट्रीटमैप। खेत चुनने के लिए पिन पर टैप करें, या निर्देशांक चुनने के लिए मानचित्र पर कहीं भी टैप करें।",
    es: "OpenStreetMap. Toca un marcador para seleccionar una parcela o toca en cualquier lugar para elegir coordenadas.",
    sw: "OpenStreetMap. Gusa pini ili kuchagua shamba, au gusa popote kwenye ramani ili kuchukua viwianishi.",
  },
  "No field matches.": {
    bn: "কোনো জমি মেলেনি।",
    hi: "कोई खेत मेल नहीं खाता।",
    es: "Ninguna parcela coincide.",
    sw: "Hakuna shamba linalolingana.",
  },
  Coordinates: { bn: "স্থানাঙ্ক", hi: "निर्देशांक", es: "Coordenadas", sw: "Viwianishi" },
  Season: { bn: "মৌসুম", hi: "मौसम / ऋतु", es: "Temporada", sw: "Msimu" },
  Water: { bn: "পানির উৎস", hi: "पानी की उपलब्धता", es: "Agua", sw: "Maji" },
  Priority: { bn: "অগ্রাধিকার", hi: "प्राथमिकता", es: "Prioridad", sw: "Kipaumbele" },
  Soil: { bn: "মাটি", hi: "मिट्टी", es: "Suelo", sw: "Udongo" },
  "Soil type": {
    bn: "মাটির ধরন",
    hi: "मिट्टी का प्रकार",
    es: "Tipo de suelo",
    sw: "Aina ya udongo",
  },
  Size: { bn: "আয়তন", hi: "आकार", es: "Tamaño", sw: "Ukubwa" },
  "Size (ha)": {
    bn: "আয়তন (হেক্টর)",
    hi: "आकार (हेक्टेयर)",
    es: "Tamaño (ha)",
    sw: "Ukubwa (ha)",
  },
  Crop: { bn: "ফসল", hi: "फसल", es: "Cultivo", sw: "Zao" },
  "See field health & NASA data →": {
    bn: "জমির স্বাস্থ্য ও নাসা তথ্য দেখুন →",
    hi: "खेत का स्वास्थ्य और नासा डेटा देखें →",
    es: "Ver salud del campo y datos de la NASA →",
    sw: "Ona afya ya shamba na data ya NASA →",
  },
  "Go to field health →": {
    bn: "জমির স্বাস্থ্যে যান →",
    hi: "खेत के स्वास्थ्य पर जाएं →",
    es: "Ir a salud del campo →",
    sw: "Nenda kwenye afya ya shamba →",
  },

  // Health
  "Step 2": { bn: "ধাপ ২", hi: "चरण 2", es: "Paso 2", sw: "Hatua ya 2" },
  "NASA evidence & field health": {
    bn: "নাসা উপাত্ত ও জমির স্বাস্থ্য",
    hi: "नासा साक्ष्य और खेत का स्वास्थ्य",
    es: "Evidencia de la NASA y salud del campo",
    sw: "Ushahidi wa NASA na afya ya shamba",
  },
  "Working Real-Time NASA POWER Observations": {
    bn: "সরাসরি সক্রিয় নাসা পাওয়ার পর্যবেক্ষণ",
    hi: "सक्रिय रीयल-टाइम नासा पावर अवलोकन",
    es: "Observaciones de la NASA POWER en tiempo real",
    sw: "Uchunguzi wa Moja kwa Moja wa NASA POWER",
  },
  "Fetching NASA Observations…": {
    bn: "নাসা পর্যবেক্ষণ আনা হচ্ছে…",
    hi: "नासा अवलोकन प्राप्त हो रहे हैं…",
    es: "Obteniendo observaciones de la NASA…",
    sw: "Inaleta uchunguzi wa NASA…",
  },
  "Daily Irrigation": {
    bn: "দৈনিক সেচ",
    hi: "दैनिक सिंचाई",
    es: "Riego diario",
    sw: "Umwagiliaji wa kila siku",
  },
  "Daily Irrigation Need": {
    bn: "দৈনিক সেচের চাহিদা",
    hi: "दैनिक सिंचाई की आवश्यकता",
    es: "Necesidad diaria de riego",
    sw: "Mahitaji ya kila siku ya umwagiliaji",
  },
  "Heat Risk": {
    bn: "তাপমাত্রা ঝুঁকি",
    hi: "गर्मी का जोखिम",
    es: "Riesgo de calor",
    sw: "Hatari ya joto",
  },
  "Solar & Humidity": {
    bn: "সৌর বিকিরণ ও আর্দ্রতা",
    hi: "सौर विकिरण और आर्द्रता",
    es: "Radiación solar y humedad",
    sw: "Mwangaza wa jua na unyevu",
  },
  "Pest Microclimate": {
    bn: "কীটপতঙ্গ ও ছত্রাক আবহাওয়া",
    hi: "कीट एवं कवक सूक्ष्मजलवायु",
    es: "Microclima de plagas y hongos",
    sw: "Hali ya wadudu na magonjwa",
  },
  "NASA Environmental Trends": {
    bn: "নাসা পরিবেশগত পরিবর্তনের ধারা",
    hi: "नासा पर्यावरणीय रुझान",
    es: "Tendencias ambientales de la NASA",
    sw: "Mwenendo wa mazingira wa NASA",
  },
  Temperature: { bn: "তাপমাত্রা", hi: "तापमान", es: "Temperatura", sw: "Joto" },
  Rainfall: { bn: "বৃষ্টিপাত", hi: "वर्षा", es: "Precipitación", sw: "Mvua" },
  "Soil Moisture Index (%)": {
    bn: "মাটির আর্দ্রতা সূচক (%)",
    hi: "मृदा नमी सूचकांक (%)",
    es: "Índice de humedad del suelo (%)",
    sw: "Kipimo cha unyevu wa udongo (%)",
  },
  "Vegetation Vitality": {
    bn: "উদ্ভিদ জীবনীশক্তি",
    hi: "वनस्पति जीवन शक्ति",
    es: "Vitalidad de la vegetación",
    sw: "Uhhai wa mimea",
  },
  "7 days": { bn: "৭ দিন", hi: "7 दिन", es: "7 días", sw: "Siku 7" },
  "30 days": { bn: "৩০ দিন", hi: "30 दिन", es: "30 días", sw: "Siku 30" },

  // Rotation Lab
  "Step 3": { bn: "ধাপ ৩", hi: "चरण 3", es: "Paso 3", sw: "Hatua ya 3" },
  "Crop rotation scenarios": {
    bn: "ফসল আবর্তন বিকল্পসমূহ",
    hi: "फसल चक्र परिदृश्य",
    es: "Escenarios de rotación de cultivos",
    sw: "Mikakati ya mzunguko wa mazao",
  },
  "Pick the scenario that best fits your field conditions.": {
    bn: "আপনার জমির অবস্থার সাথে সবচেয়ে উপযুক্ত বিকল্পটি বেছে নিন।",
    hi: "वह परिदृश्य चुनें जो आपके खेत की स्थिति के लिए सबसे उपयुक्त हो।",
    es: "Elija el escenario que mejor se adapte a las condiciones de su parcela.",
    sw: "Chagua mkakati unaofaa zaidi mazingira ya shamba lako.",
  },
  "Action:": {
    bn: "করণীয় পদক্ষেপ:",
    hi: "अनुशंसित कार्रवाई:",
    es: "Acción recomendada:",
    sw: "Hatua inayopendekezwa:",
  },
  "Why:": { bn: "কারণ:", hi: "कारण:", es: "Por qué:", sw: "Sababu:" },
  "NASA data:": {
    bn: "নাসা উপাত্ত:",
    hi: "नासा डेटा:",
    es: "Datos de la NASA:",
    sw: "Data ya NASA:",
  },
  "Sequence:": { bn: "ফসলের ক্রম:", hi: "फसल अनुक्रम:", es: "Secuencia:", sw: "Mfuatano:" },
  "Water fit": {
    bn: "পানি উপযোগিতা",
    hi: "पानी अनुकूलता",
    es: "Ajuste de agua",
    sw: "Ufaafu wa maji",
  },
  "Overall fit": {
    bn: "সার্বিক উপযোগিতা",
    hi: "समग्र अनुकूलता",
    es: "Ajuste general",
    sw: "Ufaafu wa jumla",
  },

  // Compare
  "Step 4": { bn: "ধাপ ৪", hi: "चरण 4", es: "Paso 4", sw: "Hatua ya 4" },
  "Compare scenarios": {
    bn: "বিকল্পগুলোর তুলনা",
    hi: "परिदृश्यों की तुलना",
    es: "Comparar escenarios",
    sw: "Linganisha mikakati",
  },
  Factor: { bn: "সূচক", hi: "कारक", es: "Factor", sw: "Kipengele" },

  // Simulator
  "Step 5": { bn: "ধাপ ৫", hi: "चरण 5", es: "Paso 5", sw: "Hatua ya 5" },
  "What-If simulator": {
    bn: "পরিস্থিতি পরীক্ষা সিমুলেটর",
    hi: "क्या-अगर सिम्युलेटर",
    es: "Simulador ¿Qué pasaría si?",
    sw: "Kielelezo cha Nini-Ikiwa",
  },
  "Scenario assumptions, not forecasts.": {
    bn: "ধারণামূলক পরীক্ষা, সরাসরি পূর্বাভাস নয়।",
    hi: "परिदृश्य धारणाएं, पूर्वानुमान नहीं।",
    es: "Supuestos de escenarios, no pronósticos.",
    sw: "Makadirio ya mfano, si utabiri wa moja kwa moja.",
  },
  "Climate & Water": {
    bn: "জলবায়ু ও পানি",
    hi: "जलवायु और पानी",
    es: "Clima y agua",
    sw: "Hali ya hewa na Maji",
  },
  "Rainfall change": {
    bn: "বৃষ্টিপাতের পরিবর্তন",
    hi: "वर्षा में परिवर्तन",
    es: "Cambio de lluvia",
    sw: "Mabadiliko ya mvua",
  },
  "Water availability": {
    bn: "পানির প্রাপ্যতা",
    hi: "पानी की उपलब्धता",
    es: "Disponibilidad de agua",
    sw: "Upatikanaji wa maji",
  },
  "Temperature change": {
    bn: "তাপমাত্রার পরিবর্তন",
    hi: "तापमान में परिवर्तन",
    es: "Cambio de temperatura",
    sw: "Mabadiliko ya joto",
  },
  "Season length": {
    bn: "মৌসুমের ব্যাপ্তি",
    hi: "मौसम की अवधि",
    es: "Duración de la temporada",
    sw: "Urefu wa msimu",
  },
  "Soil Nutrient Simulator": {
    bn: "মাটির পুষ্টি উপাদান সিমুলেটর",
    hi: "मृदा पोषक तत्व सिम्युलेटर",
    es: "Simulador de nutrientes del suelo",
    sw: "Kielelezo cha virutubisho vya udongo",
  },
  "Enter your soil health card values or adjust sliders to see which nutrient is limiting yield (Liebig's Law of the Minimum).":
    {
      bn: "আপনার মাটির স্বাস্থ্য কার্ডের মান দিন বা স্লাইডার নাড়িয়ে দেখুন কোন পুষ্টি ঘাটতি ফলন কমিয়ে দিচ্ছে (লিবিগের সূত্র)।",
      hi: "अपने मृदा स्वास्थ्य कार्ड के मान दर्ज करें या स्लाइडर्स समायोजित करके देखें कि कौन सा पोषक तत्व उपज को सीमित कर रहा है (लीबिग का नियम)।",
      es: "Ingrese los valores de su tarjeta de suelo o ajuste los controles para ver qué nutriente limita el rendimiento (Ley del Mínimo de Liebig).",
      sw: "Weka data ya afya ya udongo au sogeza vitelezi ili uone kirutubisho kipi kinachopunguza mazao (Sheria ya Liebig).",
    },
  "Soil is well-balanced": {
    bn: "মাটির পুষ্টি উপাদান সুষম রয়েছে",
    hi: "मिट्टी अच्छी तरह से संतुलित है",
    es: "El suelo está bien equilibrado",
    sw: "Udongo una uwiano mzuri",
  },
  "Est. yield impact:": {
    bn: "আনুমানিক ফলন প্রভাব:",
    hi: "अनुमानित उपज प्रभाव:",
    es: "Impacto estimado en rendimiento:",
    sw: "Makadirio ya athari ya mavuno:",
  },

  // Forecast
  "7-Day Weather Forecast": {
    bn: "৭ দিনের আবহাওয়া পূর্বাভাস",
    hi: "7-दिन का मौसम पूर्वानुमान",
    es: "Pronóstico del tiempo de 7 días",
    sw: "Utabiri wa Hali ya Hewa wa Siku 7",
  },
  "Live Open-Meteo Forecast": {
    bn: "সরাসরি ওপেন-মেটিও পূর্বাভাস",
    hi: "लाइव ओपन-मेटियो पूर्वानुमान",
    es: "Pronóstico Open-Meteo en vivo",
    sw: "Utabiri wa Open-Meteo wa moja kwa moja",
  },
  "7-day total rain:": {
    bn: "৭ দিনে মোট বৃষ্টি:",
    hi: "7 दिनों की कुल वर्षा:",
    es: "Lluvia total de 7 días:",
    sw: "Mvua ya jumla siku 7:",
  },
  "ET₀:": {
    bn: "বাষ্পীভবন (ET₀):",
    hi: "वाष्पोत्सर्जन (ET₀):",
    es: "Evapotranspiración (ET₀):",
    sw: "Mvukisho (ET₀):",
  },
  "Irrigation need:": {
    bn: "সেচের চাহিদা:",
    hi: "सिंचाई की आवश्यकता:",
    es: "Demanda de riego:",
    sw: "Mahitaji ya umwagiliaji:",
  },
  "Forecast alerts": {
    bn: "পূর্বাভাস সতর্কতা",
    hi: "पूर्वानुमान चेतावनी",
    es: "Alertas de pronóstico",
    sw: "Tahadhari za utabiri",
  },
  "Daily irrigation demand (ET₀ − rain, mm)": {
    bn: "দৈনিক সেচের চাহিদা (বাষ্পীভবন − বৃষ্টি, মিমি)",
    hi: "दैनिक सिंचाई मांग (वाष्पोत्सर्जन − वर्षा, मिमी)",
    es: "Demanda diaria de riego (ET₀ − lluvia, mm)",
    sw: "Mahitaji ya kila siku ya umwagiliaji (ET₀ − mvua, mm)",
  },

  // Crop library
  "Crop library & Seasonal Calendar": {
    bn: "ফসল তথ্যভান্ডার ও মৌসুমী বর্ষপঞ্জি",
    hi: "फसल पुस्तकालय और मौसमी कैलेंडर",
    es: "Biblioteca de cultivos y calendario estacional",
    sw: "Maktaba ya mazao na kalenda ya msimu",
  },
  "In Window": { bn: "উপযুক্ত সময়", hi: "सही समय", es: "En temporada", sw: "Wakati unaofaa" },
  "Water requirement:": {
    bn: "পানির চাহিদা:",
    hi: "पानी की आवश्यकता:",
    es: "Requisito de agua:",
    sw: "Mahitaji ya maji:",
  },
  "Optimal temperature:": {
    bn: "উপযুক্ত তাপমাত্রা:",
    hi: "अनुकूलतम तापमान:",
    es: "Temperatura óptima:",
    sw: "Joto linalofaa:",
  },
  "Recommended soil:": {
    bn: "উপযুক্ত মাটি:",
    hi: "अनुशंसित मिट्टी:",
    es: "Suelo recomendado:",
    sw: "Udongo unaopendekezwa:",
  },
  "Follows well:": {
    bn: "পরবর্তী উপযোগী ফসল:",
    hi: "इसके बाद की फसल:",
    es: "Sigue bien con:",
    sw: "Inafaa kufuatiwa na:",
  },

  // History & How it works
  "Previous crops and notes": {
    bn: "পূর্ববর্তী ফসল ও তথ্য",
    hi: "पिछली फसलें और टिप्पणियां",
    es: "Cultivos anteriores y notas",
    sw: "Mazao yaliyopita na maelezo",
  },
  "Saved plans": {
    bn: "সংরক্ষিত পরিকল্পনা",
    hi: "सहेजी गई योजनाएं",
    es: "Planes guardados",
    sw: "Mipango iliyohifadhiwa",
  },
  "No saved plans yet. Use the Save action in Rotation Lab or Current Plan.": {
    bn: "এখনও কোনো পরিকল্পনা সংরক্ষিত নেই। ফসল আবর্তন ল্যাব থেকে পরিকল্পনা সংরক্ষণ করুন।",
    hi: "अभी तक कोई योजना सहेजी नहीं गई है। फसल चक्र लैब से योजना सहेजें।",
    es: "Aún no hay planes guardados. Use la opción Guardar en el Laboratorio de rotación.",
    sw: "Bado hakuna mipango iliyohifadhiwa. Tumia kitufe cha Hifadhi kwenye Maabara ya Mzunguko.",
  },
  "How AgroNova Works": {
    bn: "এগ্রোনোভা যেভাবে কাজ করে",
    hi: "एग्रोनोवा कैसे काम करता है",
    es: "Cómo funciona AgroNova",
    sw: "Jinsi AgroNova Inavyofanya Kazi",
  },
  "NASA Earth Observations": {
    bn: "নাসা ভূ-পর্যবেক্ষণ",
    hi: "नासा पृथ्वी अवलोकन",
    es: "Observaciones terrestres de la NASA",
    sw: "Uchunguzi wa Dunia wa NASA",
  },
  "Deterministic Decision Engine": {
    bn: "বৈজ্ঞানিক সিদ্ধান্ত ইঞ্জিন",
    hi: "वैज्ञानिक निर्णय इंजन",
    es: "Motor de decisión determinista",
    sw: "Injini ya maamuzi ya kisayansi",
  },

  // Profile
  "Profile and Settings": {
    bn: "প্রোফাইল ও সেটিংস",
    hi: "प्रोफाइल और सेटिंग्स",
    es: "Perfil y configuración",
    sw: "Wasifu na Mipangilio",
  },
  "App Language": {
    bn: "অ্যাপের ভাষা",
    hi: "ऐप की भाषा",
    es: "Idioma de la aplicación",
    sw: "Lugha ya programu",
  },
  "Changes the entire website language instantly.": {
    bn: "মুহূর্তের মধ্যেই পুরো ওয়েবসাইটের ভাষা পরিবর্তন করে।",
    hi: "तुरंत पूरी वेबसाइट की भाषा बदल देता है।",
    es: "Cambia instantáneamente el idioma de todo el sitio web.",
    sw: "Hubadilisha lugha yote ya tovuti mara moja.",
  },
  District: { bn: "জেলা", hi: "ज़िला", es: "Distrito", sw: "Wilaya" },
  Phone: { bn: "ফোন নম্বর", hi: "फ़ोन", es: "Teléfono", sw: "Simu" },
  "Farming since": {
    bn: "কৃষি অভিজ্ঞতা (সাল থেকে)",
    hi: "खेती कब से",
    es: "Agricultura desde",
    sw: "Kilimo tangu",
  },
  "Total land": { bn: "মোট জমি", hi: "कुल भूमि", es: "Tierra total", sw: "Jumla ya ardhi" },
  "Main crops": {
    bn: "প্রধান ফসল",
    hi: "मुख्य फसलें",
    es: "Cultivos principales",
    sw: "Mazao makuu",
  },
  Language: { bn: "ভাষা", hi: "भाषा", es: "Idioma", sw: "Lugha" },
  Name: { bn: "নাম", hi: "नाम", es: "Nombre", sw: "Jina" },
  "Save profile": {
    bn: "প্রোফাইল সংরক্ষণ করুন",
    hi: "प्रोफाइल सहेजें",
    es: "Guardar perfil",
    sw: "Hifadhi wasifu",
  },
};

// Store original English texts mapped to DOM nodes
const nodeOriginalTextMap = new WeakMap<Text, string>();

/**
 * Recursively translates text nodes in the DOM into the selected language
 */
export function translateDomTree(rootNode: Node, targetLang: Language) {
  if (typeof window === "undefined" || !rootNode) return;

  const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT, {
    acceptNode(node: Text) {
      // Skip script, style, and code blocks
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName.toLowerCase();
      if (tag === "script" || tag === "style" || tag === "noscript" || tag === "pre") {
        return NodeFilter.FILTER_REJECT;
      }
      if (
        parent.closest(".notranslate") ||
        parent.closest("[translate='no']") ||
        parent.getAttribute("translate") === "no"
      ) {
        return NodeFilter.FILTER_REJECT;
      }
      if (!node.textContent || node.textContent.trim().length === 0) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let currentNode = walker.nextNode() as Text | null;
  while (currentNode) {
    let original = nodeOriginalTextMap.get(currentNode);
    if (!original) {
      original = currentNode.textContent || "";
      nodeOriginalTextMap.set(currentNode, original);
    }

    if (targetLang === "en") {
      if (currentNode.textContent !== original) {
        currentNode.textContent = original;
      }
    } else {
      const trimmed = original.trim();
      let translated = "";

      // 1. Direct dictionary match
      if (translationDictionary[trimmed] && translationDictionary[trimmed][targetLang]) {
        const replacement = translationDictionary[trimmed][targetLang];
        // Preserve leading/trailing whitespace
        const leading = original.match(/^\s*/)?.[0] || "";
        const trailing = original.match(/\s*$/)?.[0] || "";
        translated = leading + replacement + trailing;
      } else {
        // 2. Partial substring replacement for common compound words
        let modified = original;
        for (const [key, mapping] of Object.entries(translationDictionary)) {
          if (key.length > 3 && modified.includes(key) && mapping[targetLang]) {
            modified = modified.replaceAll(key, mapping[targetLang]);
          }
        }
        if (modified !== original) {
          translated = modified;
        }
      }

      if (translated && currentNode.textContent !== translated) {
        currentNode.textContent = translated;
      }
    }

    currentNode = walker.nextNode() as Text | null;
  }
}

/**
 * Clears legacy googtrans cookies that trigger Google's "Translated to: English" banner
 */
export function clearGoogleTranslateCookies() {
  if (typeof window === "undefined") return;
  try {
    const host = window.location.hostname;
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${host}; path=/;`;
    if (host.includes(".")) {
      const rootDomain = "." + host.split(".").slice(-2).join(".");
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${rootDomain}; path=/;`;
    }
  } catch {
    // Ignore cookie clearing errors
  }
}

// Automatically clear legacy cookies on client load
if (typeof window !== "undefined") {
  clearGoogleTranslateCookies();
}

/**
 * Triggers full page translation using AgroNova's native DOM translation engine
 */
export function applyFullPageTranslation(targetLang: Language) {
  if (typeof window === "undefined") return;

  // 1. Save in localStorage
  try {
    localStorage.setItem("agronova_language", targetLang);
  } catch {
    // Ignore storage errors
  }

  // 2. Ensure Google Translate cookies are eliminated to prevent popups
  clearGoogleTranslateCookies();

  // 3. Update HTML lang tag
  document.documentElement.lang = targetLang;

  // 4. Run immediate native AgroNova DOM text translation
  translateDomTree(document.body, targetLang);
}
