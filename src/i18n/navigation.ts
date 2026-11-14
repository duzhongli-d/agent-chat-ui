import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * NOTE: `Link` is intentionally not exported.
 *
 * The app has a single route (`/[locale]`), so nothing needs a localized link.
 * Exporting `Link` would (a) pull a client component into server-component trees
 * and (b) trip `react-refresh/only-export-components`, which fires on files that
 * export both a component and a non-component.
 */
export const { getPathname, redirect, usePathname, useRouter } =
  createNavigation(routing);
