const ONES = ["", "एक", "दुई", "तीन", "चार", "पाँच", "छ", "सात", "आठ", "नौ"];

const NUM_WORDS_0_99 = [
  "शून्य",
  "एक",
  "दुई",
  "तीन",
  "चार",
  "पाँच",
  "छ",
  "सात",
  "आठ",
  "नौ",
  "दस",
  "एघार",
  "बाह्र",
  "तेह्र",
  "चौध",
  "पन्ध्र",
  "सोह्र",
  "सत्र",
  "अठार",
  "उन्नाइस",
  "बीस",
  "एक्काइस",
  "बाइस",
  "तेइस",
  "चौबिस",
  "पच्चीस",
  "छब्बिस",
  "सत्ताइस",
  "अठ्ठाइस",
  "उनन्तीस",
  "तीस",
  "एकतीस",
  "बत्तीस",
  "तेत्तीस",
  "चौंतीस",
  "पैंतीस",
  "छत्तीस",
  "सैंतीस",
  "अठ्तीस",
  "उनन्चालीस",
  "चालीस",
  "एकचालीस",
  "बयालीस",
  "त्रिचालीस",
  "चवालीस",
  "पैंतालीस",
  "छयालीस",
  "सतचालीस",
  "अठचालीस",
  "उनन्चास",
  "पचास",
  "एकाउन्न",
  "बाउन्न",
  "त्रिपन्न",
  "चवन्न",
  "पचपन्न",
  "छपन्न",
  "सन्ताउन्न",
  "अन्ठाउन्न",
  "उनन्साठी",
  "साठी",
  "एकसाठी",
  "बयसाठी",
  "त्रिसाठी",
  "चौंसठी",
  "पैंसठी",
  "छयसाठी",
  "सतसाठी",
  "अठसाठी",
  "उनन्सत्तरी",
  "सत्तरी",
  "एकहत्तर",
  "बहत्तर",
  "त्रिहत्तर",
  "चौहत्तर",
  "पचहत्तर",
  "छहत्तर",
  "सतहत्तर",
  "अठहत्तर",
  "उनासी",
  "असी",
  "एकासी",
  "बयासी",
  "त्रियासी",
  "चौरासी",
  "पचासी",
  "छयासी",
  "सतासी",
  "अठासी",
  "उनान्नब्बे",
  "नब्बे",
  "एकान्नब्बे",
  "बयान्नब्बे",
  "त्रियान्नब्बे",
  "चौरान्नब्बे",
  "पंचान्नब्बे",
  "छयान्नब्बे",
  "सन्तान्नब्बे",
  "अन्ठान्नब्बे",
  "उनान्सय",
];

function convertTwoDigits(num: number): string {
  return NUM_WORDS_0_99[num];
}

function convertThreeDigits(num: number): string {
  if (num === 0) {
    return "";
  }

  const parts: string[] = [];
  const hundreds = Math.floor(num / 100);
  const remainder = num % 100;

  if (hundreds > 0) {
    parts.push(ONES[hundreds] + " सय");
  }
  if (remainder > 0) {
    parts.push(convertTwoDigits(remainder));
  }

  return parts.join(" ");
}

function numberToWords(amountInt: number): string {
  if (amountInt === 0) {
    return "शून्य";
  }

  const parts: string[] = [];

  const crore = Math.floor(amountInt / 10000000);
  let remainder = amountInt % 10000000;

  const lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;

  const thousand = Math.floor(remainder / 1000);
  const hundredPart = remainder % 1000;

  if (crore > 0) {
    parts.push(convertThreeDigits(crore) + " करोड");
  }
  if (lakh > 0) {
    parts.push(convertThreeDigits(lakh) + " लाख");
  }
  if (thousand > 0) {
    parts.push(convertThreeDigits(thousand) + " हजार");
  }
  if (hundredPart > 0) {
    parts.push(convertThreeDigits(hundredPart));
  }

  return parts.join(" ");
}

export function amountToNepaliWords(
  amount: number | string,
  includePaisa: boolean = true
): string {
  const amountNum = typeof amount === "string" ? parseFloat(amount) : amount;
  const rounded = Math.round(amountNum * 100) / 100;

  const rupees = Math.floor(rounded);
  let paisa = Math.round((rounded - rupees) * 100);

  // Handle rounding edge case: 99.999 -> paisa == 100
  if (paisa === 100) {
    rupees + 1;
    paisa = 0;
  }

  const rupeeWords = numberToWords(rupees);

  if (includePaisa && paisa > 0) {
    const paisaWords = convertTwoDigits(paisa);
    return `रुपैयाँ ${rupeeWords} रुपैयाँ ${paisaWords} पैसा मात्र`;
  }

  return `${rupeeWords} मात्र`;
}
