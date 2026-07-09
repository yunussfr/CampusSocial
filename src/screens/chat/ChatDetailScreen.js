import React, {useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useHeaderHeight} from '@react-navigation/elements';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppInput} from '../../components/ui/DesignSystem';
import {ICONS} from '../../constants/assets';
import {ROUTES} from '../../constants/routes';
import {useAuth} from '../../context/AuthContext';
import {useChats} from '../../context/ChatContext';
import {useTheme} from '../../context/ThemeContext';

function formatMessageTime(value) {
  const date = value?.toDate ? value.toDate() : value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getInitial(displayName) {
  return (displayName || 'K').charAt(0).toUpperCase();
}

export function ChatDetailScreen({navigation, route}) {
  const {user} = useAuth();
  const {theme} = useTheme();
  const {
    activeChat,
    error,
    markActiveChatRead,
    messages,
    sendChatMessage,
    startActiveChatListener,
    startMessagesListener,
  } = useChats();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const chatId = route.params?.chatId;
  const currentUserId = user?.uid;
  const canSend = text.trim().length > 0 && !sending;

  useEffect(() => {
    if (!chatId || !currentUserId) {
      return undefined;
    }

    const unsubscribeMessages = startMessagesListener(chatId);
    const unsubscribeChat = startActiveChatListener(chatId);

    markActiveChatRead(chatId, currentUserId);

    return () => {
      unsubscribeMessages?.();
      unsubscribeChat?.();
    };
  }, [
    chatId,
    currentUserId,
    markActiveChatRead,
    startActiveChatListener,
    startMessagesListener,
  ]);

  const otherParticipantId = useMemo(() => {
    return activeChat?.participants?.find(
      participantId => participantId !== currentUserId,
    );
  }, [activeChat?.participants, currentUserId]);

  const otherProfile = otherParticipantId
    ? activeChat?.participantProfiles?.[otherParticipantId]
    : null;
  const otherDisplayName = otherProfile?.displayName || 'Kullanıcı';

  function handleProfilePress() {
    if (!otherParticipantId) {
      return;
    }

    navigation.navigate('ProfileTab', {
      screen: ROUTES.USER_PROFILE,
      params: {userId: otherParticipantId},
    });
  }

  async function handleSend() {
    const trimmedText = text.trim();

    if (!chatId || !currentUserId || !trimmedText || sending) {
      return;
    }

    setSending(true);

    try {
      await sendChatMessage(chatId, currentUserId, trimmedText);
      setText('');
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}>
      <Pressable
        disabled={!otherParticipantId}
        onPress={handleProfilePress}
        style={[
          styles.profileHeader,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
        ]}>
        {otherProfile?.photoURL ? (
          <Image source={{uri: otherProfile.photoURL}} style={styles.avatar} />
        ) : (
          <View
            style={[
              styles.avatarFallback,
              {backgroundColor: theme.colors.primary},
            ]}>
            <Text style={styles.avatarInitial}>
              {getInitial(otherDisplayName)}
            </Text>
          </View>
        )}

        <View style={styles.profileTextArea}>
          <Text
            numberOfLines={1}
            style={[styles.profileName, {color: theme.colors.text}]}>
            {otherDisplayName}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.profileSubtitle, {color: theme.colors.mutedText}]}>
            Mesajlaşıyorsunuz
          </Text>
        </View>

        <Image
          source={ICONS.tabProfile}
          style={[styles.profileIcon, {tintColor: theme.colors.primary}]}
        />
      </Pressable>

      {error ? (
        <Text style={[styles.errorText, {color: theme.colors.danger}]}>
          {error}
        </Text>
      ) : null}

      <FlatList
        contentContainerStyle={[
          styles.listContent,
          messages.length === 0 && styles.emptyListContent,
        ]}
        data={messages}
        keyboardShouldPersistTaps="handled"
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View
            style={[
              styles.emptyState,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            <Text style={[styles.emptyTitle, {color: theme.colors.text}]}>
              İlk mesajı yaz.
            </Text>
            <Text
              style={[styles.emptyDescription, {color: theme.colors.mutedText}]}>
              Bu kullanıcıyla konuşmayı başlatmak için aşağıdan mesaj gönder.
            </Text>
          </View>
        }
        renderItem={({item}) => {
          const mine = item.senderId === currentUserId;
          const messageTime = formatMessageTime(item.createdAt);

          return (
            <View
              style={[
                styles.messageBubble,
                mine ? styles.myBubble : styles.theirBubble,
                {
                  backgroundColor: mine
                    ? theme.colors.primary
                    : theme.colors.surface,
                  shadowColor: theme.colors.shadow,
                },
              ]}>
              <Text
                style={[
                  styles.messageText,
                  {color: mine ? '#FFFFFF' : theme.colors.text},
                ]}>
                {item.text}
              </Text>
              {messageTime ? (
                <Text
                  style={[
                    styles.messageTime,
                    {color: mine ? 'rgba(255,255,255,0.72)' : theme.colors.mutedText},
                  ]}>
                  {messageTime}
                </Text>
              ) : null}
            </View>
          );
        }}
      />

      <View
        style={[
          styles.composer,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}>
        <AppInput
          autoCorrect
          inputStyle={styles.inputField}
          multiline
          onChangeText={setText}
          placeholder="Mesaj yaz..."
          returnKeyType="default"
          spellCheck
          style={styles.input}
          value={text}
        />
        <Pressable
          disabled={!canSend}
          onPress={handleSend}
          style={[
            styles.sendButton,
            {
              backgroundColor: canSend
                ? theme.colors.primary
                : theme.colors.border,
              opacity: canSend ? 1 : 0.6,
            },
          ]}>
          {sending ? (
            <Text style={styles.sendButtonText}>...</Text>
          ) : (
            <Image source={ICONS.send} style={styles.sendIcon} />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  profileTextArea: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
  },
  profileSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 1,
  },
  profileIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  listContent: {
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    gap: 6,
    padding: 18,
    borderWidth: 1,
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
  },
  emptyDescription: {
    maxWidth: 280,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  messageBubble: {
    maxWidth: '82%',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 10,
    elevation: 1,
  },
  myBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  theirBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  messageTime: {
    alignSelf: 'flex-end',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 4,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
  },
  inputField: {
    minHeight: 44,
    maxHeight: 112,
    paddingTop: 11,
    paddingBottom: 11,
    textAlignVertical: 'top',
  },
  sendButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 44,
    borderRadius: 10,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sendIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
  errorText: {
    fontSize: 14,
    marginHorizontal: 16,
    marginTop: 10,
  },
});
