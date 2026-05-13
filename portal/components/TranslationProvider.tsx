"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { en, zh } from "@/lib/translations";
import type { TranslationKeys } from "@/lib/translations";

type Locale = "en" | "zh";
const STORAGE_KEY = "locale";

const translations: Record<Locale, Record<TranslationKeys, string>> = { en, zh };

interface TranslationContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKeys, params?: Record<string, string | number>) => string;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved === "en" || saved === "zh") {
      setLocaleState(saved);
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.lang = l;
  }, []);

  const t = useCallback(
    (key: TranslationKeys, params?: Record<string, string | number>) => {
      let val = translations[locale][key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          val = val.replace(`{${k}}`, String(v));
        }
      }
      return val;
    },
    [locale]
  );

  if (!mounted) {
    // Return a no-op t for SSR to avoid hydration mismatch
    const fallbackT = (key: TranslationKeys, _params?: Record<string, string | number>) => translations.en[key] ?? key;
    return (
      <TranslationContext.Provider value={{ locale: "en", setLocale, t: fallbackT }}>
        {children}
      </TranslationContext.Provider>
    );
  }

  return (
    <TranslationContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx) throw new Error("useTranslation must be used within TranslationProvider");
  return ctx;
}
