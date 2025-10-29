export type LanguageCode = 'cs' | 'en';

export type ThemeMode = 'light' | 'dark' | 'system';

export type AuthProvider = 'email' | 'apple' | 'google';

export interface UserPreferences {
  theme: ThemeMode;
  language: LanguageCode;
  dailyReminder?: {
    enabled: boolean;
    hour: number; // 0-23
    minute: number; // 0-59
  };
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  nativeLanguage?: string;
  learningGoal?: string;
  preferences: UserPreferences;
  level: CEFRLevel;
  streakCount: number;
  achievements: Achievement[];
}

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  achievedAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  focusAreas: LearningFocus[];
  estimatedDurationMinutes: number;
  content: Array<LessonContentItem>;
}

export type LearningFocus =
  | 'grammar'
  | 'vocabulary'
  | 'listening'
  | 'reading'
  | 'speaking'
  | 'writing';

export type LessonContentItem =
  | VocabularyItem
  | GrammarNote
  | ListeningSnippet
  | SpeakingPrompt
  | QuizBlock;

export interface VocabularyItem {
  type: 'vocabulary';
  phrase: string;
  translation: string;
  usageExamples: string[];
}

export interface GrammarNote {
  type: 'grammar';
  topic: string;
  explanation: string;
  examples: string[];
}

export interface ListeningSnippet {
  type: 'listening';
  audioAssetPath: string;
  transcript: string;
  questions: QuizQuestion[];
}

export interface SpeakingPrompt {
  type: 'speaking';
  prompt: string;
  expectedLengthSeconds?: number;
  evaluationCriteria: SpeakingEvaluationCriteria;
}

export interface SpeakingEvaluationCriteria {
  fluencyWeight: number;
  pronunciationWeight: number;
  grammarWeight: number;
  vocabularyWeight: number;
}

export interface QuizBlock {
  type: 'quiz';
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  questionType: 'multiple_choice' | 'fill_in_blank' | 'ordering' | 'short_answer';
  prompt: string;
  options?: string[];
  correctAnswers: string[];
  explanation?: string;
}

export interface ExerciseSession {
  id: string;
  userId: string;
  exerciseType: ExerciseType;
  startedAt: string;
  completedAt?: string;
  tasks: ExerciseTask[];
  result?: ExerciseResult;
}

export type ExerciseType = 'listening' | 'grammar' | 'vocabulary' | 'speaking' | 'mixed';

export interface ExerciseTask {
  id: string;
  question: QuizQuestion;
  userAnswer?: string[];
  evaluation?: TaskEvaluation;
}

export interface TaskEvaluation {
  isCorrect: boolean;
  score: number; // 0-1
  feedback?: string;
}

export interface ExerciseResult {
  accuracy: number; // 0-1
  durationSeconds: number;
  mistakes: Mistake[];
}

export interface Mistake {
  id: string;
  questionId: string;
  mistakeType: 'grammar' | 'vocabulary' | 'pronunciation' | 'spelling';
  expectedAnswer: string;
  userAnswer: string;
  explanation: string;
}

export interface TestSession {
  id: string;
  userId: string;
  title: string;
  startedAt: string;
  completedAt?: string;
  sections: TestSection[];
  result?: TestResult;
}

export interface TestSection {
  id: string;
  title: string;
  focusArea: LearningFocus;
  questions: QuizQuestion[];
}

export interface TestResult {
  overallScore: number; // 0-100
  sectionScores: Record<string, number>; // sectionId -> score (0-100)
  passed: boolean;
  recommendations: string[];
}

export interface ConversationSession {
  id: string;
  userId: string;
  topic: string;
  rolePlayContext?: string;
  startedAt: string;
  completedAt?: string;
  turns: ConversationTurn[];
  summary?: ConversationSummary;
}

export interface ConversationTurn {
  id: string;
  speaker: 'user' | 'assistant';
  utterance: string;
  audioRecordingPath?: string;
  evaluation?: ConversationEvaluation;
  timestamp: string;
}

export interface ConversationEvaluation {
  fluencyScore?: number; // 0-1
  grammarScore?: number;
  vocabularyScore?: number;
  pronunciationScore?: number;
  correctiveFeedback?: string;
  suggestedReply?: string;
}

export interface ConversationSummary {
  totalTurns: number;
  keyMistakes: Mistake[];
  recommendedLessons: string[];
}

export interface SpeechAssessment {
  phonemeBreakdown?: PhonemeScore[];
  wordScores?: WordScore[];
  overallScore: number; // 0-1
  feedback: string;
}

export interface PhonemeScore {
  phoneme: string;
  score: number; // 0-1
}

export interface WordScore {
  word: string;
  score: number; // 0-1
}

export interface ProgressSnapshot {
  userId: string;
  collectedAt: string;
  streakCount: number;
  totalXp: number;
  xpByFocus: Partial<Record<LearningFocus, number>>;
  masteredVocabulary: number;
  masteredGrammarTopics: number;
}

export interface Friend {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  level: CEFRLevel;
}

export interface FriendActivity {
  friendId: string;
  activityType: 'lesson_completed' | 'test_passed' | 'streak' | 'achievement';
  description: string;
  occurredAt: string;
}

export interface DirectMessage {
  id: string;
  threadId: string;
  senderId: string;
  receiverId: string;
  content: string;
  sentAt: string;
  readAt?: string;
}

export interface MessageThread {
  id: string;
  participantIds: [string, string];
  lastMessageAt: string;
  messages: DirectMessage[];
}

export interface AuthCredentials {
  provider: AuthProvider;
  token: string;
  email?: string;
  password?: string;
}

export interface AuthSession {
  user: UserProfile;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
}

export interface BackendStatus {
  isReachable: boolean;
  lastSyncAt?: string;
}

export interface SystemDiagnostics {
  deviceModel: string;
  osVersion: string;
  locale: string;
  totalStorageMb: number;
  freeStorageMb: number;
  memoryMb: number;
}

export interface LocalModelConfig {
  modelName: string;
  modelSizeMb: number;
  quantization: '4bit' | '8bit' | '16bit';
  maxContextTokens: number;
  temperature: number;
  topP: number;
}

export interface AIRequestContext {
  sessionId: string;
  userProfile: UserProfile;
  conversationHistory: ConversationTurn[];
  focus: LearningFocus;
  topic?: string;
  promptHint?: string;
}

export interface AIResponse {
  reply: string;
  corrections?: Mistake[];
  followUpQuestion?: string;
  didUseFallbackModel: boolean;
  latencyMs: number;
}
