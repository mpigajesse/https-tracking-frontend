'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, mockUsers, MOCK_CREDENTIALS } from '@/lib/data';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('pointage_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const creds = MOCK_CREDENTIALS[email];
    if (!creds) return { success: false, error: 'Email ou mot de passe incorrect' };
    if (creds.password !== password) return { success: false, error: 'Email ou mot de passe incorrect' };
    
    const foundUser = mockUsers.find(u => u.id === creds.userId);
    if (!foundUser) return { success: false, error: 'Utilisateur introuvable' };
    if (foundUser.statut === 'inactif') return { success: false, error: 'Compte désactivé. Contactez l\'administrateur.' };
    
    setUser(foundUser);
    localStorage.setItem('pointage_user', JSON.stringify(foundUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pointage_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function getDashboardRoute(role: UserRole): string {
  switch (role) {
    case 'admin': return '/dashboard';
    case 'technicien': return '/interimaires';
    case 'receptionniste': return '/scan';
    case 'interimaire': return '/mon-dashboard';
    default: return '/dashboard';
  }
}
