'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // Only register service worker in production
    if (process.env.NODE_ENV !== 'production' || typeof window === 'undefined') {
      return;
    }

    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      return;
    }

    // Register service worker
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // Check for updates periodically
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available - optionally show update notification
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('[SW] Service worker registration failed:', error);
      });
  }, []);

  // This component renders nothing - it's purely for side effects
  return null;
}
