import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LocalizationProvider } from './state/LocalizationContext';
import { ThemeProvider } from './state/ThemeContext';
import { UserProvider } from './state/UserContext';
import { ServiceProvider } from './services/ServiceContainer';

export const AppProviders: React.FC<React.PropsWithChildren> = ({ children }) => (
  <ServiceProvider>
    <LocalizationProvider>
      <ThemeProvider>
        <SafeAreaProvider>
          <UserProvider>{children}</UserProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </LocalizationProvider>
  </ServiceProvider>
);
