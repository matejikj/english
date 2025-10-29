import React, { useMemo } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../state/ThemeContext';
import { useLocalization } from '../state/LocalizationContext';
import type { RootStackParamList } from './types';
import { MenuScreen } from '../screens/MenuScreen';
import { LearningScreen } from '../screens/LearningScreen';
import { ExercisesScreen } from '../screens/ExercisesScreen';
import { TestScreen } from '../screens/TestScreen';
import { ConversationScreen } from '../screens/ConversationScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { colors, resolvedMode } = useTheme();
  const { t } = useLocalization();

  const navigationTheme = useMemo(() => {
    const base = resolvedMode === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        primary: colors.primary,
        border: colors.border,
        notification: colors.secondary,
      },
    };
  }, [colors, resolvedMode]);

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '600' },
        }}>
        <Stack.Screen name="Menu" component={MenuScreen} options={{ title: t('menu_title') }} />
        <Stack.Screen
          name="Learning"
          component={LearningScreen}
          options={{ title: t('learning_title') }}
        />
        <Stack.Screen
          name="Exercises"
          component={ExercisesScreen}
          options={{ title: t('exercises_title') }}
        />
        <Stack.Screen name="Test" component={TestScreen} options={{ title: t('tests_title') }} />
        <Stack.Screen
          name="Conversation"
          component={ConversationScreen}
          options={{ title: t('conversation_title') }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: t('profile_title') }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: t('settings_title') }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
