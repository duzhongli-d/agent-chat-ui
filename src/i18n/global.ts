import type { en } from "@/messages/en";
import { routing } from "./routing";

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    /**
     * The *narrow* (literal) catalog type, not the widened `Messages`.
     *
     * Keeping the literal string types is what lets next-intl's type machinery
     * parse each message as an ICU template and enforce:
     * - placeholder names (`t("chat", { url: "..." })` — a typo is a type error),
     * - placeholder value types (`{count, number}` demands a number),
     * - rich-text tag names (`t.rich("setup.apiKeyHelp", { not: ... })`).
     *
     * Widening the values to `string` would silently disable all three checks.
     */
    Messages: typeof en;
  }
}
