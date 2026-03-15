/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server-side only — no external API calls needed
  output: 'standalone',
  
  // Strict mode for catching bugs early
  reactStrictMode: true,

  // Optimize server-side packages
  serverExternalPackages: ['better-sqlite3'],
};

module.exports = nextConfig;
