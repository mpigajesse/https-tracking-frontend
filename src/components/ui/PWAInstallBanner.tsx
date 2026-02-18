'use client';

import { useEffect, useState, useCallback } from 'react';
import { Download, X, Monitor, Smartphone, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// 5 cas possibles
type Platform = 'android' | 'ios' | 'desktop-chrome-edge' | 'desktop-safari' | 'desktop-other';

function detectPlatform(): Platform {
  const ua = navigator.userAgent;

  const isIOS = /iphone|ipad|ipod/i.test(ua) && !(window as unknown as Record<string, unknown>).MSStream;
  if (isIOS) return 'ios';

  const isAndroid = /android/i.test(ua);
  if (isAndroid) return 'android';

  // Desktop
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  if (isSafari) return 'desktop-safari';

  const isChromiumBased = /chrome|chromium|edg/i.test(ua);
  if (isChromiumBased) return 'desktop-chrome-edge';

  return 'desktop-other';
}

function isAlreadyInstalled(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function wasDismissedRecently(): boolean {
  try {
    const ts = localStorage.getItem('pwa-dismissed-at');
    if (!ts) return false;
    return Date.now() - parseInt(ts) < 24 * 60 * 60 * 1000; // 24h
  } catch {
    return false;
  }
}

// Hook partagé — exporté pour pouvoir l'utiliser dans le header aussi
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>('desktop-chrome-edge');
  const [isInstalled, setIsInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsInstalled(isAlreadyInstalled());
    setPlatform(detectPlatform());

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const triggerInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    setInstalling(true);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setInstalling(false);
    setDeferredPrompt(null);
    return outcome === 'accepted';
  }, [deferredPrompt]);

  return { deferredPrompt, platform, isInstalled, installing, triggerInstall };
}

// ─── Banner principal ──────────────────────────────────────────────────────────
export default function PWAInstallBanner() {
  const { deferredPrompt, platform, isInstalled, installing, triggerInstall } = usePWAInstall();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isInstalled || wasDismissedRecently()) return;

    const isMobile = platform === 'ios' || platform === 'android';
    const isDesktopSafari = platform === 'desktop-safari';

    // Mobile : afficher après 3s toujours (iOS guide manuel, Android prompt natif)
    if (isMobile) {
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }

    // Desktop Safari : afficher après 3s (guide manuel)
    if (isDesktopSafari) {
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }

    // Desktop Chrome/Edge : afficher seulement si on a le prompt natif
    if (platform === 'desktop-chrome-edge') {
      // On attend le beforeinstallprompt (max 6s)
      const t = setTimeout(() => {
        // Afficher même sans prompt pour guider l'utilisateur
        if (!wasDismissedRecently() && !isInstalled) setShow(true);
      }, 6000);
      return () => clearTimeout(t);
    }

    // Autres desktop : afficher après 5s
    const t = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(t);
  }, [platform, isInstalled]);

  // Quand le prompt arrive, afficher immédiatement sur desktop Chrome/Edge
  useEffect(() => {
    if (deferredPrompt && (platform === 'desktop-chrome-edge' || platform === 'android')) {
      if (!wasDismissedRecently() && !isInstalled && !dismissed) {
        setShow(true);
      }
    }
  }, [deferredPrompt, platform, isInstalled, dismissed]);

  // Cacher si installé
  useEffect(() => {
    if (isInstalled) setShow(false);
  }, [isInstalled]);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    try { localStorage.setItem('pwa-dismissed-at', String(Date.now())); } catch { /**/ }
  };

  const handleInstall = async () => {
    const accepted = await triggerInstall();
    if (accepted) setShow(false);
  };

  if (!show) return null;

  const isMobile = platform === 'ios' || platform === 'android';
  const hasNativePrompt = deferredPrompt !== null;

  // ── Positionnement : bas-centre sur mobile, bas-droite sur desktop
  const containerClass = isMobile
    ? 'fixed bottom-4 left-4 right-4 z-[9999] mx-auto max-w-sm'
    : 'fixed bottom-5 right-5 z-[9999] w-80';

  const slideFrom = isMobile
    ? { y: 120, opacity: 0 }
    : { x: 100, opacity: 0 };

  return (
    <AnimatePresence>
      <motion.div
        key="pwa-banner"
        initial={slideFrom}
        animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
        exit={slideFrom}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className={containerClass}
      >
        <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-2xl shadow-2xl overflow-hidden">
          {/* Barre rouge top */}
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,#CC0000,#7A0000)' }} />

          <div className="p-4">
            {/* En-tête */}
            <div className="flex items-start gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#CC0000,#7A0000)' }}
              >
                {isMobile
                  ? <Smartphone className="w-5 h-5 text-white" />
                  : <Monitor className="w-5 h-5 text-white" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white leading-tight">
                  Installer Lear Track
                </p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                  {platform === 'ios' && "Accès direct depuis l'écran d'accueil"}
                  {platform === 'android' && "Accès direct depuis l'écran d'accueil"}
                  {platform === 'desktop-chrome-edge' && "Accès direct depuis votre bureau"}
                  {platform === 'desktop-safari' && "Accès direct depuis le Dock"}
                  {platform === 'desktop-other' && "Accès direct depuis votre bureau"}
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

            {/* ── ANDROID : bouton natif si disponible ── */}
            {platform === 'android' && hasNativePrompt && (
              <button
                onClick={handleInstall}
                disabled={installing}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#CC0000,#7A0000)' }}
              >
                <Download className="w-4 h-4" />
                {installing ? 'Installation…' : "Installer l'application"}
              </button>
            )}

            {/* ── iOS : guide Share ── */}
            {platform === 'ios' && (
              <div className="mt-3 bg-[#111] rounded-xl px-3 py-2.5 flex items-center gap-2">
                <Share className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="text-xs text-gray-400">
                  Appuyez sur <span className="text-white font-medium">Partager</span> puis{' '}
                  <span className="text-white font-medium">Sur l&apos;écran d&apos;accueil</span>
                </span>
              </div>
            )}

            {/* ── Desktop Chrome / Edge : bouton natif ou guide barre d'adresse ── */}
            {platform === 'desktop-chrome-edge' && (
              hasNativePrompt ? (
                <button
                  onClick={handleInstall}
                  disabled={installing}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#CC0000,#7A0000)' }}
                >
                  <Download className="w-4 h-4" />
                  {installing ? 'Installation…' : "Installer l'application"}
                </button>
              ) : (
                <div className="mt-3 bg-[#111] rounded-xl px-3 py-2.5">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Cliquez sur l&apos;icône{' '}
                    <span className="text-white font-semibold">⊕</span> dans la barre d&apos;adresse
                    ou allez dans{' '}
                    <span className="text-white font-semibold">Menu → Installer Lear Track</span>
                  </p>
                </div>
              )
            )}

            {/* ── Desktop Safari (macOS) ── */}
            {platform === 'desktop-safari' && (
              <div className="mt-3 bg-[#111] rounded-xl px-3 py-2.5 flex items-center gap-2">
                <Share className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="text-xs text-gray-400">
                  Cliquez sur <span className="text-white font-medium">Partager</span> puis{' '}
                  <span className="text-white font-medium">Ajouter au Dock</span>
                </span>
              </div>
            )}

            {/* ── Autres navigateurs desktop ── */}
            {platform === 'desktop-other' && (
              <div className="mt-3 bg-[#111] rounded-xl px-3 py-2.5">
                <p className="text-xs text-gray-400 leading-relaxed">
                  Utilisez Chrome ou Edge pour installer l&apos;application sur votre bureau.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
