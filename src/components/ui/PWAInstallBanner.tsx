'use client';

import { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Ne pas afficher si déjà installé (mode standalone)
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    // Ne pas afficher si déjà refusé dans cette session
    if (sessionStorage.getItem('pwa-dismissed')) return;

    // Détection iOS (Safari ne supporte pas beforeinstallprompt)
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(ios);

    if (ios) {
      // Sur iOS, afficher le guide manuel après 3s
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }

    // Android / Chrome / Edge
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
    }
    setInstalling(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShow(false);
    sessionStorage.setItem('pwa-dismissed', '1');
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm"
        >
          <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-2xl shadow-2xl overflow-hidden">
            {/* Barre rouge en haut */}
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #CC0000, #7A0000)' }} />

            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Icône */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #CC0000, #7A0000)' }}
                >
                  <Smartphone className="w-6 h-6 text-white" />
                </div>

                {/* Texte */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white leading-tight">
                    Installer Lear Track
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                    {isIOS
                      ? 'Appuyez sur  ↑  puis "Sur l\'écran d\'accueil"'
                      : 'Accès rapide depuis votre écran d\'accueil, même hors connexion'}
                  </p>
                </div>

                {/* Fermer */}
                <button
                  onClick={handleDismiss}
                  className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0 -mt-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Bouton installer (Android/Chrome uniquement) */}
              {!isIOS && (
                <button
                  onClick={handleInstall}
                  disabled={installing}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #CC0000, #7A0000)' }}
                >
                  <Download className="w-4 h-4" />
                  {installing ? 'Installation...' : 'Installer l\'application'}
                </button>
              )}

              {/* Guide iOS */}
              {isIOS && (
                <div className="mt-3 flex items-center gap-2 bg-[#111111] rounded-xl px-3 py-2">
                  <span className="text-lg">↑</span>
                  <span className="text-xs text-gray-400">
                    Partager → <span className="text-white font-medium">Sur l'écran d'accueil</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
