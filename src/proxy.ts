import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip Next.js internals, the API passthrough route, and any path with a file
  // extension (static assets, icons, etc.).
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
