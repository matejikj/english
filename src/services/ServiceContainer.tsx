import React, { createContext, useContext, useMemo } from 'react';
import type { BackendGateway } from './api/BackendGateway';
import { InMemoryBackendGateway } from './api/InMemoryBackendGateway';
import type { ConversationalModelService } from './ai/ConversationalModelService';
import { LocalConversationalModelService } from './ai/ConversationalModelService';
import type { SpeechRecognitionService } from './audio/SpeechRecognitionService';
import { NativeSpeechRecognitionService } from './audio/SpeechRecognitionService';
import type { TextToSpeechService } from './audio/TextToSpeechService';
import { NativeTextToSpeechService } from './audio/TextToSpeechService';

export interface ServiceContainerValue {
  backendGateway: BackendGateway;
  aiService: ConversationalModelService;
  speechRecognitionService: SpeechRecognitionService;
  textToSpeechService: TextToSpeechService;
}

const ServiceContext = createContext<ServiceContainerValue | undefined>(undefined);

type ServiceProviderProps = React.PropsWithChildren<{
  overrides?: Partial<ServiceContainerValue>;
}>;

export const ServiceProvider: React.FC<ServiceProviderProps> = ({
  overrides,
  children,
}) => {
  const value = useMemo<ServiceContainerValue>(() => {
    return {
      backendGateway: overrides?.backendGateway ?? new InMemoryBackendGateway(),
      aiService: overrides?.aiService ?? new LocalConversationalModelService(),
      speechRecognitionService:
        overrides?.speechRecognitionService ?? new NativeSpeechRecognitionService(),
      textToSpeechService:
        overrides?.textToSpeechService ?? new NativeTextToSpeechService(),
    };
  }, [overrides]);

  return <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>;
};

export const useServices = () => {
  const ctx = useContext(ServiceContext);
  if (!ctx) {
    throw new Error('useServices must be used within ServiceProvider');
  }
  return ctx;
};
