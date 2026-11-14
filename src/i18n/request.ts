import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import * as rootParams from "next/root-params";
import { routing } from "./routing";
import type { en, Messages } from "@/messages/en";

/**
 * An explicit map instead of a template-literal dynamic import: a dynamic import
 * with a variable specifier cannot be statically analysed, so the bundler cannot
 * tree-shake the unused locale out of the build.
 */
const messageLoaders: Record<string, () => Promise<Messages>> = {
  // Relative specifiers on purpose — the plugin loads this file through its own
  // bundler pass, and a relative path avoids any alias-resolution edge case.
  en: async () => (await import("../messages/en")).en,
  "zh-CN": async () => (await import("../messages/zh-CN")).zhCN,
};

export default getRequestConfig(async ({ locale }) => {
  if (!locale) {
    // `getRequestConfig` is also called outside a `[locale]` route (e.g. for the
    // not-found page), so fall back to the root params.
    const paramValue = await rootParams.locale();
    if (hasLocale(routing.locales, paramValue)) {
      locale = paramValue;
    } else {
      notFound();
    }
  }

  const loader = messageLoaders[locale];
  if (!loader) {
    notFound();
  }

  return {
    locale,
    /**
     * The declared message type is `typeof en` — the *English* catalog's literal
     * shape — because that is what carries the ICU contract (placeholder names,
     * placeholder value types, rich-text tag names) that `t()` type-checks
     * against. Every locale implements that same shape; `zh-CN.ts` proves it
     * with `satisfies Messages` plus the ICU-parity assertion.
     *
     * The cast is the single boundary where "the English template" turns into
     * "this locale's rendering of it".
     */
    messages: (await loader()) as typeof en,
  };
});
