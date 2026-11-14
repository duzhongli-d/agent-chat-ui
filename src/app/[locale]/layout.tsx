import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Inter, Noto_Sans_SC } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import React from "react";
import { routing } from "@/i18n/routing";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  preload: true,
  display: "swap",
  // `variable` emits a CSS custom property rather than a `font-family` class,
  // so Inter and Noto Sans SC can be chained into one stack — `next/font`'s
  // `className` sets `font-family` outright and cannot hold two fonts.
  variable: "--font-inter",
  // `adjustFontFallback: false` suppresses the generated `local("Arial")`
  // metrics face. Only the webpack builder honours it — Turbopack (Next 16's
  // default) always emits that face, so it stays in the stack under
  // `--font-inter`. It is harmless there: Arial covers the same Latin range
  // as Inter and has no CJK glyphs, so it can never shadow Noto Sans SC for
  // Chinese text. It only ever wins for Latin glyphs Inter lacks, which
  // Arial supplies just as well.
  adjustFontFallback: false,
});

const notoSansSC = Noto_Sans_SC({
  // Noto Sans SC has no `chinese-simplified` subset — its declared subsets are
  // `cyrillic | latin | latin-ext | vietnamese`. `subsets` only controls which
  // files are PRELOADED; the full CSS (with all unicode-range blocks) is still
  // emitted, so CJK glyphs resolve to Noto Sans SC and are fetched on demand.
  subsets: ["latin"],
  weight: "variable",
  style: "normal",
  display: "swap",
  preload: false,
  variable: "--font-noto-sans-sc",
  adjustFontFallback: false,
});

/**
 * This is the app's root layout — Next.js allows exactly one `<html>` element,
 * and there is deliberately no `src/app/layout.tsx` alongside it.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return {};
  }
  const t = await getTranslations({ locale, namespace: "app" });
  return { title: t("title"), description: t("description") };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${notoSansSC.variable}`}
    >
      <body className="font-sans">
        <NextIntlClientProvider>
          <NuqsAdapter>{children}</NuqsAdapter>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
