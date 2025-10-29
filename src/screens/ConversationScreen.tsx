import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalization } from '../state/LocalizationContext';
import { useThemeColors } from '../state/ThemeContext';
import { useServices } from '../services/ServiceContainer';
import { useUser } from '../state/UserContext';
import type { ConversationTurn, LocalModelConfig } from '../models';

export const ConversationScreen: React.FC = () => {
  const colors = useThemeColors();
  const { t, language } = useLocalization();
  const { aiService, speechRecognitionService, textToSpeechService } = useServices();
  const { session } = useUser();

  const [history, setHistory] = useState<ConversationTurn[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Prepare minimal configuration for on-device model (placeholder).
  const modelConfig = useMemo<LocalModelConfig>(
    () => ({
      modelName: 'Qwen2.5-0.5B-Instruct',
      modelSizeMb: 400,
      quantization: '4bit',
      maxContextTokens: 2048,
      temperature: 0.6,
      topP: 0.9,
    }),
    [],
  );

  useEffect(() => {
    if (!aiService.isReady()) {
      aiService.loadModel(modelConfig).catch((err) =>
        console.warn('[ConversationScreen] Model load failed', err),
      );
    }
    speechRecognitionService.isAvailable().then((available) => {
      if (!available) {
        console.warn('[ConversationScreen] Speech recognition not available on this device');
      }
    });
  }, [aiService, modelConfig, speechRecognitionService]);

  useEffect(() => {
    const unsubscribe = speechRecognitionService.subscribe((event) => {
      if (event.type === 'result') {
        setUserInput(event.transcript);
        if (event.isFinal) {
          setIsRecording(false);
        }
      }
      if (event.type === 'start') {
        setIsRecording(true);
      }
      if (event.type === 'stop' || event.type === 'error') {
        setIsRecording(false);
      }
    });

    return unsubscribe;
  }, [speechRecognitionService]);

  const handleSend = useCallback(async () => {
    if (!userInput.trim() || isLoading) {
      return;
    }

    const userTurn: ConversationTurn = {
      id: `turn_${Date.now()}`,
      speaker: 'user',
      utterance: userInput.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedHistory = [...history, userTurn];
    setHistory(updatedHistory);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await aiService.generateReply({
        sessionId: `conversation_${session?.user.id ?? 'guest'}`,
        userProfile: session?.user ?? {
          id: 'guest',
          displayName: t('profile_guest_name', 'Guest'),
          email: '',
          level: 'B1',
          streakCount: 0,
          achievements: [],
          preferences: {
            language,
            theme: 'light',
          },
        },
        conversationHistory: updatedHistory,
        focus: 'speaking',
      });

      const assistantTurn: ConversationTurn = {
        id: `assistant_${Date.now()}`,
        speaker: 'assistant',
        utterance: response.reply,
        timestamp: new Date().toISOString(),
      };

      setHistory((prev) => [...prev, assistantTurn]);
      await textToSpeechService.speak(response.reply, {
        language: 'en-US',
        rate: Platform.select({ ios: 0.5, android: 1.0, default: 1.0 }),
      });
    } finally {
      setIsLoading(false);
    }
  }, [aiService, history, isLoading, session, textToSpeechService, userInput]);

  const handleStartRecording = useCallback(async () => {
    if (isRecording) {
      await speechRecognitionService.stop();
      return;
    }
    await speechRecognitionService.start({ language: 'en-US', interimResults: true });
  }, [isRecording, speechRecognitionService]);

  const colorsSurface = { backgroundColor: colors.surface, borderColor: colors.border };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.history}
        contentContainerStyle={styles.historyContent}
        keyboardShouldPersistTaps="handled">
        {history.map((turn) => (
          <View
            key={turn.id}
            style={[
              styles.bubble,
              turn.speaker === 'user' ? styles.userBubble : styles.assistantBubble,
              {
                backgroundColor:
                  turn.speaker === 'user' ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}>
            <Text
              style={[
                styles.bubbleText,
                { color: turn.speaker === 'user' ? colors.primaryContrast : colors.text },
              ]}>
              {turn.utterance}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View style={[styles.composer, colorsSurface]}>
        <TextInput
          value={userInput}
          onChangeText={setUserInput}
          placeholder={
            isRecording
              ? t('conversation_listening_placeholder')
              : t('conversation_input_placeholder')
          }
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { color: colors.text }]}
          multiline
        />
        <View style={styles.actions}>
          <Pressable
            onPress={handleStartRecording}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: isRecording ? colors.danger : colors.secondary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}>
            <Text
              style={[styles.actionText, { color: colors.primaryContrast }]}>
              {isRecording ? t('conversation_button_stop') : t('conversation_button_record')}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleSend}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: colors.primary,
                opacity: pressed || isLoading ? 0.7 : 1,
              },
            ]}
            disabled={isLoading}>
            <Text style={[styles.actionText, { color: colors.primaryContrast }]}>
              {isLoading ? t('conversation_button_sending') : t('conversation_button_send')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  history: {
    flex: 1,
  },
  historyContent: {
    padding: 20,
    gap: 12,
  },
  bubble: {
    borderRadius: 18,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 20,
  },
  composer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  input: {
    minHeight: 48,
    maxHeight: 120,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
