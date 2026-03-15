'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { AppMode } from '@/lib/types';

interface ModeContextType {
  mode: AppMode;
  toggleMode: () => void;
  isQuick: boolean;
  isDeep: boolean;
}

const ModeContext = createContext<ModeContextType | null>(null);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AppMode>('quick');

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('lifeos-mode');
    if (stored === 'quick' || stored === 'deep') {
      setMode(stored);
    }
  }, []);

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'quick' ? 'deep' : 'quick';
      localStorage.setItem('lifeos-mode', next);
      return next;
    });
  }, []);

  return (
    <ModeContext.Provider
      value={{
        mode,
        toggleMode,
        isQuick: mode === 'quick',
        isDeep: mode === 'deep',
      }}
    >
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within ModeProvider');
  }
  return context;
}
