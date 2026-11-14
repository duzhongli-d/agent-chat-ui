"use client";

import { useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "@/i18n/navigation";

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("language");
  const router = useRouter();

  const nextLocale = locale === "en" ? "zh-CN" : "en";

  const handleToggle = useCallback(() => {
    // The app's entire configuration lives in the query string
    // (apiUrl / assistantId / authScheme / threadId), so it must be re-supplied:
    // next-intl's `usePathname()` returns the pathname WITHOUT the query.
    const query: Record<string, string | string[]> = {};
    new URLSearchParams(window.location.search).forEach((value, key) => {
      query[key] = value;
    });

    // `replace(href, { locale })` — locale is the SECOND argument. `href` may be
    // `{ pathname, query }`; next-intl serializes the query onto the prefixed path.
    router.replace({ pathname: "/", query }, { locale: nextLocale });
  }, [nextLocale, router]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className={`h-7 min-w-12 px-2 text-sm font-medium ${className ?? ""}`}
          aria-label={t("label")}
        >
          {/* The glyph shows the TARGET script, not the current one: the
              English UI offers "文" and the Chinese UI offers "A". The label
              announces the action, the way Wikipedia and VS Code do it. */}
          <AnimatePresence
            mode="wait"
            initial={false}
          >
            <motion.span
              key={nextLocale}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="inline-block"
            >
              {nextLocale === "zh-CN" ? "文" : "A"}
            </motion.span>
          </AnimatePresence>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t("tooltip")}</TooltipContent>
    </Tooltip>
  );
}
