import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLocalization } from '../state/LocalizationContext';
import { useThemeColors } from '../state/ThemeContext';
import type { RootStackParamList } from '../navigation/types';

type MenuNavigation = NativeStackNavigationProp<RootStackParamList, 'Menu'>;

type MenuItem = {
  key: keyof RootStackParamList;
  label: string;
  subtitle: string;
};

export const MenuScreen: React.FC = () => {
  const navigation = useNavigation<MenuNavigation>();
  const colors = useThemeColors();
  const { t } = useLocalization();

  const data: MenuItem[] = [
    {
      key: 'Learning',
      label: t('menu_learning'),
      subtitle: t('menu_learning_subtitle', 'Zlepši gramatiku a slovní zásobu'),
    },
    {
      key: 'Exercises',
      label: t('menu_exercises'),
      subtitle: t('menu_exercises_subtitle', 'Denní praktická cvičení'),
    },
    {
      key: 'Test',
      label: t('menu_tests'),
      subtitle: t('menu_tests_subtitle', 'Prověř si znalosti testem'),
    },
    {
      key: 'Conversation',
      label: t('menu_conversation'),
      subtitle: t('menu_conversation_subtitle', 'Dialog s AI mentorem'),
    },
    {
      key: 'Profile',
      label: t('menu_profile'),
      subtitle: t('menu_profile_subtitle', 'Profil a přátelé'),
    },
    {
      key: 'Settings',
      label: t('menu_settings'),
      subtitle: t('menu_settings_subtitle', 'Předvolby aplikace'),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.heading, { color: colors.text }]}>{t('menu_title')}</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={() => navigation.navigate(item.key)}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{item.label}</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              {item.subtitle}
            </Text>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
  },
  listContent: {
    paddingBottom: 48,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
  },
});
