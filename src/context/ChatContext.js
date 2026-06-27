import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  sendMessage,
  subscribeToChats,
  subscribeToMessages,
} from '../services/chatService';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
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

  const value = useMemo(
    () => ({
      chats,
      activeChat,
      error,
      loading,
      messages,
      sendChatMessage,
      setChats,
      setActiveChat,
      startChatsListener,
      startMessagesListener,
    }),
    [
      activeChat,
      chats,
      error,
      loading,
      messages,
      sendChatMessage,
      startChatsListener,
      startMessagesListener,
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
