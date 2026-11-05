import type { NextConfig } from "next";
// @ts-ignore
import withPWA from "next-pwa";

// Loader path from orchids-visual-edits - use direct resolve to get the actual file
const loaderPath = require.resolve('orchids-visual-edits/loader.js');

// EXPORT_STATIQUE=1 publie l'application en fichiers statiques (dossier out/).
// Le prototype n'a aucun code serveur (données intégrées) : en site statique
// sur Render, il ne s'endort jamais et ne consomme aucune des 750 h gratuites
// de l'espace. Sans la variable, le build reste celui du service Node.
const exportStatique = process.env.EXPORT_STATIQUE === '1';

const nextConfig: NextConfig = {
  ...(exportStatique ? { output: 'export' as const, trailingSlash: true } : {}),
  images: {
    unoptimized: exportStatique,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  turbopack: {
    rules: {
      "*.{jsx,tsx}": {
        loaders: [loaderPath]
      }
    }
  }
} as NextConfig;

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  fallbacks: {
    document: "/offline",
  },
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "lear-track-cache",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60, // 24h
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],
});

export default pwaConfig(nextConfig);
