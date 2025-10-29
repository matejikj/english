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
} from '../../models';

export interface BackendGateway {
  getStatus(): Promise<BackendStatus>;
  getCurrentSession(): Promise<AuthSession | null>;
  signIn(credentials: AuthCredentials): Promise<AuthSession>;
  signOut(): Promise<void>;
  updatePreferences(preferences: UserPreferences): Promise<UserPreferences>;
  fetchProgress(): Promise<ProgressSnapshot | null>;
  fetchFriends(): Promise<Friend[]>;
  addFriend(email: string): Promise<Friend>;
  fetchFriendFeed(): Promise<FriendActivity[]>;
  sendDirectMessage(friendId: string, content: string): Promise<DirectMessage>;
  fetchMessageThreads(): Promise<MessageThread[]>;
  subscribeToFriendFeed(
    listener: (activity: FriendActivity) => void,
  ): Promise<() => void>;
}
