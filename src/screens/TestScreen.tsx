import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../state/ThemeContext';
import { useLocalization } from '../state/LocalizationContext';

export const TestScreen: React.FC = () => {
  const colors = useThemeColors();
  const { t } = useLocalization();

  const plans = [
    { name: 'Mini test', duration: '10 min', focus: 'smíšené' },
    { name: 'Komplexní test', duration: '25 min', focus: 'gramatika + poslech' },
    { name: 'Speaking challenge', duration: '15 min', focus: 'výslovnost + reakce' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>{t('tests_title')}</Text>
      {plans.map((plan) => (
        <View
          key={plan.name}
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{plan.name}</Text>
          <Text style={[styles.detail, { color: colors.textSecondary }]}>
            {t('test_length')}: {plan.duration}
          </Text>
          <Text style={[styles.detail, { color: colors.textSecondary }]}>
            {t('test_focus')}: {plan.focus}
          </Text>
          <View style={[styles.cta, { backgroundColor: colors.primary }]}>
            <Text style={[styles.ctaText, { color: colors.primaryContrast }]}>
              {t('test_start')}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

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
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  detail: {
    fontSize: 13,
  },
  cta: {
    marginTop: 12,
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
