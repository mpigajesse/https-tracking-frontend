'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#111111]">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-16 h-16">
            <svg className="absolute inset-0 animate-spin" style={{ animationDuration: '1.2s' }} viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="28" stroke="#CC0000" strokeWidth="3" strokeDasharray="88 44" strokeLinecap="round"/>
            </svg>
            <div className="absolute inset-2 rounded-full flex items-center justify-center" style={{ background: '#CC0000' }}>
              <span className="text-white font-black text-2xl" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1 }}>L</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-white font-bold text-sm tracking-widest uppercase" style={{ fontFamily: 'Syne, sans-serif' }}>LEAR</span>
            <span className="text-[#CC0000] text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'Syne, sans-serif' }}>Corporation</span>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#CC0000] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#0F172A]">
        {/* Sidebar — hidden on mobile unless mobileOpen */}
        <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-30 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Topbar onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
