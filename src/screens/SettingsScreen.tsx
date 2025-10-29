import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalization } from '../state/LocalizationContext';
import { useTheme, useThemeColors, useSetThemeMode } from '../state/ThemeContext';
import { useUser } from '../state/UserContext';

export const SettingsScreen: React.FC = () => {
  const colors = useThemeColors();
  const { t, language, setLanguage } = useLocalization();
  const { resolvedMode } = useTheme();
  const setThemeMode = useSetThemeMode();
  const { setLanguagePreference, setThemePreference, session } = useUser();

  const handleThemeChange = useCallback(
    async (mode: 'light' | 'dark') => {
      setThemeMode(mode);
      if (session) {
        await setThemePreference(mode);
      }
    },
    [session, setThemeMode, setThemePreference],
  );

  const handleLanguageChange = useCallback(
    async (code: 'cs' | 'en') => {
      setLanguage(code);
      if (session) {
        await setLanguagePreference(code);
      }
    },
    [session, setLanguage, setLanguagePreference],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t('settings_title')}</Text>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('settings_theme')}</Text>
        <View style={styles.row}>
          <ToggleButton
            label={t('settings_theme_light')}
            active={resolvedMode === 'light'}
            onPress={() => handleThemeChange('light')}
            colors={colors}
          />
          <ToggleButton
            label={t('settings_theme_dark')}
            active={resolvedMode === 'dark'}
            onPress={() => handleThemeChange('dark')}
            colors={colors}
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('settings_language')}</Text>
        <View style={styles.row}>
          <ToggleButton
            label={t('settings_language_cs')}
            active={language === 'cs'}
            onPress={() => handleLanguageChange('cs')}
            colors={colors}
          />
          <ToggleButton
            label={t('settings_language_en')}
            active={language === 'en'}
            onPress={() => handleLanguageChange('en')}
            colors={colors}
          />
        </View>
      </View>
    </View>
  );
};

const ToggleButton: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useThemeColors>;
}> = ({ label, active, onPress, colors }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.toggleButton,
      {
        backgroundColor: active ? colors.primary : colors.surface,
        borderColor: colors.border,
        opacity: pressed ? 0.85 : 1,
      },
    ]}>
    <Text
      style={[
        styles.toggleLabel,
        { color: active ? colors.primaryContrast : colors.text },
      ]}>
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
  },
  section: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleButton: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
