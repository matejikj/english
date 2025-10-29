import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalization } from '../../state/LocalizationContext';
import { useThemeColors } from '../../state/ThemeContext';
import { useUser } from '../../state/UserContext';
import type { FriendActivity, MessageThread } from '../../models';

type TabKey = 'overview' | 'auth' | 'friends' | 'news' | 'messages';

const tabs: Array<{ key: TabKey; labelKey: string }> = [
  { key: 'overview', labelKey: 'profile_overview' },
  { key: 'auth', labelKey: 'profile_auth' },
  { key: 'friends', labelKey: 'profile_friends' },
  { key: 'news', labelKey: 'profile_news' },
  { key: 'messages', labelKey: 'profile_messages' },
];

export const ProfileScreen: React.FC = () => {
  const { t } = useLocalization();
  const colors = useThemeColors();
  const {
    session,
    progress,
    friends,
    friendFeed,
    messageThreads,
    addFriend,
    sendMessage,
    signInWithEmail,
    signInWithProvider,
    signOut,
  } = useUser();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [friendEmail, setFriendEmail] = useState('');
  const [messageDrafts, setMessageDrafts] = useState<Record<string, string>>({});
  const [authForm, setAuthForm] = useState({ email: '', password: '', error: '' });

  const overviewStats = useMemo(
    () => [
      { label: t('profile_stat_level'), value: session?.user.level ?? '—' },
      { label: t('profile_stat_streak'), value: progress?.streakCount ?? 0 },
      { label: t('profile_stat_xp'), value: progress?.totalXp ?? 0 },
      {
        label: t('profile_stat_vocab'),
        value: progress?.masteredVocabulary ?? 0,
      },
    ],
    [progress, session, t],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t('profile_title')}</Text>
      <View style={[styles.tabBar, { borderColor: colors.border }]}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[
              styles.tabButton,
              {
                backgroundColor: activeTab === tab.key ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}>
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === tab.key ? colors.primaryContrast : colors.text,
                },
              ]}>
              {t(tab.labelKey)}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.body}>
        {activeTab === 'overview' && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {session?.user.displayName ?? t('profile_guest_name', 'Guest')}
            </Text>
            <Text style={{ color: colors.textSecondary, marginBottom: 16 }}>
              {session?.user.email ?? t('profile_guest')}
            </Text>
            <View style={styles.statsRow}>
              {overviewStats.map((stat) => (
                <View key={stat.label} style={styles.statsItem}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        {activeTab === 'auth' && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <AuthSection
              colors={colors}
              t={t}
              sessionExists={!!session}
              authForm={authForm}
              onChangeAuthForm={setAuthForm}
              onEmailSignIn={async () => {
                const result = await signInWithEmail(authForm.email, authForm.password);
                if (!result.success) {
                  setAuthForm((prev) => ({ ...prev, error: result.error }));
                }
              }}
              onProviderSignIn={signInWithProvider}
              onSignOut={signOut}
            />
          </View>
        )}
        {activeTab === 'friends' && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile_friends')}</Text>
            <View style={styles.addFriendRow}>
              <TextInput
                value={friendEmail}
                onChangeText={setFriendEmail}
                placeholder="email@example.com"
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              />
              <Pressable
                onPress={async () => {
                  if (friendEmail.trim()) {
                    await addFriend(friendEmail.trim());
                    setFriendEmail('');
                  }
                }}
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
                ]}>
                <Text style={[styles.primaryButtonText, { color: colors.primaryContrast }]}>
                  {t('profile_add_friend')}
                </Text>
              </Pressable>
            </View>
            <FlatList
              data={friends}
              keyExtractor={(item) => item.id}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              renderItem={({ item }) => (
                <View style={[styles.friendItem, { borderColor: colors.border }]}>
                  <View>
                    <Text style={[styles.friendName, { color: colors.text }]}>
                      {item.displayName}
                    </Text>
                  <Text style={{ color: colors.textSecondary }}>{item.email}</Text>
                </View>
                <Text style={{ color: colors.secondary }}>
                  {t('profile_friend_level_prefix')} {item.level}
                </Text>
              </View>
            )}
              style={{ marginTop: 16 }}
            />
          </View>
        )}
        {activeTab === 'news' && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile_news')}</Text>
            <FlatList
              data={friendFeed}
              keyExtractor={(item, index) => `${item.friendId}_${index}`}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              renderItem={({ item }) => <FeedItem item={item} colors={colors} />}
            />
          </View>
        )}
        {activeTab === 'messages' && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile_messages')}</Text>
            <FlatList
              data={messageThreads}
              keyExtractor={(item) => item.id}
              ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
              renderItem={({ item }) => (
                <MessageThreadCard
                  thread={item}
                  colors={colors}
                  t={t}
                  draft={messageDrafts[item.id] ?? ''}
                  onChangeDraft={(text) =>
                    setMessageDrafts((prev) => ({ ...prev, [item.id]: text }))
                  }
                  onSend={async () => {
                    const content = messageDrafts[item.id];
                    if (content?.trim()) {
                      await sendMessage(item.id, content.trim());
                      setMessageDrafts((prev) => ({ ...prev, [item.id]: '' }));
                    }
                  }}
                />
              )}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const AuthSection: React.FC<{
  colors: ReturnType<typeof useThemeColors>;
  t: (key: string, fallback?: string) => string;
  sessionExists: boolean;
  authForm: { email: string; password: string; error: string };
  onChangeAuthForm: (state: { email: string; password: string; error: string }) => void;
  onEmailSignIn: () => Promise<void>;
  onProviderSignIn: (provider: 'apple' | 'google') => Promise<{ success: boolean; error?: string }>;
  onSignOut: () => Promise<void>;
}> = ({ colors, t, sessionExists, authForm, onChangeAuthForm, onEmailSignIn, onProviderSignIn, onSignOut }) => {
  if (sessionExists) {
    return (
      <Pressable
        onPress={onSignOut}
        style={({ pressed }) => [
          styles.primaryButton,
          { backgroundColor: colors.danger, opacity: pressed ? 0.85 : 1 },
        ]}>
        <Text style={[styles.primaryButtonText, { color: colors.primaryContrast }]}>
          {t('auth_logout')}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      <TextInput
        value={authForm.email}
        onChangeText={(value) => onChangeAuthForm({ ...authForm, email: value })}
        placeholder="email@example.com"
        placeholderTextColor={colors.textSecondary}
        keyboardType="email-address"
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
      />
      <TextInput
        value={authForm.password}
        onChangeText={(value) => onChangeAuthForm({ ...authForm, password: value })}
        placeholder="********"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
      />
      {authForm.error ? (
        <Text style={{ color: colors.danger }}>{authForm.error}</Text>
      ) : null}
      <Pressable
        onPress={onEmailSignIn}
        style={({ pressed }) => [
          styles.primaryButton,
          { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
        ]}>
        <Text style={[styles.primaryButtonText, { color: colors.primaryContrast }]}>
          {t('auth_login_email')}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onProviderSignIn('apple')}
        style={({ pressed }) => [
          styles.secondaryButton,
          { borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
        ]}>
        <Text style={{ color: colors.text }}>{t('auth_login_apple')}</Text>
      </Pressable>
      <Pressable
        onPress={() => onProviderSignIn('google')}
        style={({ pressed }) => [
          styles.secondaryButton,
          { borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
        ]}>
        <Text style={{ color: colors.text }}>{t('auth_login_google')}</Text>
      </Pressable>
    </View>
  );
};

const FeedItem: React.FC<{
  item: FriendActivity;
  colors: ReturnType<typeof useThemeColors>;
}> = ({ item, colors }) => (
  <View style={[styles.feedItem, { borderColor: colors.border }]}>
    <Text style={{ color: colors.text }}>{item.description}</Text>
    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{item.occurredAt}</Text>
  </View>
);

const MessageThreadCard: React.FC<{
  thread: MessageThread;
  colors: ReturnType<typeof useThemeColors>;
  t: (key: string, fallback?: string) => string;
  draft: string;
  onChangeDraft: (text: string) => void;
  onSend: () => Promise<void>;
}> = ({ thread, colors, t, draft, onChangeDraft, onSend }) => (
  <View style={[styles.threadCard, { borderColor: colors.border }]}>
    <Text style={[styles.friendName, { color: colors.text }]}>
      {t('profile_thread_with')} {thread.participantIds[0]}
    </Text>
    <View style={{ gap: 6 }}>
      {thread.messages.slice(-3).map((message) => (
        <Text key={message.id} style={{ color: colors.textSecondary }}>
          {message.senderId}: {message.content}
        </Text>
      ))}
    </View>
    <TextInput
      value={draft}
      onChangeText={onChangeDraft}
      placeholder={t('profile_message_placeholder')}
      placeholderTextColor={colors.textSecondary}
      style={[styles.input, { color: colors.text, borderColor: colors.border, marginTop: 8 }]}
    />
    <Pressable
      onPress={onSend}
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor: colors.secondary, opacity: pressed ? 0.85 : 1, marginTop: 10 },
      ]}>
      <Text style={[styles.primaryButtonText, { color: colors.primaryContrast }]}>
        {t('profile_send')}
      </Text>
    </Pressable>
  </View>
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
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 12,
    gap: 8,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  body: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsItem: {
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  input: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
  },
  addFriendRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  feedItem: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  threadCard: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 6,
  },
});
