import React, {useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Card, PageIntro, Screen, StateView } from '../../components/ui/DesignSystem';
import {ROUTES} from '../../constants/routes';
import {useAnalytics} from '../../context/AnalyticsContext';
import { useAuth } from '../../context/AuthContext';
import { useChats } from '../../context/ChatContext';
import {useCommunities} from '../../context/CommunityContext';
import { useTheme } from '../../context/ThemeContext';
import {ANALYTICS_EVENTS} from '../../services/analyticsService';

export function NotificationsScreen({navigation}) {
  const {logEvent} = useAnalytics();
  const { user } = useAuth();
  const {
    error,
    markUserNotificationsRead,
    notifications,
    startNotificationsListener,
  } = useChats();
  const {reviewCommunityJoinRequest} = useCommunities();
  const { theme } = useTheme();
  const [busyRequestId, setBusyRequestId] = useState('');
  const [handledRequests, setHandledRequests] = useState({});

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    return startNotificationsListener(user.uid);
  }, [startNotificationsListener, user]);

  useEffect(() => {
    if (!user?.uid || !notifications.length) {
      return;
    }

    const unreadIds = notifications
      .filter(item => item.read !== true)
      .map(item => item.id);

    if (unreadIds.length > 0) {
      markUserNotificationsRead(user.uid, unreadIds);
    }
  }, [markUserNotificationsRead, notifications, user?.uid]);

  function handleNotificationPress(item) {
    logEvent(ANALYTICS_EVENTS.NOTIFICATION_OPEN, {
      notification_id: item.id,
      type: item.type || '',
    });

    if (item.type === 'message' && item.chatId) {
      navigation.navigate('ChatTab', {
        screen: ROUTES.CHAT_DETAIL,
        params: {chatId: item.chatId},
      });
      return;
    }

    if (item.type === 'follow' && item.followerId) {
      navigation.navigate('ProfileTab', {
        screen: ROUTES.USER_PROFILE,
        params: {userId: item.followerId},
      });
      return;
    }

    if (item.communityId) {
      navigation.navigate('CommunitiesTab', {
        screen: ROUTES.COMMUNITY_DETAIL,
        params: {communityId: item.communityId},
      });
    }
  }

  async function handleReviewRequest(item, status) {
    if (!user?.uid || !item.communityId || !item.requesterId || busyRequestId) {
      return;
    }

    setBusyRequestId(`${item.id}-${status}`);

    try {
      await reviewCommunityJoinRequest({
        communityId: item.communityId,
        requesterId: item.requesterId,
        reviewerId: user.uid,
        status,
      });

      setHandledRequests(current => ({
        ...current,
        [item.id]: status,
      }));
      logEvent(
        status === 'approved'
          ? ANALYTICS_EVENTS.COMMUNITY_JOIN_REQUEST_APPROVE
          : ANALYTICS_EVENTS.COMMUNITY_JOIN_REQUEST_REJECT,
        {
          community_id: item.communityId,
          requester_id: item.requesterId,
        },
      );
    } catch (reviewError) {
      Alert.alert(
        'İstek güncellenemedi',
        reviewError.message || 'Topluluk isteği güncellenemedi.',
      );
    } finally {
      setBusyRequestId('');
    }
  }

  return (
    <Screen padded={false}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={notifications}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <>
            <PageIntro title="Bildirimler" subtitle="Kampüs ve hesap hareketleri." />
            <StateView error={error} />
          </>
        }
        ListEmptyComponent={
          !error ? <StateView empty title="Henüz bildirim yok." /> : null
        }
        renderItem={({ item }) => {
          const handledStatus = handledRequests[item.id];
          const requestPending =
            item.type === 'community_join_request' &&
            !handledStatus &&
            item.requestStatus !== 'approved' &&
            item.requestStatus !== 'rejected';

          return (
            <Pressable
              accessibilityRole="button"
              onPress={() => handleNotificationPress(item)}>
              <Card style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                    {item.title || 'Bildirim'}
                  </Text>
                  {item.read !== true ? (
                    <View
                      style={[
                        styles.unreadDot,
                        {backgroundColor: theme.colors.primary},
                      ]}
                    />
                  ) : null}
                </View>
                <Text style={[styles.message, { color: theme.colors.mutedText }]}>
                  {item.message || item.body}
                </Text>
                {handledStatus ? (
                  <Text style={[styles.statusText, {color: theme.colors.mutedText}]}>
                    {handledStatus === 'approved' ? 'İstek onaylandı' : 'İstek reddedildi'}
                  </Text>
                ) : null}
                {requestPending ? (
                  <View style={styles.actionRow}>
                    <Pressable
                      disabled={Boolean(busyRequestId)}
                      onPress={event => {
                        event.stopPropagation?.();
                        handleReviewRequest(item, 'approved');
                      }}
                      style={[
                        styles.actionButton,
                        styles.approveButton,
                        busyRequestId && styles.disabledButton,
                      ]}>
                      <Text style={styles.actionButtonText}>
                        {busyRequestId === `${item.id}-approved`
                          ? 'Onaylanıyor...'
                          : 'Onayla'}
                      </Text>
                    </Pressable>
                    <Pressable
                      disabled={Boolean(busyRequestId)}
                      onPress={event => {
                        event.stopPropagation?.();
                        handleReviewRequest(item, 'rejected');
                      }}
                      style={[
                        styles.actionButton,
                        styles.rejectButton,
                        busyRequestId && styles.disabledButton,
                      ]}>
                      <Text style={styles.actionButtonText}>
                        {busyRequestId === `${item.id}-rejected`
                          ? 'Reddediliyor...'
                          : 'Reddet'}
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </Card>
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
  card: {
    gap: 6,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  statusText: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  approveButton: {
    backgroundColor: '#16A34A',
  },
  rejectButton: {
    backgroundColor: '#DC2626',
  },
  disabledButton: {
    opacity: 0.68,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
