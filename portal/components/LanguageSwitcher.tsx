"use client";

import { useTranslation } from "./TranslationProvider";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  return (
    <button
      onClick={() => setLocale(locale === "en" ? "zh" : "en")}
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
      aria-label="Switch language"
    >
      <Globe className="h-4 w-4" />
      {locale === "en" ? "中文" : "EN"}
    </button>
  );
}
