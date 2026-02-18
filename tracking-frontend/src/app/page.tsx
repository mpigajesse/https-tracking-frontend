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
    <div className="flex items-center justify-center h-screen bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center animate-pulse" style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}>
          <span className="text-white font-bold text-lg">P</span>
        </div>
        <div className="text-gray-500 text-sm">Chargement...</div>
      </div>
    </div>
  );
}

export default function Home() {
  return <RootRedirect />;
}
