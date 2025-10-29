import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../state/ThemeContext';
import { useLocalization } from '../state/LocalizationContext';

export const ExercisesScreen: React.FC = () => {
  const colors = useThemeColors();
  const { t } = useLocalization();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>{t('exercises_title')}</Text>
      <View style={styles.grid}>
        {[
          { title: 'Rychlá gramatika', description: '10 otázek zaměřených na minulé časy.' },
          { title: 'Poslech s doplňováním', description: 'Doplň chybějící slova podle audio stopy.' },
          { title: 'Výběr slovíček', description: 'Zvol správné slovo do věty.' },
          { title: 'Výslovnostní výzva', description: 'Procvič frázová slovesa nahlas.' },
        ].map((item) => (
          <View
            key={item.title}
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              {item.description}
            </Text>
            <Text style={[styles.badge, { backgroundColor: colors.secondary, color: colors.primaryContrast }]}>
              {t('exercises_prepare')}
            </Text>
          </View>
        ))}
      </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    flexBasis: '47%',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '600',
  },
});
