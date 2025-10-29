import React, { createContext, useContext, useMemo, useState } from 'react';
import type { LanguageCode } from '../models';

type TranslationDictionary = Record<string, string>;

const translations: Record<LanguageCode, TranslationDictionary> = {
  cs: {
    app_title: 'Angličtina',
    menu_title: 'Hlavní menu',
    menu_learning: 'Výuka',
    menu_learning_subtitle: 'Zlepši gramatiku a slovní zásobu',
    menu_exercises: 'Cvičení',
    menu_exercises_subtitle: 'Denní praktická cvičení',
    menu_tests: 'Test',
    menu_tests_subtitle: 'Prověř si znalosti testem',
    menu_conversation: 'Konverzace',
    menu_conversation_subtitle: 'Dialog s AI mentorem',
    menu_profile: 'Profil',
    menu_profile_subtitle: 'Profil, přátelé a zprávy',
    menu_settings: 'Nastavení',
    menu_settings_subtitle: 'Předvolby aplikace',
    learning_title: 'Výukové lekce',
    learning_section_recommended: 'Doporučené lekce',
    learning_section_listening: 'Poslech',
    learning_section_pronunciation: 'Výslovnost',
    exercises_title: 'Cvičení',
    exercises_prepare: 'Připravit',
    tests_title: 'Testovací režim',
    test_length: 'Délka',
    test_focus: 'Zaměření',
    test_start: 'Spustit',
    conversation_title: 'Konverzační partner',
    conversation_input_placeholder: 'Napiš odpověď',
    conversation_listening_placeholder: 'Naslouchám…',
    conversation_button_record: 'Rec',
    conversation_button_stop: 'Stop',
    conversation_button_send: 'Odeslat',
    conversation_button_sending: '…',
    profile_title: 'Profil',
    profile_overview: 'Přehled',
    profile_auth: 'Přihlášení',
    profile_friends: 'Přátelé',
    profile_news: 'Novinky',
    profile_add_friend: 'Přidat přítele',
    profile_messages: 'Zprávy',
    profile_guest: 'Nepřihlášený uživatel',
    profile_stat_level: 'Úroveň',
    profile_stat_streak: 'Denní série',
    profile_stat_xp: 'Celkové XP',
    profile_stat_vocab: 'Slovní zásoba',
    profile_friend_level_prefix: 'Úroveň',
    profile_thread_with: 'Konverzace s',
    profile_message_placeholder: 'Napiš zprávu',
    profile_send: 'Odeslat',
    profile_guest_name: 'Host',
    settings_title: 'Nastavení',
    settings_theme: 'Vzhled aplikace',
    settings_theme_light: 'Světlý režim',
    settings_theme_dark: 'Tmavý režim',
    settings_language: 'Jazyk aplikace',
    settings_language_cs: 'Čeština',
    settings_language_en: 'Angličtina',
    auth_login_email: 'Přihlásit e-mailem',
    auth_login_apple: 'Přihlásit přes Apple',
    auth_login_google: 'Přihlásit přes Google',
    auth_logout: 'Odhlásit',
    conversation_start: 'Začít konverzaci',
    placeholder_under_construction: 'Funkce je ve vývoji.',
  },
  en: {
    app_title: 'English Tutor',
    menu_title: 'Main Menu',
    menu_learning: 'Learning',
    menu_learning_subtitle: 'Improve grammar and vocabulary',
    menu_exercises: 'Practice',
    menu_exercises_subtitle: 'Daily interactive drills',
    menu_tests: 'Test',
    menu_tests_subtitle: 'Check your skills with a test',
    menu_conversation: 'Conversation',
    menu_conversation_subtitle: 'Talk with the AI tutor',
    menu_profile: 'Profile',
    menu_profile_subtitle: 'Profile, friends and messages',
    menu_settings: 'Settings',
    menu_settings_subtitle: 'Application preferences',
    learning_title: 'Learning Lessons',
    learning_section_recommended: 'Recommended lessons',
    learning_section_listening: 'Listening',
    learning_section_pronunciation: 'Pronunciation',
    exercises_title: 'Exercises',
    exercises_prepare: 'Prepare',
    tests_title: 'Testing Mode',
    test_length: 'Length',
    test_focus: 'Focus',
    test_start: 'Start',
    conversation_title: 'Conversation Partner',
    conversation_input_placeholder: 'Type your response',
    conversation_listening_placeholder: 'Listening…',
    conversation_button_record: 'Rec',
    conversation_button_stop: 'Stop',
    conversation_button_send: 'Send',
    conversation_button_sending: '…',
    profile_title: 'Profile',
    profile_overview: 'Overview',
    profile_auth: 'Sign-in',
    profile_friends: 'Friends',
    profile_news: 'News',
    profile_add_friend: 'Add Friend',
    profile_messages: 'Messages',
    profile_guest: 'Guest user',
    profile_stat_level: 'Level',
    profile_stat_streak: 'Daily streak',
    profile_stat_xp: 'Total XP',
    profile_stat_vocab: 'Vocabulary',
    profile_friend_level_prefix: 'Level',
    profile_thread_with: 'Chat with',
    profile_message_placeholder: 'Type a message',
    profile_send: 'Send',
    profile_guest_name: 'Guest',
    settings_title: 'Settings',
    settings_theme: 'Theme',
    settings_theme_light: 'Light mode',
    settings_theme_dark: 'Dark mode',
    settings_language: 'Language',
    settings_language_cs: 'Czech',
    settings_language_en: 'English',
    auth_login_email: 'Sign in with Email',
    auth_login_apple: 'Continue with Apple',
    auth_login_google: 'Continue with Google',
    auth_logout: 'Sign out',
    conversation_start: 'Start conversation',
    placeholder_under_construction: 'Feature under construction.',
  },
};

type LocalizationContextValue = {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
};

const LocalizationContext = createContext<LocalizationContextValue | undefined>(undefined);

export const LocalizationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [language, setLanguage] = useState<LanguageCode>('cs');

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: string, fallback?: string) => {
        const dictionary = translations[language] ?? translations.cs;
        return dictionary[key] ?? fallback ?? key;
      },
    }),
    [language],
  );

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
};

export const useLocalization = () => {
  const ctx = useContext(LocalizationContext);
  if (!ctx) {
    throw new Error('useLocalization must be used within LocalizationProvider');
  }
  return ctx;
};
