import React, { useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { PageIntro, Screen, StateView } from '../../components/ui/DesignSystem';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';
import { useChats } from '../../context/ChatContext';
import { useTheme } from '../../context/ThemeContext';

export function ChatListScreen({ navigation }) {
  const { user } = useAuth();
  const { chats, error, setActiveChat, startChatsListener } = useChats();
  const { theme } = useTheme();

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    return startChatsListener(user.uid);
  }, [startChatsListener, user]);

  return (
    <Screen padded={false}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={chats}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <>
            <PageIntro title="Mesajlar" subtitle="Aktif sohbetlerin ve ilan mesajlarin." />
            <StateView error={error} />
          </>
        }
        ListEmptyComponent={
          !error ? <StateView empty title="Henuz chat yok." /> : null
        }
        renderItem={({ item }) => {
          const unreadCount = item.unreadCounts?.[user.uid] || 0;

          return (
            <Pressable
              onPress={() => {
                setActiveChat(item);
                navigation.navigate(ROUTES.CHAT_DETAIL, { chatId: item.id });
              }}
              style={[
                styles.chatCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  shadowColor: theme.colors.shadow,
                },
              ]}>
              <View style={styles.chatHeader}>
                <Text style={[styles.chatTitle, { color: theme.colors.text }]}>
                  {item.relatedListingId ? 'Market mesaji' : 'Direkt mesaj'}
                </Text>
                {unreadCount > 0 ? (
                  <Text style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                    {unreadCount}
                  </Text>
                ) : null}
              </View>
              <Text
                numberOfLines={1}
                style={[styles.lastMessage, { color: theme.colors.subtleText }]}>
                {item.lastMessage?.text || 'Mesaj yok'}
              </Text>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 112,
    paddingTop: 24,
  },
  chatCard: {
    gap: 8,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 2,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  lastMessage: {
    fontSize: 14,
  },
  badge: {
    minWidth: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800',
  },
});
