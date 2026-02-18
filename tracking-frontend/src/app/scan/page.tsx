'use client';

import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { mockInterimaires, Interimaire } from '@/lib/data';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle2, XCircle, QrCode, Scan, Volume2 } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import toast from 'react-hot-toast';

export default function ScanPage() {
  const [scanning, setScanning] = useState(false);
  const [scannedUser, setScannedUser] = useState<Interimaire | null>(null);
  const [scanAnimation, setScanAnimation] = useState(false);
  const [processed, setProcessed] = useState<'validated' | 'refused' | null>(null);

  // Simulate a QR scan by randomly picking an interimaire
  const simulateScan = () => {
    setScanAnimation(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * mockInterimaires.length);
      const found = mockInterimaires[randomIndex];
      setScannedUser(found);
      setScanAnimation(false);
      setProcessed(null);
    }, 1500);
  };

  const handleValidate = () => {
    setProcessed('validated');
    toast.success(`Entrée validée – ${scannedUser?.prenom} ${scannedUser?.nom}`, { icon: '✅' });
    setTimeout(() => { setScannedUser(null); setProcessed(null); }, 2000);
  };

  const handleRefuse = () => {
    setProcessed('refused');
    toast.error(`Accès refusé – ${scannedUser?.prenom} ${scannedUser?.nom}`, { icon: '🚫' });
    setTimeout(() => { setScannedUser(null); setProcessed(null); }, 2000);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Interface Scan QR</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Contrôle d'accès – Vérification identité</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Camera/Scanner area */}
          <div className="bg-[#0F172A] rounded-2xl overflow-hidden relative" style={{ minHeight: '480px' }}>
            {/* Camera feed simulation */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Gradient background simulating camera */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]">
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'linear-gradient(#2563EB 1px, transparent 1px), linear-gradient(90deg, #2563EB 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }} />
              </div>

              {/* Scan frame */}
              <div className="relative z-10">
                <div className="relative w-56 h-56">
                  {/* Corner borders */}
                  {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
                    <div
                      key={i}
                      className={`absolute w-8 h-8 border-blue-400 ${pos}`}
                      style={{
                        borderTopWidth: i < 2 ? '3px' : '0',
                        borderBottomWidth: i >= 2 ? '3px' : '0',
                        borderLeftWidth: i % 2 === 0 ? '3px' : '0',
                        borderRightWidth: i % 2 === 1 ? '3px' : '0',
                      }}
                    />
                  ))}

                  {/* Scan line animation */}
                  <AnimatePresence>
                    {scanAnimation && (
                      <motion.div
                        initial={{ y: 0 }}
                        animate={{ y: 224 }}
                        transition={{ duration: 1.5, ease: 'linear' }}
                        className="absolute left-0 right-0 h-0.5 bg-blue-400 shadow-lg"
                        style={{ boxShadow: '0 0 10px #2563EB, 0 0 20px #2563EB' }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {scanAnimation ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        <Scan className="w-10 h-10 text-blue-400" />
                      </motion.div>
                    ) : (
                      <QrCode className="w-12 h-12 text-gray-600" />
                    )}
                  </div>
                </div>

                {/* Status text */}
                <p className="text-center mt-4 text-sm text-gray-400">
                  {scanAnimation ? (
                    <span className="text-blue-400 animate-pulse">Scan en cours...</span>
                  ) : scannedUser ? (
                    <span className="text-green-400">QR Code détecté !</span>
                  ) : (
                    'Positionnez le QR Code dans le cadre'
                  )}
                </p>
              </div>
            </div>

            {/* Scan button */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20">
              <motion.button
                onClick={simulateScan}
                disabled={scanAnimation}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white text-sm disabled:opacity-50 transition-all"
                style={{ background: scanAnimation ? '#334155' : 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
              >
                <Camera className="w-5 h-5" />
                {scanAnimation ? 'Scan...' : 'Simuler Scan QR'}
              </motion.button>
            </div>
          </div>

          {/* Result panel */}
          <div className="space-y-4">
            <AnimatePresence>
              {scannedUser ? (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className={`bg-white dark:bg-[#1E293B] rounded-2xl border-2 p-6 ${
                    processed === 'validated' ? 'border-green-500' :
                    processed === 'refused' ? 'border-red-500' :
                    'border-blue-300 dark:border-blue-700'
                  } transition-colors`}
                >
                  {/* Result overlay */}
                  {processed && (
                    <div className={`flex items-center justify-center gap-3 mb-5 p-4 rounded-xl ${
                      processed === 'validated' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                    }`}>
                      {processed === 'validated' ? (
                        <><CheckCircle2 className="w-6 h-6 text-green-600" /><span className="font-semibold text-green-700">Entrée validée !</span></>
                      ) : (
                        <><XCircle className="w-6 h-6 text-red-600" /><span className="font-semibold text-red-700">Accès refusé</span></>
                      )}
                    </div>
                  )}

                  {/* Profile */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                      {scannedUser.prenom[0]}{scannedUser.nom[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{scannedUser.prenom} {scannedUser.nom}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{scannedUser.fonction}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">{scannedUser.cin}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { label: 'Agence', value: scannedUser.agence },
                      { label: 'Site autorisé', value: scannedUser.site },
                      { label: 'Mission jusqu\'au', value: scannedUser.dateFin },
                      { label: 'QR Status', value: scannedUser.qrStatus },
                    ].map(item => (
                      <div key={item.label} className="p-3 rounded-xl bg-gray-50 dark:bg-[#0F172A]">
                        <div className="text-xs text-gray-400">{item.label}</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  {!processed && (
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleValidate}
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-base transition-colors"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Valider l'entrée
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRefuse}
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-base transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                        Refuser
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-[#334155] p-16 text-center"
                >
                  <QrCode className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">En attente de scan</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Scannez un QR Code pour afficher la fiche</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4">
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">Procédure de contrôle</h4>
              <ol className="space-y-1 text-xs text-blue-700 dark:text-blue-400">
                <li>1. Demandez le QR Code à l'intérimaire</li>
                <li>2. Positionnez dans le cadre de scan</li>
                <li>3. Vérifiez la photo et l'identité</li>
                <li>4. Validez ou refusez l'accès</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
