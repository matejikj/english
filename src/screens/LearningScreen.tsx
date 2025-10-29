import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../state/ThemeContext';
import { useLocalization } from '../state/LocalizationContext';

export const LearningScreen: React.FC = () => {
  const colors = useThemeColors();
  const { t } = useLocalization();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>{t('learning_title')}</Text>
      <Section title={t('learning_section_recommended')} colors={colors}>
        <PlaceholderLine text="Letní cestování – fráze na letišti" colors={colors} />
        <PlaceholderLine text="Podmínkové věty – reálné situace" colors={colors} />
      </Section>
      <Section title={t('learning_section_listening')} colors={colors}>
        <PlaceholderLine text="Podcast: Daily conversations" colors={colors} />
      </Section>
      <Section title={t('learning_section_pronunciation')} colors={colors}>
        <PlaceholderLine text="Shadowing: Small talk in a café" colors={colors} />
      </Section>
    </ScrollView>
  );
};

const Section: React.FC<
  React.PropsWithChildren<{ title: string; colors: ReturnType<typeof useThemeColors> }>
> = ({ title, colors, children }) => (
  <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
    <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

const PlaceholderLine: React.FC<{ text: string; colors: ReturnType<typeof useThemeColors> }> = ({
  text,
  colors,
}) => (
  <View style={[styles.placeholderItem, { borderColor: colors.border }]}>
    <Text style={{ color: colors.text }}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  section: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionBody: {
    gap: 12,
  },
  placeholderItem: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
