import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppInput } from '../../components/ui/DesignSystem';
import { useAuth } from '../../context/AuthContext';
import { useChats } from '../../context/ChatContext';
import { useTheme } from '../../context/ThemeContext';

export function ChatDetailScreen({ route }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const {
    error,
    markActiveChatRead,
    messages,
    sendChatMessage,
    startMessagesListener,
  } = useChats();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const chatId = route.params?.chatId;

  useEffect(() => {
    if (!chatId) {
      return undefined;
    }

    const unsubscribe = startMessagesListener(chatId);
    markActiveChatRead(chatId, user.uid);

    return unsubscribe;
  }, [chatId, markActiveChatRead, startMessagesListener, user]);

  async function handleSend() {
    if (!text.trim()) {
      return;
    }

    setSending(true);

    try {
      await sendChatMessage(chatId, user.uid, text);
      setText('');
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {error ? <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text> : null}
      <FlatList
        contentContainerStyle={styles.listContent}
        data={messages}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>Ilk mesaji yaz.</Text>}
        renderItem={({ item }) => {
          const mine = item.senderId === user.uid;

          return (
            <View
              style={[
                styles.messageBubble,
                {
                  backgroundColor: mine ? theme.colors.primary : theme.colors.surface,
                  shadowColor: theme.colors.shadow,
                },
              ]}>
              <Text
                style={[
                  styles.messageText,
                  { color: mine ? '#FFFFFF' : theme.colors.text },
                ]}>
                {item.text}
              </Text>
            </View>
          );
        }}
      />
      <View
        style={[
          styles.composer,
          { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border },
        ]}>
        <AppInput
          autoCorrect={false}
          onChangeText={setText}
          placeholder="Mesaj yaz"
          spellCheck={false}
          style={styles.input}
          value={text}
        />
        <Pressable
          disabled={sending}
          onPress={handleSend}
          style={[styles.sendButton, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.sendButtonText}>{sending ? '...' : 'Gonder'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    gap: 10,
    padding: 20,
  },
  messageBubble: {
    alignSelf: 'flex-start',
    maxWidth: '82%',
    padding: 12,
    borderRadius: 12,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  composer: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 44,
  },
  sendButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 84,
    minHeight: 44,
    borderRadius: 10,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 15,
    marginTop: 24,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    margin: 12,
  },
});
