import { i18n } from "@lingui/core";
import { en, es, zh, ko, ru, ja, fr, de, vi } from "make-plural/plurals";
import { LANGUAGE_LOCALSTORAGE_KEY } from "config/localStorage";
import { isDevelopment } from "./legacy";

// uses BCP-47 codes from https://unicode-org.github.io/cldr-staging/charts/latest/supplemental/language_plural_rules.html
export const locales = {
  en: "English",
  vi: "Tiếng Việt",
  es: "Spanish",
  zh: "Chinese",
  ko: "Korean",
  ja: "Japanese",
};

export const defaultLocale = "en";

i18n.loadLocaleData({
  en: { plurals: en },
  vi: { plurals: vi },
  es: { plurals: es },
  zh: { plurals: zh },
  ko: { plurals: ko },
  ru: { plurals: ru },
  ja: { plurals: ja },
  fr: { plurals: fr },
  de: { plurals: de },
  ...(isDevelopment() && { pseudo: { plurals: en } }),
});

export function isTestLanguage(locale) {
  return locale === "pseudo";
}

export async function dynamicActivate(locale) {
  const { messages } = await import(`@lingui/loader!locales/${locale}/messages.po`);
  console.log("\u001B[36m -> file: i18n.js:37 -> messages", locale, `locales/${locale}/messages.po`, messages);
  if (!isTestLanguage(locale)) {
    localStorage.setItem(LANGUAGE_LOCALSTORAGE_KEY, locale);
  }
  i18n.load(locale, messages);
  i18n.activate(locale);
}
