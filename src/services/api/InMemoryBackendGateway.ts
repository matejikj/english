import type {
  AuthCredentials,
  AuthSession,
  BackendStatus,
  DirectMessage,
  Friend,
  FriendActivity,
  MessageThread,
  ProgressSnapshot,
  UserPreferences,
  UserProfile,
} from '../../models';
import type { BackendGateway } from './BackendGateway';

const defaultPreferences: UserPreferences = {
  theme: 'light',
  language: 'cs',
};

const defaultProfile: UserProfile = {
  id: 'demo-user',
  email: 'demo@example.com',
  displayName: 'Demo Student',
  level: 'B1',
  streakCount: 7,
  achievements: [],
  preferences: defaultPreferences,
};

export class InMemoryBackendGateway implements BackendGateway {
  private session: AuthSession | null = null;

  private progress: ProgressSnapshot | null = null;

  private friends: Friend[] = [];

  private activities: FriendActivity[] = [];

  private threads: MessageThread[] = [];

  async getStatus(): Promise<BackendStatus> {
    return { isReachable: true, lastSyncAt: new Date().toISOString() };
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    return this.session;
  }

  async signIn(credentials: AuthCredentials): Promise<AuthSession> {
    const now = new Date().toISOString();

    this.session = {
      user: {
        ...defaultProfile,
        email: credentials.email ?? defaultProfile.email,
      },
      accessToken: `token_${now}`,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    };

    this.friends = [
      {
        id: 'friend-1',
        email: 'alice@example.com',
        displayName: 'Alice',
        level: 'B2',
      },
      {
        id: 'friend-2',
        email: 'bob@example.com',
        displayName: 'Bob',
        level: 'A2',
      },
    ];

    this.activities = [
      {
        friendId: 'friend-1',
        activityType: 'lesson_completed',
        description: 'Alice dokončila lekci „Travel Plans“',
        occurredAt: now,
      },
    ];

    this.progress = {
      userId: this.session.user.id,
      collectedAt: now,
      streakCount: 7,
      totalXp: 340,
      xpByFocus: { grammar: 120, vocabulary: 90, speaking: 130 },
      masteredVocabulary: 180,
      masteredGrammarTopics: 12,
    };

    this.threads = [];

    return this.session;
  }

  async signOut(): Promise<void> {
    this.session = null;
  }

  async updatePreferences(preferences: UserPreferences): Promise<UserPreferences> {
    if (!this.session) {
      throw new Error('Not signed in');
    }
    this.session = {
      ...this.session,
      user: {
        ...this.session.user,
        preferences,
      },
    };
    return preferences;
  }

  async fetchProgress(): Promise<ProgressSnapshot | null> {
    return this.progress;
  }

  async fetchFriends(): Promise<Friend[]> {
    return this.friends;
  }

  async addFriend(email: string): Promise<Friend> {
    const friend: Friend = {
      id: generateId(),
      email,
      displayName: email.split('@')[0],
      level: 'B1',
    };
    this.friends.push(friend);
    return friend;
  }

  async fetchFriendFeed(): Promise<FriendActivity[]> {
    return this.activities;
  }

  async sendDirectMessage(friendId: string, content: string): Promise<DirectMessage> {
    const message: DirectMessage = {
      id: generateId(),
      content,
      senderId: this.session?.user.id ?? 'anonymous',
      receiverId: friendId,
      sentAt: new Date().toISOString(),
      threadId: friendId,
    };

    let thread = this.threads.find((t) => t.id === friendId);
    if (!thread) {
      thread = {
        id: friendId,
        participantIds: [friendId, this.session?.user.id ?? 'anonymous'],
        lastMessageAt: message.sentAt,
        messages: [],
      };
      this.threads.push(thread);
    }

    thread.messages.push(message);
    thread.lastMessageAt = message.sentAt;

    return message;
  }

  async fetchMessageThreads(): Promise<MessageThread[]> {
    return this.threads;
  }

  async subscribeToFriendFeed(
    listener: (activity: FriendActivity) => void,
  ): Promise<() => void> {
    const interval = setInterval(() => {
      const activity: FriendActivity = {
        friendId: 'friend-1',
        activityType: 'streak',
        description: 'Alice udržela 10denní sérii!',
        occurredAt: new Date().toISOString(),
      };
      this.activities.unshift(activity);
      listener(activity);
    }, 60_000);

    return () => clearInterval(interval);
  }
}

const generateId = () => `id_${Math.random().toString(36).slice(2)}`;
