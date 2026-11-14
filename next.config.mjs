import createNextIntlPlugin from "next-intl/plugin";

/**
 * The path must be RELATIVE — next-intl's Turbopack integration rejects absolute
 * paths. The plugin also auto-probes `./i18n/request.*` and `./src/i18n/request.*`,
 * so this is belt-and-braces.
 */
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default withNextIntl(nextConfig);
