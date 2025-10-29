import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  AuthSession,
  BackendStatus,
  DirectMessage,
  Friend,
  FriendActivity,
  MessageThread,
  ProgressSnapshot,
  ThemeMode,
  UserPreferences,
} from '../models';
import { useServices } from '../services/ServiceContainer';
import type { AuthProvider } from '../models';

type SignInResult = { success: true } | { success: false; error: string };

type UserContextValue = {
  session: AuthSession | null;
  backendStatus: BackendStatus | null;
  progress: ProgressSnapshot | null;
  friends: Friend[];
  friendFeed: FriendActivity[];
  messageThreads: MessageThread[];
  setThemePreference: (mode: ThemeMode) => Promise<UserPreferences | null>;
  setLanguagePreference: (language: UserPreferences['language']) => Promise<UserPreferences | null>;
  refreshProgress: () => Promise<void>;
  refreshFriends: () => Promise<void>;
  addFriend: (email: string) => Promise<Friend | null>;
  sendMessage: (friendId: string, content: string) => Promise<DirectMessage | null>;
  signInWithEmail: (email: string, password: string) => Promise<SignInResult>;
  signInWithProvider: (provider: Exclude<AuthProvider, 'email'>) => Promise<SignInResult>;
  signOut: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { backendGateway } = useServices();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);
  const [progress, setProgress] = useState<ProgressSnapshot | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendFeed, setFriendFeed] = useState<FriendActivity[]>([]);
  const [messageThreads, setMessageThreads] = useState<MessageThread[]>([]);

  useEffect(() => {
    backendGateway.getStatus().then(setBackendStatus).catch(console.warn);
    backendGateway.getCurrentSession().then((existingSession) => {
      if (existingSession) {
        setSession(existingSession);
      }
    });
  }, [backendGateway]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (session) {
      refreshProgress();
      refreshFriends();
      backendGateway.fetchFriendFeed().then(setFriendFeed).catch(console.warn);
      backendGateway.fetchMessageThreads().then(setMessageThreads).catch(console.warn);
      backendGateway
        .subscribeToFriendFeed((activity) => {
          setFriendFeed((prev) => [activity, ...prev]);
        })
        .then((cleanup) => {
          unsubscribe = cleanup;
        })
        .catch(console.warn);
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [backendGateway, session]);

  const signInWithEmail = useCallback(
    async (email: string, password: string): Promise<SignInResult> => {
      try {
        const authSession = await backendGateway.signIn({
          provider: 'email',
          email,
          password,
          token: '',
        });
        setSession(authSession);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message ?? 'Neznámá chyba přihlášení' };
      }
    },
    [backendGateway],
  );

  const signInWithProvider = useCallback(
    async (provider: Exclude<AuthProvider, 'email'>): Promise<SignInResult> => {
      try {
        // Native implementace by poskytla token; zde je pouze stub.
        const authSession = await backendGateway.signIn({
          provider,
          token: `mock_token_${provider}`,
        });
        setSession(authSession);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message ?? 'Přihlášení selhalo' };
      }
    },
    [backendGateway],
  );

  const signOut = useCallback(async () => {
    await backendGateway.signOut();
    setSession(null);
    setProgress(null);
    setFriends([]);
    setFriendFeed([]);
    setMessageThreads([]);
  }, [backendGateway]);

  const refreshProgress = useCallback(async () => {
    if (!session) {
      return;
    }
    const snapshot = await backendGateway.fetchProgress();
    setProgress(snapshot);
  }, [backendGateway, session]);

  const refreshFriends = useCallback(async () => {
    if (!session) {
      return;
    }
    const list = await backendGateway.fetchFriends();
    setFriends(list);
  }, [backendGateway, session]);

  const addFriend = useCallback(
    async (email: string) => {
      if (!session) {
        return null;
      }
      try {
        const friend = await backendGateway.addFriend(email);
        setFriends((prev) => [...prev, friend]);
        return friend;
      } catch (err) {
        console.warn('[UserContext] addFriend failed', err);
        return null;
      }
    },
    [backendGateway, session],
  );

  const sendMessage = useCallback(
    async (friendId: string, content: string) => {
      if (!session) {
        return null;
      }
      try {
        const message = await backendGateway.sendDirectMessage(friendId, content);
        setMessageThreads((prev) => {
          const existing = prev.find((thread) => thread.id === friendId);
          if (!existing) {
            return [
              ...prev,
              {
                id: friendId,
                participantIds: [friendId, session.user.id],
                lastMessageAt: message.sentAt,
                messages: [message],
              },
            ];
          }
          return prev.map((thread) =>
            thread.id === friendId
              ? {
                  ...thread,
                  lastMessageAt: message.sentAt,
                  messages: [...thread.messages, message],
                }
              : thread,
          );
        });
        return message;
      } catch (err) {
        console.warn('[UserContext] sendMessage failed', err);
        return null;
      }
    },
    [backendGateway, session],
  );

  const updatePreferences = useCallback(
    async (updater: (prev: UserPreferences) => UserPreferences) => {
      if (!session) {
        return null;
      }
      const next = updater(session.user.preferences);
      const saved = await backendGateway.updatePreferences(next);
      setSession({
        ...session,
        user: {
          ...session.user,
          preferences: saved,
        },
      });
      return saved;
    },
    [backendGateway, session],
  );

  const setThemePreference = useCallback(
    async (mode: ThemeMode) => {
      return updatePreferences((prev) => ({
        ...prev,
        theme: mode,
      }));
    },
    [updatePreferences],
  );

  const setLanguagePreference = useCallback(
    async (language: UserPreferences['language']) => {
      return updatePreferences((prev) => ({
        ...prev,
        language,
      }));
    },
    [updatePreferences],
  );

  const value = useMemo<UserContextValue>(
    () => ({
      session,
      backendStatus,
      progress,
      friends,
      friendFeed,
      messageThreads,
      setThemePreference,
      setLanguagePreference,
      refreshProgress,
      refreshFriends,
      addFriend,
      sendMessage,
      signInWithEmail,
      signInWithProvider,
      signOut,
    }),
    [
      session,
      backendStatus,
      progress,
      friends,
      friendFeed,
      messageThreads,
      setThemePreference,
      setLanguagePreference,
      refreshProgress,
      refreshFriends,
      addFriend,
      sendMessage,
      signInWithEmail,
      signInWithProvider,
      signOut,
    ],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within UserProvider');
  }
  return ctx;
};
