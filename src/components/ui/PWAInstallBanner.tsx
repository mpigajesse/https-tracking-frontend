'use client';

import { useEffect, useState, useCallback } from 'react';
import { Download, X, Monitor, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Platform = 'ios' | 'macos-safari' | 'desktop' | 'mobile';

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  const isIOS =
    /iphone|ipad|ipod/i.test(ua) &&
    !(window as unknown as { MSStream?: unknown }).MSStream;
  if (isIOS) return 'ios';

  const isMac = /macintosh/i.test(ua);
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  if (isMac && isSafari) return 'macos-safari';

  const isMobile = /android|webos|blackberry|windows phone/i.test(ua);
  return isMobile ? 'mobile' : 'desktop';
}

function isDismissedRecently(): boolean {
  try {
    const ts = localStorage.getItem('pwa-dismissed-at');
    if (!ts) return false;
    // Réapparaît après 24h
    return Date.now() - parseInt(ts) < 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<Platform>('desktop');
  const [installing, setInstalling] = useState(false);

  const tryShow = useCallback((p: Platform) => {
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (isDismissedRecently()) return;
    setPlatform(p);
    setShow(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (isDismissedRecently()) return;

    const p = detectPlatform();

    // iOS & macOS Safari : guide manuel
    if (p === 'ios' || p === 'macos-safari') {
      const t = setTimeout(() => tryShow(p), 3000);
      return () => clearTimeout(t);
    }

    // Chrome / Edge desktop ou Android
    let fallbackTimer: ReturnType<typeof setTimeout>;
    let prompted = false;

    const handler = (e: Event) => {
      e.preventDefault();
      clearTimeout(fallbackTimer);
      prompted = true;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      tryShow(p);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Fallback : affiche le banner même sans prompt natif après 5s
    fallbackTimer = setTimeout(() => {
      if (!prompted && !window.matchMedia('(display-mode: standalone)').matches) {
        tryShow(p);
      }
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(fallbackTimer);
    };
  }, [tryShow]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      setInstalling(true);
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setInstalling(false);
      setDeferredPrompt(null);
      if (outcome === 'accepted') {
        setShow(false);
      }
    }
  };

  const handleDismiss = () => {
    setShow(false);
    try {
      localStorage.setItem('pwa-dismissed-at', String(Date.now()));
    } catch { /* */ }
  };

  const isDesktop = platform === 'desktop' || platform === 'macos-safari';
  const needsManualGuide = platform === 'ios' || platform === 'macos-safari';
  const hasNativePrompt = deferredPrompt !== null;

  const positionClass = isDesktop
    ? 'fixed bottom-5 right-5 z-50 w-80'
    : 'fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={isDesktop ? { x: 80, opacity: 0 } : { y: 100, opacity: 0 }}
          animate={isDesktop ? { x: 0, opacity: 1 } : { y: 0, opacity: 1 }}
          exit={isDesktop ? { x: 80, opacity: 0 } : { y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className={positionClass}
        >
          <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-2xl shadow-2xl overflow-hidden">
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #CC0000, #7A0000)' }} />

            <div className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #CC0000, #7A0000)' }}
                >
                  {isDesktop
                    ? <Monitor className="w-5 h-5 text-white" />
                    : <Smartphone className="w-5 h-5 text-white" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white leading-tight">
                    Installer Lear Track
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                    {platform === 'ios' && "Appuyez sur ↑ puis « Sur l'écran d'accueil »"}
                    {platform === 'macos-safari' && "Cliquez sur Partager → « Ajouter au Dock »"}
                    {platform === 'desktop' && "Accès direct depuis votre bureau, même hors connexion"}
                    {platform === 'mobile' && "Accès direct depuis l'écran d'accueil, même hors connexion"}
                  </p>
                </div>

                <button
                  onClick={handleDismiss}
                  className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0 -mt-0.5"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Bouton natif Chrome / Edge */}
              {!needsManualGuide && hasNativePrompt && (
                <button
                  onClick={handleInstall}
                  disabled={installing}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #CC0000, #7A0000)' }}
                >
                  <Download className="w-4 h-4" />
                  {installing ? 'Installation...' : "Installer l'application"}
                </button>
              )}

              {/* Guide desktop sans prompt natif */}
              {platform === 'desktop' && !hasNativePrompt && (
                <div className="mt-3 bg-[#111111] rounded-xl px-3 py-2.5">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Cliquez sur l&apos;icône{' '}
                    <span className="text-white font-semibold">⊕</span> ou{' '}
                    <span className="text-white font-semibold">Installer</span>{' '}
                    dans la barre d&apos;adresse de Chrome ou Edge
                  </p>
                </div>
              )}

              {/* Guide iOS */}
              {platform === 'ios' && (
                <div className="mt-3 flex items-center gap-2 bg-[#111111] rounded-xl px-3 py-2">
                  <span className="text-base">↑</span>
                  <span className="text-xs text-gray-400">
                    Partager → <span className="text-white font-medium">Sur l&apos;écran d&apos;accueil</span>
                  </span>
                </div>
              )}

              {/* Guide macOS Safari */}
              {platform === 'macos-safari' && (
                <div className="mt-3 flex items-center gap-2 bg-[#111111] rounded-xl px-3 py-2">
                  <span className="text-base">⬆</span>
                  <span className="text-xs text-gray-400">
                    Partager → <span className="text-white font-medium">Ajouter au Dock</span>
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
