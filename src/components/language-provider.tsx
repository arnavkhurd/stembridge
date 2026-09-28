"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  LANGUAGE_KEY,
  LEGACY_LANGUAGE_KEY,
  translate,
  type Language,
} from "@/lib/i18n";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (text: string, values?: Record<string, string | number>) => string;
};
const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => {},
  t: (text, values) => translate("en", text, values),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, updateLanguage] = useState<Language>("en");
  useEffect(() => {
    const restore = () => {
      try {
        const saved =
          localStorage.getItem(LANGUAGE_KEY) ??
          localStorage.getItem(LEGACY_LANGUAGE_KEY);
        updateLanguage(saved === "mr" ? "mr" : "en");
      } catch {
        /* Language switching still works without preference storage. */
      }
    };
    restore();
    const onStorage = (event: StorageEvent) => {
      if (
        event.key === LANGUAGE_KEY ||
        event.key === LEGACY_LANGUAGE_KEY ||
        event.key === null
      )
        restore();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    if (next !== "en" && next !== "mr") return;
    updateLanguage(next);
    try {
      localStorage.setItem(LANGUAGE_KEY, next);
      localStorage.setItem(LEGACY_LANGUAGE_KEY, next);
    } catch {
      /* Do not lose the in-memory choice or touch any user content. */
    }
  }, []);
  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (text: string, values?: Record<string, string | number>) =>
        translate(language, text, values),
    }),
    [language, setLanguage],
  );
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
