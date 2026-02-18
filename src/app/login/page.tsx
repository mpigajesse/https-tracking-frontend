'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, Building2, Users, Shield } from 'lucide-react';
import { useAuth, getDashboardRoute } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

/* ── Animated background ─────────────────────────────────────────── */
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
    <div className="absolute inset-0 overflow-hidden" style={{ background: '#0A0A0A' }}>

      {/* Deep base layer */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 100%, #1a0000 0%, #0A0A0A 70%)'
      }} />

      {/* Mouse-follow red glow */}
      <motion.div
        className="absolute w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(204,0,0,0.18) 0%, transparent 65%)',
          left: springX.get() * 100 + '%',
          top: springY.get() * 100 + '%',
          translateX: '-50%',
          translateY: '-50%',
          x: '-50%',
          y: '-50%',
        }}
        animate={{
          left: [`${springX.get() * 100}%`],
          top: [`${springY.get() * 100}%`],
        }}
      />

      {/* Static big glows */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 600, height: 600,
          top: '10%', left: '20%',
          background: 'radial-gradient(circle, rgba(204,0,0,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 400, height: 400,
          bottom: '5%', right: '10%',
          background: 'radial-gradient(circle, rgba(204,0,0,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Optical flares */}
      {[
        { top: '18%', left: '62%', size: 120, delay: 0 },
        { top: '55%', left: '30%', size: 80, delay: 1.5 },
        { top: '75%', left: '70%', size: 60, delay: 3 },
        { top: '10%', left: '15%', size: 50, delay: 0.8 },
      ].map((f, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            top: f.top, left: f.left,
            width: f.size, height: f.size,
            background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(204,0,0,0.04) 40%, transparent 70%)',
            filter: 'blur(2px)',
          }}
          animate={{ opacity: [0, 0.8, 0], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: f.delay }}
        />
      ))}

      {/* Lens flare streaks */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          top: '22%', left: '55%',
          width: 2, height: 180,
          background: 'linear-gradient(to bottom, transparent, rgba(204,0,0,0.25), transparent)',
          transformOrigin: 'center',
          filter: 'blur(1px)',
        }}
        animate={{ opacity: [0, 0.6, 0], rotate: [-5, 5, -5], scaleY: [0.8, 1.2, 0.8] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute pointer-events-none"
        style={{
          top: '22%', left: '58%',
          width: 160, height: 2,
          background: 'linear-gradient(to right, transparent, rgba(204,0,0,0.2), transparent)',
          filter: 'blur(1px)',
        }}
        animate={{ opacity: [0, 0.5, 0], scaleX: [0.8, 1.3, 0.8] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
      />

      {/* Hexagon grid overlay — very subtle */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='52' viewBox='0 0 60 52'%3E%3Cpolygon points='30,2 58,16 58,46 30,50 2,46 2,16' fill='none' stroke='%23CC0000' stroke-width='1'/%3E%3C/svg%3E")`,
        backgroundSize: '60px 52px',
      }} />

      {/* Animated concentric rings */}
      {[180, 320, 460, 580, 700, 820].map((size, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size, height: size,
            border: '1px solid rgba(204,0,0,0.08)',
            top: '50%', left: '50%',
            marginLeft: -size / 2, marginTop: -size / 2,
          }}
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.98, 1.02, 0.98] }}
          transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
        />
      ))}

       {/* Floating particles */}
       {Array.from({ length: 24 }).map((_, i) => {
         const isRed = i % 4 === 0;
         const isMed = i % 3 === 1;
         const size = isRed ? 7 : isMed ? 5 : 3;
         return (
           <motion.div
             key={`p${i}`}
             className="absolute rounded-full pointer-events-none"
             style={{
               width: size,
               height: size,
               background: isRed
                 ? 'rgba(204,0,0,0.85)'
                 : isMed
                 ? 'rgba(255,255,255,0.35)'
                 : 'rgba(255,255,255,0.15)',
               boxShadow: isRed
                 ? '0 0 8px 3px rgba(204,0,0,0.5)'
                 : isMed
                 ? '0 0 6px 2px rgba(255,255,255,0.2)'
                 : 'none',
               left: `${(i * 37 + 10) % 92}%`,
               top: `${(i * 53 + 5) % 92}%`,
             }}
             animate={{
               y: [-20, 20, -20],
               x: [-10, 10, -10],
               opacity: isRed ? [0.5, 1, 0.5] : [0.2, 0.7, 0.2],
               scale: isRed ? [0.8, 1.4, 0.8] : [1, 1.2, 1],
             }}
             transition={{
               duration: 4 + (i % 5),
               repeat: Infinity,
               ease: 'easeInOut',
               delay: (i * 0.35) % 5,
             }}
           />
         );
       })}

      {/* Scanline subtle overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
      }} />
    </div>
  );
}

/* ── Login form ──────────────────────────────────────────────────── */
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const { login } = useAuth();
  const { lang, setLang, t } = useI18n();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      toast.success(lang === 'fr' ? 'Connexion réussie !' : 'Signed in successfully!');
      const stored = localStorage.getItem('pointage_user');
      if (stored) {
        const user = JSON.parse(stored);
        router.push(getDashboardRoute(user.role));
      }
    } else {
      setAttempts(a => a + 1);
      setError(result.error || 'Erreur de connexion');
    }
    setLoading(false);
  };

  const demoAccounts = [
    { role: lang === 'fr' ? 'Admin' : 'Admin', email: 'admin@pointage.ma', password: 'admin123', color: 'bg-[#CC0000]' },
    { role: lang === 'fr' ? 'Technicien' : 'Technician', email: 'tech@pointage.ma', password: 'tech123', color: 'bg-[#555555]' },
    { role: lang === 'fr' ? 'Réceptionniste' : 'Receptionist', email: 'recep@pointage.ma', password: 'recep123', color: 'bg-[#888888]' },
    { role: lang === 'fr' ? 'Intérimaire' : 'Worker', email: 'interim@pointage.ma', password: 'interim123', color: 'bg-[#6B7280]' },
  ];

  return (
    <div className="min-h-screen flex font-geist">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <AnimatedBackground />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-xl">
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Lear_Corporation_logo.svg/960px-Lear_Corporation_logo.svg.png"
                alt="Lear Corporation"
                width={40} height={40}
                className="object-contain"
                unoptimized
              />
            </div>
            <div>
              <div className="text-white font-bold text-xl tracking-wide font-syne">Lear Corporation</div>
              <div className="text-[#CC0000] text-xs uppercase tracking-widest">
                {lang === 'fr' ? 'Système de Pointage' : 'Time Tracking System'}
              </div>
            </div>
          </motion.div>

          {/* Headline */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.9 }}
            >
              <h1 className="text-5xl font-bold text-white leading-tight mb-6 font-syne">
                {lang === 'fr' ? (
                  <>Digitalisez votre<br /><span className="text-[#CC0000]">gestion RH</span><br />intérimaires</>
                ) : (
                  <>Digitize your<br /><span className="text-[#CC0000]">workforce</span><br />management</>
                )}
              </h1>
              <p className="text-gray-400 text-base mb-10 leading-relaxed max-w-sm">
                {t('login_desc')}
              </p>
            </motion.div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: t('login_sites'), value: '5', icon: Building2 },
                  { label: t('login_interimaires'), value: '169', icon: Users },
                  { label: t('login_sessions'), value: '340+', icon: Shield },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 30, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.15, type: 'spring', stiffness: 200, damping: 18 }}
                    whileHover={{
                      scale: 1.07,
                      boxShadow: '0 0 24px 4px rgba(204,0,0,0.25)',
                      borderColor: 'rgba(204,0,0,0.5)',
                      background: 'rgba(204,0,0,0.1)',
                    }}
                    whileTap={{ scale: 0.97 }}
                    className="relative bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm cursor-default overflow-hidden"
                    style={{ transition: 'border-color 0.3s, background 0.3s' }}
                  >
                    {/* Animated top-left corner glow */}
                    <motion.div
                      className="absolute -top-4 -left-4 w-12 h-12 rounded-full pointer-events-none"
                      style={{ background: 'radial-gradient(circle, rgba(204,0,0,0.3) 0%, transparent 70%)' }}
                      animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.3, 0.8] }}
                      transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
                    />
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                    >
                      <stat.icon className="w-5 h-5 text-[#CC0000] mb-2" />
                    </motion.div>
                      <motion.div
                        className="text-2xl font-bold text-white font-grotesk tabular-nums"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + i * 0.15, type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        {stat.value}
                      </motion.div>
                    <div className="text-gray-400 text-xs mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
          </div>

          <motion.div
            className="text-gray-600 text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {t('login_confidential')}
          </motion.div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F5F5F5] dark:bg-[#111111] relative overflow-hidden">

        {/* Subtle right-panel glow */}
        <div className="absolute inset-0 pointer-events-none hidden dark:block"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 80% 20%, rgba(204,0,0,0.05) 0%, transparent 70%)' }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md">
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Lear_Corporation_logo.svg/960px-Lear_Corporation_logo.svg.png"
                alt="Lear Corporation"
                width={32} height={32}
                className="object-contain"
                unoptimized
              />
            </div>
            <div>
              <div className="text-gray-900 dark:text-white font-bold text-lg font-syne">Lear Corporation</div>
              <div className="text-[#CC0000] text-xs uppercase tracking-wider">
                {lang === 'fr' ? 'Pointage Intérimaires' : 'Time Tracking'}
              </div>
            </div>
          </div>

          {/* Language switcher */}
          <div className="flex justify-end mb-4">
            <motion.button
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex items-center px-1 py-1 rounded-full border border-[#E5E5E5] dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] shadow-sm"
            >
              <motion.span
                layout
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={cn(
                  'absolute top-1 h-6 w-8 rounded-full shadow-sm',
                  lang === 'fr' ? 'left-1' : 'left-[calc(100%-36px)]'
                )}
                style={{ background: '#CC0000' }}
              />
              <span className={cn('relative z-10 px-2 py-0.5 text-xs font-bold w-8 text-center transition-colors', lang === 'fr' ? 'text-white' : 'text-gray-500')}>FR</span>
              <span className={cn('relative z-10 px-2 py-0.5 text-xs font-bold w-8 text-center transition-colors', lang === 'en' ? 'text-white' : 'text-gray-500')}>EN</span>
            </motion.button>
          </div>

          <div className="bg-white dark:bg-[#1C1C1C] rounded-2xl shadow-xl border border-[#E5E5E5] dark:border-[#2A2A2A] p-8">
            <div className="h-1 w-16 rounded-full mb-6" style={{ background: '#CC0000' }} />

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-syne">{t('login_title')}</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{t('login_subtitle')}</p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 p-3 bg-[#FFF0F0] dark:bg-[#2A0000] border border-[#CC0000]/30 rounded-lg mb-5 text-sm text-[#CC0000] dark:text-[#FF6666]"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                  {attempts >= 3 && <span className="ml-auto text-xs">({attempts} {lang === 'fr' ? 'tentatives' : 'attempts'})</span>}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('login_email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E5E5] dark:border-[#2A2A2A] bg-[#F5F5F5] dark:bg-[#111111] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm"
                  style={{ '--tw-ring-color': '#CC0000' } as React.CSSProperties}
                  placeholder="email@learcorporation.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('login_password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-[#E5E5E5] dark:border-[#2A2A2A] bg-[#F5F5F5] dark:bg-[#111111] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm"
                    style={{ '--tw-ring-color': '#CC0000' } as React.CSSProperties}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#CC0000] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-[#E5E5E5] accent-[#CC0000]" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('login_remember')}</span>
                </label>
                <a href="/forgot-password" className="text-sm text-[#CC0000] hover:text-[#AA0000] font-medium transition-colors">
                  {t('login_forgot')}
                </a>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3 px-4 rounded-xl font-semibold text-white text-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ background: loading ? '#AA0000' : 'linear-gradient(135deg, #CC0000, #7A0000)' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    {t('login_loading')}
                  </span>
                ) : t('login_btn')}
              </motion.button>
            </form>
          </div>

          {/* Demo accounts */}
          <div className="mt-6">
            <p className="text-center text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">{t('login_demo')}</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map(acc => (
                <motion.button
                  key={acc.role}
                  onClick={() => { setEmail(acc.email); setPassword(acc.password); }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 p-3 rounded-xl border border-[#E5E5E5] dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] hover:border-[#CC0000]/40 dark:hover:border-[#CC0000]/40 transition-all text-left group"
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${acc.color}`} />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-[#CC0000] transition-colors">{acc.role}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <LoginForm />;
}
