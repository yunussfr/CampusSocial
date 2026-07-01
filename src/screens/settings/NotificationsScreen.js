import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { Card, PageIntro, Screen, StateView } from '../../components/ui/DesignSystem';
import { useAuth } from '../../context/AuthContext';
import { useChats } from '../../context/ChatContext';
import { useTheme } from '../../context/ThemeContext';

export function NotificationsScreen() {
  const { user } = useAuth();
  const { error, notifications, startNotificationsListener } = useChats();
  const { theme } = useTheme();

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    return startNotificationsListener(user.uid);
  }, [startNotificationsListener, user]);

  return (
    <Screen padded={false}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={notifications}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <>
            <PageIntro title="Bildirimler" subtitle="Kampus ve hesap hareketleri." />
            <StateView error={error} />
          </>
        }
        ListEmptyComponent={
          !error ? <StateView empty title="Henuz bildirim yok." /> : null
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              {item.title || 'Bildirim'}
            </Text>
            <Text style={[styles.message, { color: theme.colors.mutedText }]}>
              {item.message || item.body}
            </Text>
          </Card>
        )}
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
  card: {
    gap: 6,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
});
