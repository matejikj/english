import type {
  AIRequestContext,
  AIResponse,
  LocalModelConfig,
  Mistake,
  QuizQuestion,
  SpeechAssessment,
} from '../../models';

export interface ConversationalModelService {
  isReady(): boolean;
  loadModel(config: LocalModelConfig): Promise<void>;
  generateReply(context: AIRequestContext): Promise<AIResponse>;
  evaluatePronunciation(
    transcript: string,
    reference: string,
  ): Promise<SpeechAssessment>;
  evaluateGrammar(
    userText: string,
    referenceContext?: string,
  ): Promise<Mistake[]>;
  generateFillInBlankQuestions(
    sourceText: string,
    count: number,
  ): Promise<QuizQuestion[]>;
}

export class LocalConversationalModelService implements ConversationalModelService {
  private ready = false;

  private currentConfig?: LocalModelConfig;

  isReady(): boolean {
    return this.ready;
  }

  async loadModel(config: LocalModelConfig): Promise<void> {
    this.currentConfig = config;
    // TODO integrate with platform-specific model runtime (e.g., GGUF via JSI binding).
    this.ready = true;
  }

  async generateReply(context: AIRequestContext): Promise<AIResponse> {
    if (!this.ready) {
      throw new Error('Model not loaded');
    }
    const lastUserTurn = context.conversationHistory.slice().reverse().find((turn) => turn.speaker === 'user');
    return {
      reply: `Simulovaná odpověď na téma "${context.topic ?? 'konverzace'}". Poslední věta: "${lastUserTurn?.utterance ?? ''}"`,
      corrections: [],
      followUpQuestion: 'Jak bys situaci popsal jinými slovy?',
      didUseFallbackModel: false,
      latencyMs: 120,
    };
  }

  async evaluatePronunciation(
    transcript: string,
    reference: string,
  ): Promise<SpeechAssessment> {
    return {
      overallScore: transcript ? 0.7 : 0,
      feedback: transcript
        ? 'Výslovnost je dobrá, soustřeď se na melodii vět.'
        : 'Nebyla zachycena žádná řeč.',
      phonemeBreakdown: [],
      wordScores: [],
    };
  }

  async evaluateGrammar(userText: string): Promise<Mistake[]> {
    if (!userText) {
      return [];
    }
    return [
      {
        id: generateId(),
        questionId: 'ad-hoc',
        mistakeType: 'grammar',
        expectedAnswer: 'I have been learning for two years.',
        userAnswer: userText,
        explanation: 'Použij present perfect continuous pro vyjádření činnosti trvající až do současnosti.',
      },
    ];
  }

  async generateFillInBlankQuestions(
    sourceText: string,
    count: number,
  ): Promise<QuizQuestion[]> {
    const tokens = sourceText.split(' ').filter(Boolean);
    return Array.from({ length: count }).map((_, idx) => {
      const missingWord = tokens[(idx * 3) % Math.max(tokens.length, 1)] ?? 'word';
      return {
        id: generateId(),
        questionType: 'fill_in_blank',
        prompt: sourceText.replace(missingWord, '___'),
        correctAnswers: [missingWord],
      };
    });
  }
}

const generateId = () => `id_${Math.random().toString(36).slice(2)}`;
