import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import type { ThemeMode } from '../models';

type ThemeContextValue = {
  mode: ThemeMode;
  resolvedMode: Exclude<ThemeMode, 'system'>;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
};

export type ThemeColors = typeof lightPalette;

const lightPalette = {
  background: '#F5F7FB',
  surface: '#FFFFFF',
  primary: '#1F509A',
  primaryContrast: '#FFFFFF',
  secondary: '#6C8CD5',
  text: '#1C1C1E',
  textSecondary: '#6B7280',
  border: '#E0E6F0',
  success: '#0F9D58',
  warning: '#F4B400',
  danger: '#DB4437',
};

const darkPalette: ThemeColors = {
  background: '#0B1220',
  surface: '#141B2D',
  primary: '#4A90E2',
  primaryContrast: '#0B1220',
  secondary: '#8BAAF2',
  text: '#F9FAFB',
  textSecondary: '#CBD5F5',
  border: '#1F2A44',
  success: '#34A853',
  warning: '#F4B400',
  danger: '#FF6B6B',
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('light');

  const resolveMode = useMemo<ThemeMode>(() => {
    if (mode === 'system') {
      return systemScheme === 'dark' ? 'dark' : 'light';
    }
    return mode;
  }, [mode, systemScheme]);

  const value = useMemo<ThemeContextValue>(() => {
    const palette = resolveMode === 'dark' ? darkPalette : lightPalette;
    return {
      mode,
      resolvedMode: resolveMode === 'dark' ? 'dark' : 'light',
      colors: palette,
      setMode,
    };
  }, [mode, resolveMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
};

export const useThemeColors = () => useTheme().colors;

export const useSetThemeMode = () => {
  const { setMode } = useTheme();
  return useCallback((mode: ThemeMode) => setMode(mode), [setMode]);
};
