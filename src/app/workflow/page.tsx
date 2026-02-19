'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useInView } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, UserPlus, QrCode, HandMetal, ScanLine, ShieldCheck,
  Clock, CheckCircle2, LogOut, ClipboardCheck, BarChart3,
  AlertTriangle, XCircle, ChevronDown, Info, Zap, GitBranch,
  Play, RotateCcw, Users, Cpu, Eye, Wrench,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Animated background — identical to login
───────────────────────────────────────────── */
function AnimatedBackground() {
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ background: '#0A0A0A', zIndex: 0 }}>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 100%, #1a0000 0%, #0A0A0A 70%)' }} />
      <motion.div className="absolute w-[700px] h-[700px] rounded-full" style={{
        background: 'radial-gradient(circle, rgba(204,0,0,0.15) 0%, transparent 65%)',
        x: '-50%', y: '-50%', left: springX, top: springY,
      }} />
      <motion.div className="absolute rounded-full" style={{ width: 600, height: 600, top: '10%', left: '20%', background: 'radial-gradient(circle, rgba(204,0,0,0.10) 0%, transparent 70%)', filter: 'blur(40px)' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute rounded-full" style={{ width: 400, height: 400, bottom: '5%', right: '10%', background: 'radial-gradient(circle, rgba(204,0,0,0.07) 0%, transparent 70%)', filter: 'blur(60px)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />
      {[{ top: '18%', left: '62%', size: 120, delay: 0 }, { top: '55%', left: '30%', size: 80, delay: 1.5 }, { top: '75%', left: '70%', size: 60, delay: 3 }, { top: '10%', left: '15%', size: 50, delay: 0.8 }].map((f, i) => (
        <motion.div key={i} className="absolute rounded-full" style={{ top: f.top, left: f.left, width: f.size, height: f.size, background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(204,0,0,0.03) 40%, transparent 70%)', filter: 'blur(2px)' }}
          animate={{ opacity: [0, 0.7, 0], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: f.delay }} />
      ))}
      {[180, 320, 460, 580, 700, 820].map((size, i) => (
        <motion.div key={i} className="absolute rounded-full" style={{ width: size, height: size, border: '1px solid rgba(204,0,0,0.07)', top: '50%', left: '50%', marginLeft: -size / 2, marginTop: -size / 2 }}
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.98, 1.02, 0.98] }}
          transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }} />
      ))}
      <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='52' viewBox='0 0 60 52'%3E%3Cpolygon points='30,2 58,16 58,46 30,50 2,46 2,16' fill='none' stroke='%23CC0000' stroke-width='1'/%3E%3C/svg%3E")`, backgroundSize: '60px 52px' }} />
      {Array.from({ length: 24 }).map((_, i) => {
        const isRed = i % 4 === 0; const isMed = i % 3 === 1; const size = isRed ? 7 : isMed ? 5 : 3;
        return (
          <motion.div key={`p${i}`} className="absolute rounded-full" style={{ width: size, height: size, background: isRed ? 'rgba(204,0,0,0.85)' : isMed ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.12)', boxShadow: isRed ? '0 0 8px 3px rgba(204,0,0,0.45)' : isMed ? '0 0 6px 2px rgba(255,255,255,0.15)' : 'none', left: `${(i * 37 + 10) % 92}%`, top: `${(i * 53 + 5) % 92}%` }}
            animate={{ y: [-20, 20, -20], x: [-10, 10, -10], opacity: isRed ? [0.5, 1, 0.5] : [0.2, 0.6, 0.2], scale: isRed ? [0.8, 1.4, 0.8] : [1, 1.2, 1] }}
            transition={{ duration: 4 + (i % 5), repeat: Infinity, ease: 'easeInOut', delay: (i * 0.35) % 5 }} />
        );
      })}
      <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px)' }} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface Step {
  id: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  actor: 'admin' | 'system' | 'tech' | 'recep' | 'interim';
  phase: number; // 1–5
  detail: string;
  status?: 'success' | 'warning' | 'error';
}

const ACTORS = {
  admin:   { label: 'Administrateur', color: '#CC0000', icon: Users,      bg: 'rgba(204,0,0,0.12)' },
  system:  { label: 'Système',        color: '#8B5CF6', icon: Cpu,        bg: 'rgba(139,92,246,0.12)' },
  tech:    { label: 'Technicien',     color: '#10B981', icon: Wrench,     bg: 'rgba(16,185,129,0.12)' },
  recep:   { label: 'Réceptionniste', color: '#F59E0B', icon: Eye,        bg: 'rgba(245,158,11,0.12)' },
  interim: { label: 'Intérimaire',    color: '#3B82F6', icon: UserPlus,   bg: 'rgba(59,130,246,0.12)' },
} as const;

const PHASES = [
  { id: 1, label: 'Mise en place',  color: '#8B5CF6' },
  { id: 2, label: 'Entrée',         color: '#3B82F6' },
  { id: 3, label: 'Validation',     color: '#10B981' },
  { id: 4, label: 'Sortie',         color: '#F59E0B' },
  { id: 5, label: 'Supervision',    color: '#CC0000' },
];

const STEPS: Step[] = [
  { id: 's1', icon: UserPlus,      title: 'Création profil',         desc: 'Enregistrement intérimaire',   actor: 'admin',   phase: 1, detail: 'Saisie : nom, CIN, agence, site assigné, dates de mission. Validation des champs obligatoires.', status: 'success' },
  { id: 's2', icon: QrCode,        title: 'Génération QR',           desc: 'QR Code signé numériquement',  actor: 'system',  phase: 1, detail: 'QR contient : ID intérimaire, site autorisé, date expiration. Envoi email/SMS automatique.' },
  { id: 's3', icon: HandMetal,     title: 'Remise QR Code',          desc: 'Distribution à l\'intérimaire', actor: 'tech',    phase: 1, detail: 'Impression papier ou smartphone. QR valide uniquement pendant la période de mission.', status: 'success' },
  { id: 's4', icon: ScanLine,      title: 'Scan entrée',             desc: 'Lecture QR Code accueil',      actor: 'recep',   phase: 2, detail: 'Webcam ou lecteur QR. Le système vérifie : validité, site autorisé, période mission, statut actif.' },
  { id: 's5', icon: ShieldCheck,   title: 'Vérification identité',   desc: 'Contrôle & affichage fiche',   actor: 'system',  phase: 2, detail: 'Affichage : photo, nom, agence, site autorisé, date fin mission. Statut : Autorisé / Refusé.', status: 'success' },
  { id: 's6', icon: Clock,         title: 'Ouverture session',       desc: 'Horodatage heure entrée',      actor: 'recep',   phase: 2, detail: "Création session avec heure d'entrée horodatée. Statut initial : WAIT_OPEN." },
  { id: 's7', icon: CheckCircle2,  title: 'Validation ouverture',    desc: 'Confirmation technicien',      actor: 'tech',    phase: 3, detail: 'Actions : Valider, Refuser, Corriger heure manuellement. Session → statut OPEN. Délai max : 30 min.', status: 'success' },
  { id: 's8', icon: LogOut,        title: 'Scan sortie',             desc: 'Rescanner QR fin de journée',  actor: 'recep',   phase: 4, detail: "Même procédure qu'à l'entrée. Déclenche la fermeture de session." },
  { id: 's9', icon: ClipboardCheck,title: 'Validation fermeture',    desc: 'Clôture & calcul durée',       actor: 'tech',    phase: 4, detail: 'Vérification durée (< 12h, > 0h). Correction possible. Session → statut CLOSED.', status: 'success' },
  { id: 's10', icon: BarChart3,    title: 'Dashboard temps réel',    desc: 'KPIs & alertes admin',         actor: 'admin',   phase: 5, detail: 'KPIs recalculés, graphiques mis à jour, alertes si anomalie (dépassement 48h, session non clôturée).' },
];

/* ─────────────────────────────────────────────
   Animated flow dot on SVG path
───────────────────────────────────────────── */
function FlowDot({ color, active }: { color: string; active: boolean }) {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{ background: color, boxShadow: `0 0 6px 3px ${color}55`, top: '50%', left: 0, marginTop: -4 }}
      animate={active ? { left: ['0%', '100%'], opacity: [0, 1, 1, 0] } : { opacity: 0 }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.4 }}
    />
  );
}

/* ─────────────────────────────────────────────
   Animated SVG arrow connector
───────────────────────────────────────────── */
function Arrow({ color, active, vertical = false, curved = false, reverse = false }:
  { color: string; active: boolean; vertical?: boolean; curved?: boolean; reverse?: boolean }
) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  if (vertical) {
    return (
      <div ref={ref} className="flex justify-center items-center relative" style={{ height: 44 }}>
        <svg width="24" height="44" viewBox="0 0 24 44" fill="none" className="overflow-visible">
          <motion.line x1="12" y1="0" x2="12" y2="30"
            stroke={color} strokeWidth="1.5" strokeDasharray="5 3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={inView ? { pathLength: 1, opacity: 0.8 } : {}}
            transition={{ duration: 0.6 }} />
          <motion.polygon points="12,42 6,28 18,28" fill={color}
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }} />
        </svg>
        {active && (
          <motion.div className="absolute rounded-full" style={{ width: 8, height: 8, background: color, boxShadow: `0 0 8px 3px ${color}66`, left: '50%', marginLeft: -4, top: 0 }}
            animate={{ top: [0, 30], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.6 }} />
        )}
      </div>
    );
  }

  if (curved) {
    const path = reverse
      ? 'M 80 20 C 60 20, 20 0, 20 20'
      : 'M 20 20 C 20 0, 60 0, 80 20';
    return (
      <div ref={ref} className="relative" style={{ width: 80, height: 40 }}>
        <svg width="80" height="40" viewBox="0 0 80 40" fill="none" className="overflow-visible">
          <motion.path d={path} stroke={color} strokeWidth="1.5" strokeDasharray="5 3" fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={inView ? { pathLength: 1, opacity: 0.7 } : {}}
            transition={{ duration: 0.7 }} />
        </svg>
      </div>
    );
  }

  return (
    <div ref={ref} className="flex items-center justify-center relative" style={{ width: 52, height: 24 }}>
      <svg width="52" height="24" viewBox="0 0 52 24" fill="none">
        <motion.line x1="2" y1="12" x2="36" y2="12"
          stroke={color} strokeWidth="1.5" strokeDasharray="5 3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 0.8 } : {}}
          transition={{ duration: 0.5 }} />
        <motion.polygon points="48,12 35,6 35,18" fill={color}
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.4 }} />
      </svg>
      {active && (
        <motion.div className="absolute h-2 w-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px 3px ${color}66`, top: '50%', marginTop: -4, left: 2 }}
          animate={{ left: [2, 38], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.5 }} />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Node (step card in diagram)
───────────────────────────────────────────── */
function Node({ step, index, isActive, isPlaying, onClick }: {
  step: Step; index: number; isActive: boolean; isPlaying: boolean; onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const actor = ACTORS[step.actor];
  const Icon = step.icon;
  const phase = PHASES.find(p => p.id === step.phase)!;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.07, type: 'spring', stiffness: 180, damping: 20 }}
      onClick={onClick}
      className="relative cursor-pointer select-none"
      style={{ zIndex: isActive ? 20 : 1 }}
    >
      {/* Glow ring when active or playing */}
      {(isActive || isPlaying) && (
        <motion.div className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ outline: `2px solid ${actor.color}`, outlineOffset: 1 }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }} />
      )}

      {/* Pulse ring */}
      <motion.div className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ border: `1px solid ${actor.color}40` }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: index * 0.15 }} />

      <div className="relative rounded-2xl border transition-all duration-300"
        style={{
          background: isActive
            ? `linear-gradient(135deg, ${actor.color}18 0%, #141414 100%)`
            : 'rgba(18,18,18,0.9)',
          borderColor: isActive ? actor.color + '60' : actor.color + '25',
          backdropFilter: 'blur(12px)',
          width: 130,
          minHeight: 130,
        }}
      >
        {/* Top color bar */}
        <div className="h-0.5 w-full rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${actor.color}, transparent)` }} />

        <div className="p-3 flex flex-col items-center text-center gap-2">
          {/* Step badge */}
          <div className="absolute -top-2.5 -left-2.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow"
            style={{ background: phase.color }}>
            {index + 1}
          </div>

          {/* Icon */}
          <div className="relative mt-1">
            <motion.div className="absolute inset-0 rounded-xl"
              style={{ background: actor.color + '30' }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: index * 0.2 }} />
            <div className="relative w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: actor.bg, border: `1px solid ${actor.color}35` }}>
              <Icon className="w-5 h-5" style={{ color: actor.color }} />
            </div>
          </div>

          {/* Actor badge */}
          <div className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
            style={{ background: actor.color + '18', color: actor.color, border: `1px solid ${actor.color}30` }}>
            {actor.label}
          </div>

          {/* Title */}
          <div className="text-white font-bold text-[11px] leading-tight" style={{ fontFamily: 'var(--font-syne)' }}>
            {step.title}
          </div>
          <div className="text-[#6B7280] text-[10px] leading-tight">{step.desc}</div>
        </div>
      </div>

      {/* Detail popover */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 rounded-xl border p-3 z-50"
              style={{ background: '#111', borderColor: actor.color + '50', filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.7))' }}
          >
            <div className="flex gap-2 text-xs text-[#D1D5DB] leading-relaxed">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: actor.color }} />
              <span>{step.detail}</span>
            </div>
            {/* Arrow pointer */}
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-l border-t"
              style={{ background: '#111', borderColor: actor.color + '50' }} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Swimlane row header
───────────────────────────────────────────── */
function SwimlaneRow({ actorKey, steps, activeStep, playingStep, onStepClick }: {
  actorKey: keyof typeof ACTORS;
  steps: Step[];
  activeStep: string | null;
  playingStep: number;
  onStepClick: (id: string) => void;
}) {
  const actor = ACTORS[actorKey];
  const ActorIcon = actor.icon;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  if (steps.length === 0) return null;

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-0"
    >
      {/* Actor label */}
      <div className="flex-shrink-0 w-40 flex items-center gap-2.5 pr-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: actor.bg, border: `1px solid ${actor.color}35` }}>
          <ActorIcon className="w-4 h-4" style={{ color: actor.color }} />
        </div>
        <span className="text-xs font-bold" style={{ color: actor.color, fontFamily: 'var(--font-syne)' }}>
          {actor.label}
        </span>
      </div>

      {/* Lane background line */}
      <div className="flex-1 relative">
        <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 opacity-20"
          style={{ background: `linear-gradient(90deg, ${actor.color}, transparent)` }} />

        <div className="flex items-center gap-0">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <Node
                step={step}
                index={STEPS.indexOf(step)}
                isActive={activeStep === step.id}
                isPlaying={playingStep === STEPS.indexOf(step)}
                onClick={() => onStepClick(step.id)}
              />
              {i < steps.length - 1 && (
                <Arrow color={actor.color} active={playingStep >= STEPS.indexOf(step)} />
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Linear flow (mobile + full view)
───────────────────────────────────────────── */
function LinearFlow({ steps, activeStep, playingStep, onStepClick }: {
  steps: Step[]; activeStep: string | null; playingStep: number; onStepClick: (id: string) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-0">
      {steps.map((step, i) => {
        const actor = ACTORS[step.actor];
        const phase = PHASES.find(p => p.id === step.phase)!;
        const Icon = step.icon;
        const ref = useRef<HTMLDivElement>(null);
        const inView = useInView(ref, { once: true, margin: '-40px' });
        const isActive = activeStep === step.id;
        const isPlaying = playingStep === i;

        return (
          <div key={step.id} ref={ref} className="flex flex-col items-center w-full max-w-sm">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              onClick={() => onStepClick(step.id)}
              className="w-full cursor-pointer rounded-2xl border transition-all duration-300 overflow-hidden"
              style={{
                background: isActive ? `linear-gradient(135deg, ${actor.color}15, #141414)` : 'rgba(18,18,18,0.9)',
                borderColor: isActive ? actor.color + '55' : isPlaying ? actor.color + '40' : actor.color + '20',
                backdropFilter: 'blur(12px)',
                boxShadow: isPlaying ? `0 0 20px ${actor.color}22` : undefined,
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {/* Color bar */}
              <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${actor.color}, transparent)` }} />

              <div className="p-4 flex items-start gap-3">
                {/* Step number + icon */}
                <div className="relative flex-shrink-0">
                  <motion.div className="absolute inset-0 rounded-xl"
                    style={{ background: actor.color + '25' }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: i * 0.15 }} />
                  <div className="relative w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: actor.bg, border: `1px solid ${actor.color}30` }}>
                    <Icon className="w-5 h-5" style={{ color: actor.color }} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow"
                    style={{ background: phase.color }}>
                    {i + 1}
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
                      style={{ background: actor.color + '18', color: actor.color, border: `1px solid ${actor.color}30` }}>
                      {actor.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{ background: phase.color + '15', color: phase.color + 'CC', border: `1px solid ${phase.color}25` }}>
                      Phase {step.phase}
                    </span>
                  </div>
                  <div className="text-white font-bold text-sm" style={{ fontFamily: 'var(--font-syne)' }}>{step.title}</div>
                  <div className="text-[#9CA3AF] text-xs mt-0.5">{step.desc}</div>
                </div>

                <motion.div animate={{ rotate: isActive ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0 text-[#4B5563]">
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </div>

              <AnimatePresence>
                {isActive && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                    <div className="mx-4 mb-4 p-3 rounded-xl border-l-2 text-xs text-[#D1D5DB] leading-relaxed"
                      style={{ background: actor.color + '0C', borderColor: actor.color }}>
                      <div className="flex gap-2">
                        <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: actor.color }} />
                        <span>{step.detail}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {i < steps.length - 1 && (
              <Arrow color={PHASES.find(p => p.id === step.phase)!.color} active={playingStep >= i} vertical />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Linear flow — light white background version
───────────────────────────────────────────── */
function LinearFlowLight({ steps, activeStep, playingStep, onStepClick }: {
  steps: Step[]; activeStep: string | null; playingStep: number; onStepClick: (id: string) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-0">
      {steps.map((step, i) => {
        const actor = ACTORS[step.actor];
        const phase = PHASES.find(p => p.id === step.phase)!;
        const Icon = step.icon;
        const ref = useRef<HTMLDivElement>(null);
        const inView = useInView(ref, { once: true, margin: '-40px' });
        const isActive = activeStep === step.id;
        const isPlaying = playingStep === i;

        return (
          <div key={step.id} ref={ref} className="flex flex-col items-center w-full max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              onClick={() => onStepClick(step.id)}
              className="w-full cursor-pointer rounded-2xl border transition-all duration-300 overflow-hidden"
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${actor.color}08, #FFFFFF)`
                  : isPlaying
                  ? `${actor.color}06`
                  : '#FFFFFF',
                borderColor: isActive ? actor.color + '60' : isPlaying ? actor.color + '40' : '#E5E7EB',
                boxShadow: isActive
                  ? `0 4px 24px ${actor.color}18`
                  : isPlaying
                  ? `0 2px 12px ${actor.color}14`
                  : '0 1px 4px rgba(0,0,0,0.06)',
              }}
              whileHover={{ scale: 1.005, boxShadow: `0 4px 20px ${actor.color}14` }}
              whileTap={{ scale: 0.998 }}
            >
              {/* Top accent bar */}
              <div className="h-[3px] w-full" style={{ background: isActive || isPlaying ? `linear-gradient(90deg, ${actor.color}, ${actor.color}40)` : `linear-gradient(90deg, ${actor.color}40, transparent)` }} />

              <div className="p-4 flex items-start gap-4">
                {/* Icon + badge */}
                <div className="relative flex-shrink-0">
                  <motion.div className="absolute inset-0 rounded-xl"
                    style={{ background: actor.color + '15' }}
                    animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeOut', delay: i * 0.15 }} />
                  <div className="relative w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: actor.color + '12', border: `1.5px solid ${actor.color}30` }}>
                    <Icon className="w-5 h-5" style={{ color: actor.color }} />
                  </div>
                  {/* Step number badge */}
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-md"
                    style={{ background: phase.color }}>
                    {i + 1}
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
                      style={{ background: actor.color + '12', color: actor.color, border: `1px solid ${actor.color}25` }}>
                      {actor.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ background: phase.color + '10', color: phase.color, border: `1px solid ${phase.color}25` }}>
                      Phase {step.phase} — {phase.label}
                    </span>
                    {isPlaying && (
                      <motion.span className="px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1"
                        style={{ background: '#CC000010', color: '#CC0000', border: '1px solid #CC000030' }}
                        animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#CC0000] inline-block" />
                        En cours
                      </motion.span>
                    )}
                  </div>
                  <div className="text-[#111827] font-bold text-sm" style={{ fontFamily: 'var(--font-syne)' }}>{step.title}</div>
                  <div className="text-[#6B7280] text-xs mt-0.5">{step.desc}</div>
                </div>

                <motion.div animate={{ rotate: isActive ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0 text-[#9CA3AF] mt-1">
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </div>

              {/* Expanded detail */}
              <AnimatePresence>
                {isActive && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                    <div className="mx-4 mb-4 p-3 rounded-xl border-l-2 text-xs leading-relaxed"
                      style={{ background: actor.color + '07', borderColor: actor.color, color: '#374151' }}>
                      <div className="flex gap-2">
                        <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: actor.color }} />
                        <span>{step.detail}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Arrow between steps */}
            {i < steps.length - 1 && (
              <div className="flex justify-center items-center my-1" style={{ height: 36 }}>
                <svg width="24" height="36" viewBox="0 0 24 36" fill="none">
                  <motion.line x1="12" y1="0" x2="12" y2="22"
                    stroke={PHASES.find(p => p.id === step.phase)!.color}
                    strokeWidth="1.5" strokeDasharray="4 3"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={inView ? { pathLength: 1, opacity: 0.6 } : {}}
                    transition={{ duration: 0.5, delay: i * 0.05 }} />
                  <motion.polygon points="12,34 6,20 18,20"
                    fill={PHASES.find(p => p.id === step.phase)!.color}
                    initial={{ opacity: 0 }} animate={inView ? { opacity: 0.7 } : {}} transition={{ delay: 0.4 + i * 0.05 }} />
                </svg>
                {playingStep > i && (
                  <motion.div className="absolute w-2 h-2 rounded-full"
                    style={{ background: PHASES.find(p => p.id === step.phase)!.color, boxShadow: `0 0 6px 3px ${PHASES.find(p => p.id === step.phase)!.color}55` }}
                    animate={{ top: [0, 22], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }} />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Animated progress bar
───────────────────────────────────────────── */
function ProgressBar({ current, total, color }: { current: number; total: number; color: string }) {
  return (
    <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
        animate={{ width: `${(current / total) * 100}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main page
───────────────────────────────────────────── */
export default function WorkflowPage() {
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingStep, setPlayingStep] = useState(-1);
  const [viewMode, setViewMode] = useState<'flow' | 'swimlane'>('flow');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-play animation
  useEffect(() => {
    if (isPlaying) {
      setPlayingStep(0);
      intervalRef.current = setInterval(() => {
        setPlayingStep(prev => {
          if (prev >= STEPS.length - 1) {
            setIsPlaying(false);
            return -1;
          }
          return prev + 1;
        });
      }, 900);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying]);

  const handleStepClick = (id: string) => setActiveStep(prev => prev === id ? null : id);

  const resetPlay = () => {
    setIsPlaying(false);
    setPlayingStep(-1);
  };

  // Swimlane: group steps by actor
  const byActor = (key: keyof typeof ACTORS) => STEPS.filter(s => s.actor === key);

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden" style={{ fontFamily: 'var(--font-geist-sans)' }}>
      <AnimatedBackground />

      {/* ── Topbar ── */}
      <div className="sticky top-0 z-30 border-b border-white/8" style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-4">
          <Link href="/login" className="flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-colors text-sm group">
            <motion.div whileHover={{ x: -3 }} transition={{ type: 'spring', stiffness: 400 }}>
              <ArrowLeft className="w-4 h-4" />
            </motion.div>
            <span className="hidden sm:inline">Retour</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow">
              <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Lear_Corporation_logo.svg/960px-Lear_Corporation_logo.svg.png"
                alt="Lear" width={22} height={14} className="object-contain" unoptimized />
            </div>
            <span className="text-white font-bold text-sm hidden sm:inline" style={{ fontFamily: 'var(--font-syne)' }}>Lear Corporation</span>
            <span className="text-[#CC0000] text-xs hidden md:inline">— Diagramme Workflow</span>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg border border-white/10" style={{ background: 'rgba(20,20,20,0.8)' }}>
            {(['flow', 'swimlane'] as const).map(mode => (
              <motion.button key={mode} onClick={() => setViewMode(mode)} whileTap={{ scale: 0.96 }}
                className="px-3 py-1 rounded-md text-xs font-semibold transition-all"
                style={viewMode === mode
                  ? { background: '#CC0000', color: '#fff' }
                  : { color: '#6B7280' }
                }>
                {mode === 'flow' ? 'Flux' : 'Swimlane'}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-10 space-y-10">

        {/* ── Hero ── */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center space-y-5">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#CC0000]/30 text-[#CC0000] text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(204,0,0,0.08)', backdropFilter: 'blur(8px)' }}
            animate={{ scale: [1, 1.03, 1], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Zap className="w-3.5 h-3.5" />
            Système de Pointage — Flux Complet
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight" style={{ fontFamily: 'var(--font-syne)' }}>
            Diagramme de <span className="text-[#CC0000]">Workflow</span>
          </h1>
          <p className="text-[#9CA3AF] max-w-lg mx-auto text-sm leading-relaxed">
            Visualisation complète du processus — de la création du profil intérimaire jusqu&apos;à la supervision administrateur en temps réel.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 pt-1">
            {[
              { val: '10', label: 'étapes', color: '#CC0000' },
              { val: '5',  label: 'acteurs', color: '#8B5CF6' },
              { val: '5',  label: 'phases', color: '#3B82F6' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1, type: 'spring' }} className="flex items-baseline gap-1">
                <span className="text-2xl font-black" style={{ color: s.color, fontFamily: 'var(--font-syne)' }}>{s.val}</span>
                <span className="text-xs text-[#6B7280]">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Playback controls ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => isPlaying ? resetPlay() : setIsPlaying(true)}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all"
              style={{ background: isPlaying ? 'rgba(204,0,0,0.15)' : '#CC0000', color: '#fff', border: isPlaying ? '1px solid #CC0000' : 'none', boxShadow: isPlaying ? 'none' : '0 4px 20px rgba(204,0,0,0.35)' }}
            >
              {isPlaying ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Arrêter' : 'Animer le flux'}
            </motion.button>

            {playingStep >= 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-xs text-[#9CA3AF] px-3 py-2 rounded-full border border-white/10"
                style={{ background: 'rgba(20,20,20,0.8)' }}>
                <motion.div className="w-2 h-2 rounded-full bg-[#CC0000]"
                  animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
                Étape {playingStep + 1} / {STEPS.length}
              </motion.div>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-md">
            <ProgressBar current={playingStep + 1} total={STEPS.length} color="#CC0000" />
          </div>
        </motion.div>

        {/* ── Phase legend ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-2 justify-center">
          {PHASES.map((phase, i) => (
            <motion.div key={phase.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.06 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold"
              style={{ background: phase.color + '12', borderColor: phase.color + '35', color: phase.color }}>
              <div className="w-2 h-2 rounded-full" style={{ background: phase.color }} />
              Phase {phase.id} — {phase.label}
            </motion.div>
          ))}
        </motion.div>

        {/* ══════════════════════════════════════════════
            FLOW VIEW — vertical linear (mobile-first)
        ══════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {viewMode === 'flow' && (
            <motion.div key="flow" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>

                {/* ── Schéma visuel compact (desktop) ── */}
                <div className="hidden lg:block mb-10">
                  <div className="rounded-2xl border border-[#E5E7EB] overflow-hidden"
                    style={{ background: '#FFFFFF' }}>

                    {/* Title */}
                    <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center gap-3"
                      style={{ background: '#F9FAFB' }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(204,0,0,0.1)' }}>
                        <GitBranch className="w-4 h-4 text-[#CC0000]" />
                      </div>
                      <span className="text-[#111827] font-bold text-sm" style={{ fontFamily: 'var(--font-syne)' }}>
                        Schéma visuel — Flux complet
                      </span>
                      <span className="text-[#9CA3AF] text-xs ml-auto">Cliquez sur un nœud pour plus de détails</span>
                    </div>

                    {/* Phase rows */}
                    <div className="p-6 space-y-3 overflow-x-auto">
                      {PHASES.map((phase, pi) => {
                        const phaseSteps = STEPS.filter(s => s.phase === phase.id);
                        return (
                          <div key={phase.id} className="flex items-center min-w-0 rounded-xl py-3 px-4"
                            style={{ background: phase.color + '07', border: `1px solid ${phase.color}20` }}>

                            {/* Phase label */}
                            <div className="flex-shrink-0 w-32 pr-4">
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-2 h-2 rounded-full" style={{ background: phase.color }} />
                                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: phase.color }}>
                                    Phase {phase.id}
                                  </span>
                                </div>
                                <span className="text-[11px] font-semibold text-[#374151] ml-3.5">{phase.label}</span>
                              </div>
                            </div>

                            {/* Separator */}
                            <div className="w-px self-stretch flex-shrink-0 mr-5 rounded-full opacity-40" style={{ background: phase.color }} />

                            {/* Nodes */}
                            <div className="flex items-center gap-0 flex-1">
                              {phaseSteps.map((step, si) => {
                                const actor = ACTORS[step.actor];
                                const Icon = step.icon;
                                const globalIndex = STEPS.indexOf(step);
                                const isActive = activeStep === step.id;
                                const isPlaying = playingStep === globalIndex;
                                return (
                                  <div key={step.id} className="flex items-center">
                                    {/* Light node card */}
                                    <motion.div
                                      onClick={() => handleStepClick(step.id)}
                                      className="relative cursor-pointer rounded-xl border transition-all duration-200"
                                      style={{
                                        width: 118,
                                        background: isActive
                                          ? `linear-gradient(135deg, ${actor.color}15, #fff)`
                                          : '#FFFFFF',
                                        borderColor: isActive ? actor.color + '70' : isPlaying ? actor.color + '50' : '#E5E7EB',
                                        boxShadow: isActive
                                          ? `0 4px 20px ${actor.color}22`
                                          : isPlaying
                                          ? `0 2px 10px ${actor.color}18`
                                          : '0 1px 3px rgba(0,0,0,0.07)',
                                      }}
                                      whileHover={{ y: -2, boxShadow: `0 6px 20px ${actor.color}20` }}
                                      whileTap={{ scale: 0.97 }}
                                    >
                                      {/* Top accent */}
                                      <div className="h-[3px] w-full rounded-t-xl"
                                        style={{ background: `linear-gradient(90deg, ${actor.color}, ${actor.color}40)` }} />

                                      <div className="p-3 flex flex-col items-center text-center gap-1.5">
                                        {/* Badge numéro */}
                                        <div className="absolute -top-2.5 -left-2.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-md"
                                          style={{ background: phase.color }}>
                                          {globalIndex + 1}
                                        </div>

                                        {/* Pulse ring */}
                                        {isPlaying && (
                                          <motion.div className="absolute inset-0 rounded-xl pointer-events-none"
                                            style={{ border: `2px solid ${actor.color}` }}
                                            animate={{ opacity: [0.8, 0.2, 0.8], scale: [1, 1.06, 1] }}
                                            transition={{ duration: 1.2, repeat: Infinity }} />
                                        )}

                                        {/* Icon */}
                                        <div className="relative mt-1">
                                          <motion.div className="absolute inset-0 rounded-lg"
                                            style={{ background: actor.color + '20' }}
                                            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                                            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: globalIndex * 0.18 }} />
                                          <div className="relative w-9 h-9 rounded-lg flex items-center justify-center"
                                            style={{ background: actor.color + '12', border: `1.5px solid ${actor.color}30` }}>
                                            <Icon className="w-4 h-4" style={{ color: actor.color }} />
                                          </div>
                                        </div>

                                        {/* Actor pill */}
                                        <div className="px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wide"
                                          style={{ background: actor.color + '12', color: actor.color, border: `1px solid ${actor.color}25` }}>
                                          {actor.label}
                                        </div>

                                        {/* Title */}
                                        <div className="text-[#111827] font-bold text-[11px] leading-tight" style={{ fontFamily: 'var(--font-syne)' }}>
                                          {step.title}
                                        </div>
                                        <div className="text-[#9CA3AF] text-[9px] leading-tight">{step.desc}</div>
                                      </div>

                                      {/* Detail popover */}
                                      <AnimatePresence>
                                        {isActive && (
                                          <motion.div
                                            initial={{ opacity: 0, y: -6, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -6, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-60 rounded-xl border p-3 z-50"
                                            style={{
                                              background: '#FFFFFF',
                                              borderColor: actor.color + '40',
                                              boxShadow: `0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px ${actor.color}20`,
                                            }}
                                          >
                                            <div className="flex gap-2 text-xs text-[#374151] leading-relaxed">
                                              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: actor.color }} />
                                              <span>{step.detail}</span>
                                            </div>
                                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-l border-t bg-white"
                                              style={{ borderColor: actor.color + '40' }} />
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </motion.div>

                                    {/* Arrow between nodes */}
                                    {si < phaseSteps.length - 1 && (
                                      <div className="flex items-center justify-center relative" style={{ width: 48, height: 24 }}>
                                        <svg width="48" height="24" viewBox="0 0 48 24" fill="none" className="overflow-visible">
                                          <motion.line x1="2" y1="12" x2="32" y2="12"
                                            stroke={phase.color} strokeWidth="1.5" strokeDasharray="4 3"
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 0.7 }}
                                            transition={{ duration: 0.5, delay: si * 0.1 }} />
                                          <motion.polygon points="44,12 31,6 31,18" fill={phase.color}
                                            initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} transition={{ delay: 0.4 + si * 0.1 }} />
                                        </svg>
                                        {/* Animated dot */}
                                        {playingStep >= globalIndex && (
                                          <motion.div className="absolute rounded-full" style={{ width: 7, height: 7, background: phase.color, boxShadow: `0 0 7px 3px ${phase.color}55`, top: '50%', marginTop: -3.5, left: 2 }}
                                            animate={{ left: [2, 34], opacity: [0, 1, 1, 0] }}
                                            transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.3 }} />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}

                              {/* Inter-phase arrow */}
                              {pi < PHASES.length - 1 && (
                                <div className="flex items-center ml-3 gap-1">
                                  <div className="flex flex-col items-center gap-0.5 opacity-60">
                                    <span className="text-[8px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: PHASES[pi + 1].color }}>
                                      → Ph. {phase.id + 1}
                                    </span>
                                    <svg width="36" height="16" viewBox="0 0 36 16" fill="none">
                                      <motion.line x1="2" y1="8" x2="24" y2="8"
                                        stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="3 3"
                                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: pi * 0.15 }} />
                                      <motion.polygon points="33,8 22,3 22,13" fill="#D1D5DB"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              {/* ── Linear flow (all screens) ── */}
              <div className="rounded-2xl border border-[#E5E7EB] overflow-hidden"
                style={{ background: '#FFFFFF' }}>
                <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center gap-3"
                  style={{ background: '#F9FAFB' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(204,0,0,0.1)' }}>
                    <GitBranch className="w-4 h-4 text-[#CC0000]" />
                  </div>
                  <span className="text-[#111827] font-bold text-sm" style={{ fontFamily: 'var(--font-syne)' }}>Flux détaillé — 10 étapes</span>
                  <span className="text-[#6B7280] text-xs ml-auto hidden sm:inline">Cliquez pour voir les détails</span>
                </div>
                <div className="p-4 md:p-8" style={{ background: '#FFFFFF' }}>
                  <LinearFlowLight steps={STEPS} activeStep={activeStep} playingStep={playingStep} onStepClick={handleStepClick} />
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════
              SWIMLANE VIEW
          ══════════════════════════════════════════════ */}
          {viewMode === 'swimlane' && (
            <motion.div key="swimlane" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <div className="rounded-2xl border border-white/8 overflow-hidden"
                style={{ background: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(16px)' }}>

                <div className="px-6 py-4 border-b border-white/8 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(204,0,0,0.2)' }}>
                    <Users className="w-4 h-4 text-[#CC0000]" />
                  </div>
                  <span className="text-white font-bold text-sm" style={{ fontFamily: 'var(--font-syne)' }}>Vue Swimlane — par acteur</span>
                  <span className="text-[#6B7280] text-xs ml-auto hidden sm:inline">Responsabilités par rôle</span>
                </div>

                <div className="p-6 overflow-x-auto">
                  <div className="space-y-10 min-w-[640px]">
                    {(Object.keys(ACTORS) as Array<keyof typeof ACTORS>).map(actorKey => {
                      const actorSteps = STEPS.filter(s => s.actor === actorKey);
                      if (!actorSteps.length) return null;
                      const actor = ACTORS[actorKey];
                      const ActorIcon = actor.icon;
                      return (
                        <div key={actorKey} className="relative">
                          {/* Lane background */}
                          <div className="absolute inset-0 rounded-2xl opacity-30" style={{ background: `linear-gradient(90deg, ${actor.color}08, transparent)`, border: `1px solid ${actor.color}15` }} />

                          <div className="relative p-4 flex items-center gap-0">
                            {/* Actor header */}
                            <div className="flex-shrink-0 w-36 flex flex-col items-center gap-2 pr-4 border-r border-white/8 mr-6">
                              <motion.div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: actor.bg, border: `1px solid ${actor.color}40` }}
                                animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                              >
                                <ActorIcon className="w-5 h-5" style={{ color: actor.color }} />
                              </motion.div>
                              <span className="text-[11px] font-bold text-center" style={{ color: actor.color, fontFamily: 'var(--font-syne)' }}>{actor.label}</span>
                              <div className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: actor.color + '18', color: actor.color }}>
                                {actorSteps.length} étape{actorSteps.length > 1 ? 's' : ''}
                              </div>
                            </div>

                            {/* Steps in this lane */}
                            <div className="flex items-center gap-0 flex-1">
                              {actorSteps.map((step, i) => (
                                <div key={step.id} className="flex items-center">
                                  <Node
                                    step={step}
                                    index={STEPS.indexOf(step)}
                                    isActive={activeStep === step.id}
                                    isPlaying={playingStep === STEPS.indexOf(step)}
                                    onClick={() => handleStepClick(step.id)}
                                  />
                                  {i < actorSteps.length - 1 && (
                                    <Arrow color={actor.color} active={playingStep >= STEPS.indexOf(step)} />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Alertes automatiques ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="rounded-2xl border border-[#CC0000]/20 overflow-hidden"
          style={{ background: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(12px)' }}>

          <div className="px-6 py-4 border-b border-[#CC0000]/15 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(204,0,0,0.2)' }}>
              <AlertTriangle className="w-4 h-4 text-[#CC0000]" />
            </div>
            <span className="text-white font-bold text-sm" style={{ fontFamily: 'var(--font-syne)' }}>Alertes automatiques du système</span>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Clock,          color: '#CC0000', title: 'Session non clôturée',  desc: '+12h sans fermeture. Notification auto technicien + admin.' },
              { icon: AlertTriangle,  color: '#F59E0B', title: 'Dépassement 48h',       desc: 'Mission expirée. QR Code bloqué + alerte urgente.' },
              { icon: XCircle,        color: '#8B5CF6', title: 'Session en litige',     desc: 'Désaccord heures. Escalade automatique vers l\'administrateur.' },
            ].map((alert, i) => {
              const Icon = alert.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.08 }}
                  className="flex gap-3 p-4 rounded-xl border"
                  style={{ background: alert.color + '0D', borderColor: alert.color + '30' }}>
                  <motion.div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: alert.color + '20' }}
                    animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}>
                    <Icon className="w-4 h-4" style={{ color: alert.color }} />
                  </motion.div>
                  <div>
                    <div className="text-white text-sm font-semibold mb-0.5">{alert.title}</div>
                    <div className="text-[#9CA3AF] text-xs leading-relaxed">{alert.desc}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Footer ── */}
        <div className="text-center text-xs text-[#4B5563] pb-8 flex items-center justify-center gap-3">
          <div className="h-px flex-1 max-w-20" style={{ background: 'linear-gradient(90deg, transparent, #2A2A2A)' }} />
          © 2026 Lear Corporation — Document technique confidentiel
          <div className="h-px flex-1 max-w-20" style={{ background: 'linear-gradient(90deg, #2A2A2A, transparent)' }} />
        </div>
      </div>
    </div>
  );
}
