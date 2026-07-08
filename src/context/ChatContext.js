import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  createOrGetDirectChat,
  markNotificationsRead,
  markChatRead,
  sendMessage,
  subscribeToChats,
  subscribeToMessages,
  subscribeToNotifications,
} from '../services/chatService';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startChatsListener = useCallback(userId => {
    setLoading(true);
    setError(null);

    return subscribeToChats({
      userId,
      onData: nextChats => {
        setChats(nextChats);
        setLoading(false);
      },
      onError: listenerError => {
        setError(listenerError.message);
        setLoading(false);
      },
    });
  }, []);

  const startMessagesListener = useCallback(chatId => {
    setLoading(true);
    setError(null);

    return subscribeToMessages({
      chatId,
      onData: nextMessages => {
        setMessages(nextMessages);
        setLoading(false);
      },
      onError: listenerError => {
        setError(listenerError.message);
        setLoading(false);
      },
    });
  }, []);

  const sendChatMessage = useCallback(async (chatId, senderId, text) => {
    return sendMessage(chatId, senderId, text);
  }, []);

  const startDirectChat = useCallback(async input => {
    return createOrGetDirectChat(input);
  }, []);

  const markActiveChatRead = useCallback(async (chatId, userId) => {
    return markChatRead(chatId, userId);
  }, []);

  const markUserNotificationsRead = useCallback(async (userId, notificationIds) => {
    return markNotificationsRead(userId, notificationIds);
  }, []);

  const startNotificationsListener = useCallback(userId => {
    setLoading(true);
    setError(null);

    return subscribeToNotifications({
      userId,
      onData: nextNotifications => {
        setNotifications(nextNotifications);
        setLoading(false);
      },
      onError: listenerError => {
        setError(listenerError.message);
        setLoading(false);
      },
    });
  }, []);

  const value = useMemo(
    () => ({
      chats,
      activeChat,
      error,
      loading,
      messages,
      notifications,
      markActiveChatRead,
      markUserNotificationsRead,
      sendChatMessage,
      setChats,
      setActiveChat,
      startChatsListener,
      startDirectChat,
      startMessagesListener,
      startNotificationsListener,
    }),
    [
      activeChat,
      chats,
      error,
      loading,
      markActiveChatRead,
      markUserNotificationsRead,
      messages,
      notifications,
      sendChatMessage,
      startDirectChat,
      startChatsListener,
      startMessagesListener,
      startNotificationsListener,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChats() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChats must be used inside ChatProvider');
  }
  return context;
}
