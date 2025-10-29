import { NativeModules, Platform } from 'react-native';

export interface TextToSpeechOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  language?: string;
}

export interface TextToSpeechService {
  configure(options: TextToSpeechOptions): Promise<void>;
  speak(text: string, options?: TextToSpeechOptions): Promise<void>;
  stop(): Promise<void>;
  isSpeaking(): Promise<boolean>;
}

type NativeTtsModule = {
  configure(options: TextToSpeechOptions): Promise<void>;
  speak(text: string, options: TextToSpeechOptions): Promise<void>;
  stop(): Promise<void>;
  isSpeaking(): Promise<boolean>;
};

const getNativeModule = (): NativeTtsModule | undefined => {
  const module = NativeModules.TextToSpeechModule as NativeTtsModule | undefined;
  if (!module) {
    console.warn(
      '[TextToSpeech] Native module "TextToSpeechModule" is not linked. Provide a platform implementation.',
    );
  }
  return module;
};

export class NativeTextToSpeechService implements TextToSpeechService {
  async configure(options: TextToSpeechOptions): Promise<void> {
    const module = getNativeModule();
    if (!module) {
      return;
    }
    await module.configure(options);
  }

  async speak(text: string, options: TextToSpeechOptions = {}): Promise<void> {
    const module = getNativeModule();
    if (!module) {
      // TODO integrate with platform specific fallback if needed.
      console.log(`[TextToSpeech] ${Platform.OS} would speak:`, text);
      return;
    }
    await module.speak(text, options);
  }

  async stop(): Promise<void> {
    const module = getNativeModule();
    if (!module) {
      return;
    }
    await module.stop();
  }

  async isSpeaking(): Promise<boolean> {
    const module = getNativeModule();
    if (!module) {
      return false;
    }
    return module.isSpeaking();
  }
}
