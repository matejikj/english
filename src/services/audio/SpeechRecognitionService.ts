import { NativeEventEmitter, NativeModules } from 'react-native';

export interface SpeechRecognitionOptions {
  language?: string;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export type SpeechRecognitionEvent =
  | { type: 'start' }
  | { type: 'stop' }
  | { type: 'error'; error: string }
  | { type: 'result'; transcript: string; isFinal: boolean };

export interface SpeechRecognitionService {
  isAvailable(): Promise<boolean>;
  start(options?: SpeechRecognitionOptions): Promise<void>;
  stop(): Promise<void>;
  subscribe(listener: (event: SpeechRecognitionEvent) => void): () => void;
}

type NativeSpeechModule = {
  isAvailable(): Promise<boolean>;
  start(options: SpeechRecognitionOptions): Promise<void>;
  stop(): Promise<void>;
  addListener(event: string): void;
  removeListeners(count: number): void;
};

const getNativeModule = () =>
  NativeModules.SpeechRecognitionModule as NativeSpeechModule | undefined;

export class NativeSpeechRecognitionService implements SpeechRecognitionService {
  private eventEmitter?: NativeEventEmitter;

  private ensureEmitter() {
    if (!this.eventEmitter) {
      const module = getNativeModule();
      if (!module) {
        console.warn(
          '[SpeechRecognition] Native module "SpeechRecognitionModule" is not linked. Provide a platform implementation.',
        );
        return undefined;
      }
      this.eventEmitter = new NativeEventEmitter(module as any);
    }
    return this.eventEmitter;
  }

  async isAvailable(): Promise<boolean> {
    const module = getNativeModule();
    if (!module) {
      return false;
    }
    try {
      return await module.isAvailable();
    } catch (err) {
      console.warn('[SpeechRecognition] Availability check failed', err);
      return false;
    }
  }

  async start(options: SpeechRecognitionOptions = {}): Promise<void> {
    const module = getNativeModule();
    if (!module) {
      return;
    }
    await module.start(options);
  }

  async stop(): Promise<void> {
    const module = getNativeModule();
    if (!module) {
      return;
    }
    await module.stop();
  }

  subscribe(listener: (event: SpeechRecognitionEvent) => void): () => void {
    const emitter = this.ensureEmitter();
    if (!emitter) {
      return () => undefined;
    }

    const subscriptions = [
      emitter.addListener('onStart', () => listener({ type: 'start' })),
      emitter.addListener('onStop', () => listener({ type: 'stop' })),
      emitter.addListener('onError', (error: string) => listener({ type: 'error', error })),
      emitter.addListener('onResult', (payload: { transcript: string; isFinal: boolean }) =>
        listener({ type: 'result', ...payload }),
      ),
    ];

    return () => subscriptions.forEach((sub) => sub.remove());
  }
}
