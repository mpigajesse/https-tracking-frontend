'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.log('[PWA] Service Worker enregistré:', reg.scope);
        })
        .catch((err) => {
          console.error('[PWA] Échec enregistrement SW:', err);
        });
    }
  }, []);

  return null;
}
