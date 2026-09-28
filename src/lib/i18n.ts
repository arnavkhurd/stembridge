import { offlineUiMarathi } from "./offline-marathi";
import { mainMarathi } from "./i18n-main";
import { dialogsMarathi } from "./i18n-dialogs";
import { contentMarathi } from "./i18n-content";

export type Language = "en" | "mr";
export const LANGUAGE_KEY = "stembridge.language.v1";
export const LEGACY_LANGUAGE_KEY = "stembridge.learning-language.v1";

const commonMarathi: Record<string, string> = {
  "Website language": "वेबसाइटची भाषा",
  "You're offline. Reconnect to save account changes or contact people. Nothing has been sent or queued.":
    "तुम्ही ऑफलाइन आहात. खात्यात बदल सेव्ह करण्यासाठी किंवा लोकांशी संपर्क करण्यासाठी इंटरनेट जोडा. काहीही पाठवलेले किंवा नंतर पाठवण्यासाठी ठेवलेले नाही.",
  mentor: "मार्गदर्शक",
  peer: "सहकारी",
  project: "प्रकल्प",
  resource: "अभ्याससाहित्य",
  competition: "स्पर्धा",
  internship: "इंटर्नशिप",
  "Close dialog": "ही विंडो बंद करा",
  "Clear search": "शोध साफ करा",
  "English and Marathi work across the main website and these exercises. Your language choice is saved on this device.":
    "मुख्य वेबसाइट आणि हे सराव इंग्रजी व मराठीत वापरता येतात. तुमची भाषेची निवड या उपकरणावर सेव्ह होते.",
  "Something went wrong. Please try again.":
    "काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.",
  "Your session changed. Please try again.":
    "लॉग इनची स्थिती बदलली आहे. कृपया पुन्हा प्रयत्न करा.",
  "This opportunity is no longer available.": "ही संधी आता उपलब्ध नाही.",
  "Sign in to use your live workspace.":
    "तुमचा डॅशबोर्ड वापरण्यासाठी लॉग इन करा.",
  "Sign in to join a community and meet its members.":
    "समुदायात सामील होण्यासाठी आणि सदस्यांना भेटण्यासाठी लॉग इन करा.",
  "Sign in to send a real connection request.":
    "सदस्यांना संपर्काची विनंती पाठवण्यासाठी लॉग इन करा.",
  "Invalid login credentials": "ईमेल किंवा पासवर्ड चुकीचा आहे.",
  "Email not confirmed": "ईमेलची पुष्टी झालेली नाही.",
  "User already registered": "या ईमेलचे खाते आधीच आहे.",
  "Failed to fetch":
    "सर्व्हरशी संपर्क झाला नाही. इंटरनेट तपासा आणि पुन्हा प्रयत्न करा.",
  "Reconnect to sign in. You can keep using the preview offline.":
    "लॉग इन करण्यासाठी इंटरनेटशी पुन्हा कनेक्ट व्हा. तोपर्यंत डेमो ऑफलाइन वापरू शकता.",
  "Reconnect to create an account. You can keep using the preview offline.":
    "खाते तयार करण्यासाठी इंटरनेटशी पुन्हा कनेक्ट व्हा. तोपर्यंत डेमो ऑफलाइन वापरू शकता.",
  "You're viewing a saved copy. Refresh your workspace after reconnecting before making account changes. Nothing has been sent or queued.":
    "तुम्ही सेव्ह केलेली प्रत पाहत आहात. इंटरनेट जोडल्यानंतर खाते अपडेट करा आणि मग बदल करा. काहीही पाठवलेले किंवा नंतर पाठवण्यासाठी ठेवलेले नाही.",
  "Check your profile fields and select skills and opportunities from the available options.":
    "प्रोफाइलमधील माहिती तपासा आणि उपलब्ध पर्यायांतून कौशल्ये व संधी निवडा.",
  "Your browser blocked saving this preview. Enable browser storage and try again.":
    "ब्राउझरमध्ये डेमो सेव्ह करता आला नाही. ब्राउझरमध्ये माहिती साठवण्याची सुविधा सुरू करून पुन्हा प्रयत्न करा.",
};

export const marathi: Record<string, string> = {
  ...offlineUiMarathi,
  ...contentMarathi,
  ...dialogsMarathi,
  ...mainMarathi,
  ...commonMarathi,
};

// Only authored display strings are passed here. Stored IDs and user writing
// remain unchanged, and unknown provider messages keep their original wording.
export function translate(
  language: Language,
  text: string,
  values: Record<string, string | number> = {},
): string {
  const template = language === "mr" ? (marathi[text] ?? text) : text;
  return template.replace(/\{(\w+)\}/g, (token, key: string) =>
    Object.prototype.hasOwnProperty.call(values, key)
      ? String(values[key])
      : token,
  );
}
