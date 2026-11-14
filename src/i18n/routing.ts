import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "zh-CN"],
  defaultLocale: "en",
  // Always prefix the URL with the locale, including for the default locale.
  localePrefix: "always",
  // Do NOT detect the locale from the cookie or the `accept-language` header.
  // The app stays English until the user explicitly toggles it.
  localeDetection: false,
  // The URL is the single source of truth for the locale; do not write a
  // `NEXT_LOCALE` cookie on locale switches.
  localeCookie: false,
});
