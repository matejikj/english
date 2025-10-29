import React from 'react';
import { StatusBar } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { AppProviders } from './src/AppProviders';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useTheme } from './src/state/ThemeContext';

enableScreens();

function App(): React.JSX.Element {
  return (
    <AppProviders>
      <AppShell />
    </AppProviders>
  );
}

const AppShell: React.FC = () => {
  const { resolvedMode } = useTheme();

  return (
    <>
      <StatusBar barStyle={resolvedMode === 'dark' ? 'light-content' : 'dark-content'} />
      <RootNavigator />
    </>
  );
};

export default App;
