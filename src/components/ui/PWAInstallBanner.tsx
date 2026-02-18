'use client';

import { useEffect, useState, useCallback } from 'react';
import { Download, X, Monitor, Smartphone, Share, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Platform = 'android' | 'ios' | 'desktop-chrome' | 'desktop-edge' | 'desktop-safari' | 'desktop-other';
type Browser = 'chrome' | 'edge' | 'safari' | 'firefox' | 'other';

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  if (isIOS) return 'ios';
  const isAndroid = /android/i.test(ua);
  if (isAndroid) return 'android';
  // Desktop
  const isEdge = /edg\//i.test(ua);
  if (isEdge) return 'desktop-edge';
  const isChrome = /chrome\//i.test(ua) && !/edg\//i.test(ua);
  if (isChrome) return 'desktop-chrome';
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  if (isSafari) return 'desktop-safari';
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
    return Date.now() - parseInt(ts) < 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>('desktop-chrome');
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

// ─── Contenu selon la plateforme ────────────────────────────────────────────────
function BannerContent({
  platform,
  deferredPrompt,
  installing,
  onInstall,
}: {
  platform: Platform;
  deferredPrompt: BeforeInstallPromptEvent | null;
  installing: boolean;
  onInstall: () => void;
}) {
  const installButton = (
    <button
      onClick={onInstall}
      disabled={installing}
      className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
      style={{ background: 'linear-gradient(135deg,#CC0000,#7A0000)' }}
    >
      <Download className="w-4 h-4" />
      {installing ? 'Installation…' : "Installer l'application"}
    </button>
  );

  // ── Android Chrome ──
  if (platform === 'android') {
    return deferredPrompt ? (
      installButton
    ) : (
      <div className="mt-3 bg-[#111] rounded-xl px-3 py-2.5 space-y-1">
        <p className="text-xs text-gray-400">Dans Chrome Android :</p>
        <p className="text-xs text-white">Menu <span className="text-gray-400">(⋮)</span> → <strong>Ajouter à l&apos;écran d&apos;accueil</strong></p>
      </div>
    );
  }

  // ── iOS Safari ──
  if (platform === 'ios') {
    return (
      <div className="mt-3 bg-[#111] rounded-xl px-3 py-2.5 flex items-start gap-2">
        <Share className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-xs text-gray-400">Dans Safari :</p>
          <p className="text-xs text-white">
            Appuyez sur <strong>Partager ↑</strong> → <strong>Sur l&apos;écran d&apos;accueil</strong>
          </p>
        </div>
      </div>
    );
  }

  // ── Desktop Chrome ──
  if (platform === 'desktop-chrome') {
    if (deferredPrompt) return installButton;
    return (
      <div className="mt-3 bg-[#111] rounded-xl px-3 py-3 space-y-2">
        <p className="text-xs text-gray-400 font-medium">Pour installer dans Chrome :</p>
        <div className="flex items-start gap-2">
          <span className="text-xs text-[#CC0000] font-bold flex-shrink-0">1.</span>
          <p className="text-xs text-gray-300">
            Regardez à droite de la barre d&apos;adresse — cherchez l&apos;icône{' '}
            <span className="bg-[#222] px-1 py-0.5 rounded text-white font-mono">⊕</span> ou un écran avec une flèche
          </p>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-xs text-[#CC0000] font-bold flex-shrink-0">2.</span>
          <p className="text-xs text-gray-300">
            Si absent : <span className="text-white font-medium">Menu (⋮) → Enregistrer et partager → Installer la page en tant qu&apos;application</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5 pt-1 border-t border-[#2A2A2A]">
          <ExternalLink className="w-3 h-3 text-gray-500" />
          <p className="text-[11px] text-gray-500">Si aucune option : videz le cache Chrome et rechargez</p>
        </div>
      </div>
    );
  }

  // ── Desktop Edge ──
  if (platform === 'desktop-edge') {
    if (deferredPrompt) return installButton;
    return (
      <div className="mt-3 bg-[#111] rounded-xl px-3 py-3 space-y-2">
        <p className="text-xs text-gray-400 font-medium">Pour installer dans Edge :</p>
        <div className="flex items-start gap-2">
          <span className="text-xs text-[#CC0000] font-bold flex-shrink-0">1.</span>
          <p className="text-xs text-gray-300">
            Cherchez l&apos;icône{' '}
            <span className="bg-[#222] px-1 py-0.5 rounded text-white font-mono">⊕</span>{' '}
            à droite de la barre d&apos;adresse
          </p>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-xs text-[#CC0000] font-bold flex-shrink-0">2.</span>
          <p className="text-xs text-gray-300">
            Ou : <span className="text-white font-medium">Menu (…) → Applications → Installer ce site en tant qu&apos;application</span>
          </p>
        </div>
      </div>
    );
  }

  // ── Desktop Safari (macOS) ──
  if (platform === 'desktop-safari') {
    return (
      <div className="mt-3 bg-[#111] rounded-xl px-3 py-3 flex items-start gap-2">
        <Share className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-xs text-gray-400">Dans Safari (macOS) :</p>
          <p className="text-xs text-white">
            Menu <strong>Fichier</strong> → <strong>Ajouter au Dock</strong>
          </p>
        </div>
      </div>
    );
  }

  // ── Autres navigateurs ──
  return (
    <div className="mt-3 bg-[#111] rounded-xl px-3 py-2.5">
      <p className="text-xs text-gray-400 leading-relaxed">
        Utilisez <span className="text-white font-medium">Chrome</span> ou{' '}
        <span className="text-white font-medium">Edge</span> pour installer l&apos;application sur votre bureau.
      </p>
    </div>
  );
}

// ─── Sous-titre par plateforme ────────────────────────────────────────────────
function platformSubtitle(platform: Platform): string {
  switch (platform) {
    case 'android': return "Accès direct depuis l'écran d'accueil";
    case 'ios': return "Accès direct depuis l'écran d'accueil";
    case 'desktop-chrome': return 'Installez depuis Chrome — accès bureau';
    case 'desktop-edge': return 'Installez depuis Edge — accès bureau';
    case 'desktop-safari': return 'Installez depuis Safari — accès Dock';
    default: return 'Accès direct depuis votre bureau';
  }
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

    // Mobile : toujours afficher après 3s
    if (isMobile) {
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }

    // Desktop Chrome/Edge avec prompt natif : afficher immédiatement (géré par l'autre useEffect)
    // Desktop Chrome/Edge sans prompt : afficher après 4s avec guide manuel
    const t = setTimeout(() => {
      if (!wasDismissedRecently() && !isInstalled) setShow(true);
    }, 4000);
    return () => clearTimeout(t);
  }, [platform, isInstalled]);

  // Quand le prompt arrive → afficher immédiatement
  useEffect(() => {
    if (deferredPrompt && !wasDismissedRecently() && !isInstalled && !dismissed) {
      setShow(true);
    }
  }, [deferredPrompt, isInstalled, dismissed]);

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

  if (!show || dismissed) return null;

  const isMobile = platform === 'ios' || platform === 'android';

  const containerClass = isMobile
    ? 'fixed bottom-4 left-4 right-4 z-[9999] mx-auto max-w-sm'
    : 'fixed bottom-5 right-5 z-[9999] w-[340px]';

  const slideFrom = isMobile ? { y: 120, opacity: 0 } : { x: 120, opacity: 0 };
  const slideTo = isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 };

  return (
    <AnimatePresence>
      <motion.div
        key="pwa-banner"
        initial={slideFrom}
        animate={slideTo}
        exit={slideFrom}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className={containerClass}
      >
        <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,#CC0000,#7A0000)' }} />

          <div className="p-4">
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
                <p className="text-sm font-semibold text-white leading-tight">Installer Lear Track</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                  {platformSubtitle(platform)}
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

            <BannerContent
              platform={platform}
              deferredPrompt={deferredPrompt}
              installing={installing}
              onInstall={handleInstall}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
