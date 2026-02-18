'use client';

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { mockInterimaires, Interimaire } from '@/lib/data';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle2, XCircle, QrCode, Scan } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import toast from 'react-hot-toast';
import { useI18n } from '@/lib/i18n';

export default function ScanPage() {
  const { t } = useI18n();
  const [scanning, setScanning] = useState(false);
  const [scannedUser, setScannedUser] = useState<Interimaire | null>(null);
  const [scanAnimation, setScanAnimation] = useState(false);
  const [processed, setProcessed] = useState<'validated' | 'refused' | null>(null);

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
    toast.success(`${t('scan_toast_validated')} ${scannedUser?.prenom} ${scannedUser?.nom}`, { icon: '✅' });
    setTimeout(() => { setScannedUser(null); setProcessed(null); }, 2000);
  };

  const handleRefuse = () => {
    setProcessed('refused');
    toast.error(`${t('scan_toast_refused')} ${scannedUser?.prenom} ${scannedUser?.nom}`, { icon: '🚫' });
    setTimeout(() => { setScannedUser(null); setProcessed(null); }, 2000);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('scan_title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('scan_subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Camera/Scanner area */}
          <div className="bg-[#111111] rounded-2xl overflow-hidden relative" style={{ minHeight: '480px' }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-[#111111] via-[#1C1C1C] to-[#111111]">
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'linear-gradient(#CC0000 1px, transparent 1px), linear-gradient(90deg, #CC0000 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }} />
              </div>

              <div className="relative z-10">
                <div className="relative w-56 h-56">
                  {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
                    <div
                      key={i}
                      className={`absolute w-8 h-8 border-[#CC0000] ${pos}`}
                      style={{
                        borderTopWidth: i < 2 ? '3px' : '0',
                        borderBottomWidth: i >= 2 ? '3px' : '0',
                        borderLeftWidth: i % 2 === 0 ? '3px' : '0',
                        borderRightWidth: i % 2 === 1 ? '3px' : '0',
                      }}
                    />
                  ))}

                  <AnimatePresence>
                    {scanAnimation && (
                      <motion.div
                        initial={{ y: 0 }}
                        animate={{ y: 224 }}
                        transition={{ duration: 1.5, ease: 'linear' }}
                        className="absolute left-0 right-0 h-0.5 bg-[#CC0000]"
                        style={{ boxShadow: '0 0 10px #CC0000, 0 0 20px #CC0000' }}
                      />
                    )}
                  </AnimatePresence>

                  <div className="absolute inset-0 flex items-center justify-center">
                    {scanAnimation ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        <Scan className="w-10 h-10 text-[#CC0000]" />
                      </motion.div>
                    ) : (
                      <QrCode className="w-12 h-12 text-gray-600" />
                    )}
                  </div>
                </div>

                <p className="text-center mt-4 text-sm text-gray-400">
                  {scanAnimation ? (
                    <span className="text-[#CC0000] animate-pulse">{t('scan_in_progress')}</span>
                  ) : scannedUser ? (
                    <span className="text-green-400">{t('scan_detected')}</span>
                  ) : (
                    t('scan_waiting')
                  )}
                </p>
              </div>
            </div>

            <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20">
              <motion.button
                onClick={simulateScan}
                disabled={scanAnimation}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white text-sm disabled:opacity-50 transition-all"
                style={{ background: scanAnimation ? '#2A2A2A' : 'linear-gradient(135deg, #CC0000, #7A0000)' }}
              >
                <Camera className="w-5 h-5" />
                {scanAnimation ? t('scan_scanning') : t('scan_simulate')}
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
                  className={`bg-white dark:bg-[#1C1C1C] rounded-2xl border-2 p-6 ${
                    processed === 'validated' ? 'border-green-500' :
                    processed === 'refused' ? 'border-[#CC0000]' :
                    'border-[#CC0000]/40'
                  } transition-colors`}
                >
                  {processed && (
                    <div className={`flex items-center justify-center gap-3 mb-5 p-4 rounded-xl ${
                      processed === 'validated' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-[#FFF0F0] dark:bg-[#2A0000]'
                    }`}>
                      {processed === 'validated' ? (
                        <><CheckCircle2 className="w-6 h-6 text-green-600" /><span className="font-semibold text-green-700">{t('scan_validated')}</span></>
                      ) : (
                        <><XCircle className="w-6 h-6 text-[#CC0000]" /><span className="font-semibold text-[#CC0000]">{t('scan_refused')}</span></>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#CC0000] to-[#7A0000] flex items-center justify-center text-white font-bold text-xl">
                      {scannedUser.prenom[0]}{scannedUser.nom[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{scannedUser.prenom} {scannedUser.nom}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{scannedUser.fonction}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">{scannedUser.cin}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { label: t('scan_field_agence'), value: scannedUser.agence },
                      { label: t('scan_field_site'),   value: scannedUser.site },
                      { label: t('scan_field_mission'),value: scannedUser.dateFin },
                      { label: t('scan_field_qr'),     value: scannedUser.qrStatus },
                    ].map(item => (
                      <div key={item.label} className="p-3 rounded-xl bg-gray-50 dark:bg-[#111111]">
                        <div className="text-xs text-gray-400">{item.label}</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {!processed && (
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleValidate}
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-base transition-colors"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        {t('scan_validate')}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRefuse}
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-[#CC0000] to-[#AA0000] hover:from-[#AA0000] hover:to-[#880000] text-white font-bold text-base transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                        {t('scan_refuse')}
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-[#1C1C1C] rounded-2xl border border-gray-200 dark:border-[#2A2A2A] p-16 text-center"
                >
                  <QrCode className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('scan_waiting_title')}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('scan_waiting_sub')}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Instructions */}
            <div className="bg-[#FFF0F0] dark:bg-[#2A0000] rounded-xl border border-[#CC0000]/30 p-4">
              <h4 className="text-sm font-semibold text-[#CC0000] mb-2">{t('scan_procedure')}</h4>
              <ol className="space-y-1 text-xs text-[#AA0000] dark:text-[#FF6666]">
                <li>{t('scan_step1')}</li>
                <li>{t('scan_step2')}</li>
                <li>{t('scan_step3')}</li>
                <li>{t('scan_step4')}</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
