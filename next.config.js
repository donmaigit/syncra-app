const createNextIntlPlugin = require('next-intl/plugin');

// Points to the request config in the i18n folder
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  }
};

module.exports = withNextIntl(nextConfig);