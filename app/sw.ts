import { Serwist } from "serwist";
import type { PrecacheEntry } from "@serwist/precaching";

// Declare the service worker self with Serwist manifest
declare global {
  interface WorkerGlobalScope {
    __SW_MANIFEST: (PrecacheEntry | string)[];
  }
}

declare const self: ServiceWorkerGlobalScope & WorkerGlobalScope;

// Create Serwist instance
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    {
      // CacheFirst for Holiday API (data changes at most yearly)
      urlPattern: /^https:\/\/openholidaysapi\.org\/.*$/,
      handler: "CacheFirst",
      options: {
        cacheName: "holidays-api-cache",
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      // StaleWhileRevalidate for static assets
      urlPattern: /\.(js|css|png|jpg|svg|woff2?)$/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-assets",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
  ],
});

// Register event listeners
serwist.addEventListeners();
