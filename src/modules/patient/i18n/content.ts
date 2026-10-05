/**
 * Translated catalogue copy and calendar words for the Patient App.
 * English comes straight from the mock data, so only Hindi lives here.
 * Test and package NAMES are never translated — only their descriptions.
 */
export interface LocalContent {
  /** Test description by test id. */
  tests: Record<string, string>
  /** Package tagline and "ideal for" line by package id. */
  taglines: Record<string, string>
  idealFor: Record<string, string>
  /** Jan … Dec and Sun … Sat, in the short form used across the app. */
  months: string[]
  days: string[]
  /** Replacement for "hrs" in durations such as "12 hrs". */
  hrs: string
  sample: Record<string, string>
}

const hi: LocalContent = {
  tests: {
    't-cbc': 'एनीमिया, संक्रमण और रक्त की सामान्य सेहत की जाँच।',
    't-hba1c': 'पिछले तीन महीनों का औसत ब्लड शुगर नियंत्रण।',
    't-fbs': 'रात भर खाली पेट रहने के बाद ब्लड ग्लूकोज़ का स्तर।',
    't-ppbs': 'भोजन के दो घंटे बाद ब्लड ग्लूकोज़ का स्तर।',
    't-lipid': 'हृदय जोखिम के आकलन के लिए कोलेस्ट्रॉल और ट्राइग्लिसराइड का स्तर।',
    't-hscrp': 'हृदय जोखिम से जुड़ी हल्की सूजन का संकेतक।',
    't-thyroid': 'थायरॉइड ग्रंथि के कामकाज का आकलन।',
    't-tsh': 'थायरॉइड स्क्रीनिंग और इलाज की निगरानी के लिए संकेतक।',
    't-lft': 'लिवर की सेहत दिखाने वाले एंज़ाइम और प्रोटीन।',
    't-kft': 'किडनी की सेहत के लिए यूरिया, क्रिएटिनिन और इलेक्ट्रोलाइट।',
    't-urine': 'पेशाब की भौतिक, रासायनिक और सूक्ष्मदर्शी जाँच।',
    't-vitd': 'हड्डियों की सेहत पर असर डालने वाली विटामिन D की कमी की जाँच।',
    't-b12': 'थकान और नसों के लक्षणों से जुड़ी B12 की कमी का पता लगाता है।',
    't-iron': 'आयरन के भंडार के आकलन के लिए सीरम आयरन, TIBC और फ़ेरिटिन।',
    't-esr': 'सूजन का सामान्य संकेतक।',
    't-crp': 'संक्रमण और तीव्र सूजन का पता लगाता है।',
    't-dengue': 'डेंगू संक्रमण की शुरुआती पहचान।',
    't-malaria': 'मलेरिया परजीवी के लिए सूक्ष्मदर्शी जाँच।',
  },
  taglines: {
    'p-full': 'पूरी सालाना सेहत जाँच',
    'p-essential': 'ज़रूरी जाँचें, सही तरीके से',
    'p-advanced': 'विटामिन और आयरन के साथ पूरे शरीर की जाँच',
    'p-diabetes': 'शुगर नियंत्रण और किडनी की सेहत पर नज़र',
    'p-heart': 'अपने हृदय जोखिम के संकेतक जानें',
    'p-women': 'थायरॉइड, आयरन और विटामिन की ज़रूरी जाँचें',
  },
  idealFor: {
    'p-full': 'वयस्क, साल में एक बार',
    'p-essential': '18–35 वर्ष के वयस्क',
    'p-advanced': '35 वर्ष से ऊपर',
    'p-diabetes': 'मधुमेह वाले लोग',
    'p-heart': '30 वर्ष से ऊपर या पारिवारिक इतिहास',
    'p-women': '25 वर्ष से ऊपर की महिलाएँ',
  },
  months: ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्टू', 'नव', 'दिस'],
  days: ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
  hrs: 'घंटे',
  sample: { Blood: 'रक्त', Urine: 'पेशाब' },
}

export const localContent: Partial<Record<string, LocalContent>> = { hi }
