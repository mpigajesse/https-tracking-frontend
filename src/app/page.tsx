'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, getDashboardRoute } from '@/lib/auth-context';

function RootRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace(getDashboardRoute(user.role));
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center h-screen bg-[#111111]">
        <div className="flex flex-col items-center gap-5">
          {/* Lear "L" logo spinner */}
          <div className="relative w-16 h-16">
            {/* Outer spinning ring */}
            <svg className="absolute inset-0 animate-spin" style={{ animationDuration: '1.2s' }} viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="28" stroke="#CC0000" strokeWidth="3" strokeDasharray="88 44" strokeLinecap="round"/>
            </svg>
            {/* Inner red circle with L */}
            <div className="absolute inset-2 rounded-full flex items-center justify-center" style={{ background: '#CC0000' }}>
              <span className="text-white font-black text-2xl" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1 }}>L</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-white font-bold text-sm tracking-widest uppercase" style={{ fontFamily: 'Syne, sans-serif' }}>LEAR</span>
            <span className="text-[#CC0000] text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'Syne, sans-serif' }}>Corporation</span>
          </div>
          {/* Animated dots */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#CC0000] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
  );
}

export default function Home() {
  return <RootRedirect />;
}
