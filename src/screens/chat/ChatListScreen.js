import React, { useEffect, useState, useMemo } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppInput, Screen, StateView } from '../../components/ui/DesignSystem';
import { IMAGES, getProfilePlaceholder } from '../../constants/assets';
import { SearchIcon } from '../../components/ui/SearchIcon';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';
import { useChats } from '../../context/ChatContext';
import { useTheme } from '../../context/ThemeContext';

export function ChatListScreen({ navigation }) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const { chats, error, setActiveChat, startChatsListener } = useChats();
  const { theme } = useTheme();

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    return startChatsListener(user.uid);
  }, [startChatsListener, user]);

  const filteredChats = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return chats;
    }

    return chats.filter(chat => {
      const otherUserId = chat.participants?.find(id => id !== user?.uid);
      const otherUser = otherUserId ? chat.participantProfiles?.[otherUserId] : null;

      const searchableText = [
        chat.lastMessage?.text,
        otherUser?.displayName,
        chat.relatedListingId ? 'Market mesaji' : 'Direkt mesaj',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [chats, searchQuery, user]);

  return (
    <Screen padded={false}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={filteredChats}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <>
            <View style={styles.headerSection}>
              <View style={styles.headerTextWrap}>
                <Text style={styles.headerTitle}>Mesajlar</Text>
                <Text style={styles.headerSubtitle}>Aktif sohbetlerin ve ilan mesajlarin.</Text>
              </View>
              <Pressable onPress={() => navigation.navigate('EventsTab', { screen: ROUTES.DISCOVER })}>
                <Image
                  source={IMAGES.brandLogo}
                  style={styles.brandLogo}
                  resizeMode="contain"
                />
              </Pressable>
            </View>
            <AppInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon={<SearchIcon size={20} color={theme.colors.subtleText} />}
              placeholder="Mesajlarda veya kisilerde ara..."
              style={styles.searchInput}
            />
            <StateView error={error} />
          </>
        }
        ListEmptyComponent={
          !error ? <StateView empty title="Henuz chat yok." /> : null
        }
        renderItem={({ item }) => {
          const unreadCount = item.unreadCounts?.[user.uid] || 0;
          const otherUserId = item.participants?.find(id => id !== user?.uid);
          const otherUser = otherUserId ? item.participantProfiles?.[otherUserId] : null;

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
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 }}>
                  <Image
                    source={otherUser?.photoURL ? { uri: otherUser.photoURL } : getProfilePlaceholder(otherUser)}
                    style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.border }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={[styles.chatTitle, { color: theme.colors.text }]}>
                      {otherUser?.displayName || 'İsimsiz Kullanıcı'}
                    </Text>
                    <Text style={{ fontSize: 12, color: theme.colors.primary, marginTop: 2 }}>
                      {item.relatedListingId ? 'Market mesajı' : 'Direkt mesaj'}
                    </Text>
                  </View>
                </View>
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
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    color: '#0B1C30',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: '#64748B',
    fontSize: 15,
    marginTop: 4,
    fontWeight: '500',
  },
  brandLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    marginBottom: 16,
  },
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
