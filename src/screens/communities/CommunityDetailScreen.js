import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { mdiBookmark, mdiBookmarkOutline } from '@mdi/js';
import { MdiIcon } from '../../components/ui/MdiIcon';
import { IMAGES } from '../../constants/assets';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';
import { useCommunities } from '../../context/CommunityContext';
import { useSaved } from '../../context/SavedContext';

const FEEDBACK_DURATION_MS = 1600;

function getCommunityMemberIds(community) {
  const ids = [
    ...(Array.isArray(community?.memberIds) ? community.memberIds : []),
    ...(Array.isArray(community?.members) ? community.members : []),
  ];

  return ids
    .map(member => (typeof member === 'string' ? member : member?.userId || member?.uid))
    .filter(Boolean);
}

export function CommunityDetailScreen({ navigation, route }) {
  const { profile, user } = useAuth();
  const {
    addCommunityPost,
    communities,
    joinSelectedCommunity,
    leaveSelectedCommunity,
    posts,
    selectedCommunity,
    startCommunityPostsListener,
  } = useCommunities();
  const {
    getPostSaveId,
    removeSave,
    savePost,
    savedPostIds = [],
    startSavesListener,
  } = useSaved();
  const [postContent, setPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [membershipSubmitting, setMembershipSubmitting] = useState(false);
  const [optimisticMemberDelta, setOptimisticMemberDelta] = useState(0);
  const [membershipStatus, setMembershipStatus] = useState(null);
  const [membershipAction, setMembershipAction] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [membershipError, setMembershipError] = useState('');
  const communityId = route.params?.communityId;

  const community = useMemo(
    () => {
      const liveCommunity = communities.find(item => item.id === communityId);

      return liveCommunity || selectedCommunity;
    },
    [communities, communityId, selectedCommunity],
  );

  const joinedCommunityIds = useMemo(() => {
    return [
      ...(Array.isArray(profile?.joinedCommunityIds) ? profile.joinedCommunityIds : []),
      ...(Array.isArray(user?.joinedCommunityIds) ? user.joinedCommunityIds : []),
    ];
  }, [profile?.joinedCommunityIds, user?.joinedCommunityIds]);

  const serverMembership = useMemo(() => {
    if (!user?.uid || !community?.id) {
      return false;
    }

    return (
      joinedCommunityIds.includes(community.id) ||
      getCommunityMemberIds(community).includes(user.uid)
    );
  }, [community, joinedCommunityIds, user?.uid]);

  const isMember = membershipStatus ?? serverMembership;
  const displayedMemberCount = Math.max(
    0,
    Number(community?.memberCount || 0) + optimisticMemberDelta,
  );
  const membershipButtonLabel = feedbackMessage ||
    (membershipSubmitting
      ? membershipAction === 'leave'
        ? 'Çıkarılıyor...'
        : 'Ekleniyor...'
      : isMember
        ? 'Ayrıl'
        : 'Katıl');

  useEffect(() => {
    if (!communityId) {
      return undefined;
    }

    const unsubscribe = startCommunityPostsListener(communityId);

    return unsubscribe;
  }, [communityId, startCommunityPostsListener]);

  useEffect(() => {
    if (!user?.uid) {
      return undefined;
    }

    return startSavesListener(user.uid);
  }, [startSavesListener, user?.uid]);

  useEffect(() => {
    setMembershipStatus(null);
    setMembershipAction(null);
    setOptimisticMemberDelta(0);
    setMembershipError('');
  }, [community?.id, community?.memberCount, serverMembership]);

  useEffect(() => {
    if (!feedbackMessage) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setFeedbackMessage('');
    }, FEEDBACK_DURATION_MS);

    return () => clearTimeout(timeout);
  }, [feedbackMessage]);

  if (!community) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.title}>Topluluk bulunamadi</Text>
      </View>
    );
  }

  async function handleToggleMembership() {
    if (!user?.uid || !community?.id || membershipSubmitting) {
      return;
    }

    const nextIsMember = !isMember;
    const delta = nextIsMember ? 1 : -1;
    const nextAction = nextIsMember ? 'join' : 'leave';

    setMembershipSubmitting(true);
    setMembershipAction(nextAction);
    setMembershipError('');
    setMembershipStatus(nextIsMember);
    setOptimisticMemberDelta(delta);

    try {
      if (nextIsMember) {
        await joinSelectedCommunity(community.id, user.uid);
        setFeedbackMessage("Hub'a eklendi");
      } else {
        await leaveSelectedCommunity(community.id, user.uid);
        setFeedbackMessage("Hub'dan çıkarıldı");
      }
    } catch (error) {
      setMembershipStatus(isMember);
      setOptimisticMemberDelta(0);
      setMembershipError(error.message || 'Üyelik işlemi tamamlanamadı.');
    } finally {
      setMembershipSubmitting(false);
      setMembershipAction(null);
    }
  }

  async function handleCreatePost() {
    if (!postContent.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      await addCommunityPost(
        community.id,
        { content: postContent, imageURLs: [] },
        {
          uid: user.uid,
          displayName: profile?.displayName || user?.displayName || '',
          photoURL: profile?.photoURL || user?.photoURL || '',
        },
      );
      setPostContent('');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTogglePostSave(post) {
    if (!user?.uid || !community?.id || !post?.id) {
      return;
    }

    if (savedPostIds.includes(post.id)) {
      await removeSave(user.uid, getPostSaveId(community.id, post.id));
      return;
    }

    await savePost(user.uid, community.id, post);
  }

  return (
    <FlatList
      ListHeaderComponent={
        <View style={styles.header}>
          <Image
            source={
              community.coverURL
                ? { uri: community.coverURL }
                : IMAGES.coverPlaceholder
            }
            style={styles.cover}
          />
          <Text style={styles.title}>{community.name}</Text>
          <Text style={styles.meta}>
            {community.category} - {displayedMemberCount} üye
          </Text>
          <Text style={styles.description}>{community.description}</Text>
          <Pressable
            disabled={membershipSubmitting || !user?.uid}
            onPress={handleToggleMembership}
            style={[
              styles.membershipButton,
              isMember ? styles.leaveButton : styles.joinButton,
              membershipSubmitting && styles.disabledButton,
              feedbackMessage &&
                (isMember ? styles.feedbackButton : styles.leaveFeedbackButton),
            ]}>
            <Text
              style={[
                styles.membershipButtonText,
                isMember && !feedbackMessage
                  ? styles.leaveButtonText
                  : styles.joinButtonText,
              ]}>
              {membershipButtonLabel}
            </Text>
          </Pressable>
          {membershipError ? (
            <Text style={styles.membershipError}>{membershipError}</Text>
          ) : null}
          <Text style={styles.sectionTitle}>Yeni post</Text>
          <TextInput
            multiline
            autoCorrect={false}
            onChangeText={setPostContent}
            placeholder="Toplulukla bir sey paylas..."
            spellCheck={false}
            style={styles.postInput}
            value={postContent}
          />
          <Pressable
            disabled={submitting}
            onPress={handleCreatePost}
            style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Post Paylas</Text>
          </Pressable>
          <Text style={styles.sectionTitle}>Postlar</Text>
        </View>
      }
      contentContainerStyle={styles.container}
      data={posts}
      keyExtractor={item => item.id}
      ListEmptyComponent={<Text style={styles.emptyText}>Henuz post yok.</Text>}
      renderItem={({ item }) => (
        <Pressable
          onPress={() =>
            navigation.navigate(ROUTES.POST_DETAIL, {
              communityId: community.id,
              postId: item.id,
            })
          }
          style={styles.postCard}>
          <View style={styles.postHeader}>
            <Text style={styles.postAuthor}>
              {item.author?.displayName || 'Anonim'}
            </Text>
            <Pressable
              hitSlop={8}
              onPress={event => {
                event.stopPropagation?.();
                handleTogglePostSave(item);
              }}
              style={styles.savePostButton}>
              <MdiIcon
                path={savedPostIds.includes(item.id) ? mdiBookmark : mdiBookmarkOutline}
                size={22}
                color={savedPostIds.includes(item.id) ? '#2563EB' : '#64748B'}
              />
            </Pressable>
          </View>
          <Text style={styles.postContent}>{item.content}</Text>
          <Text style={styles.meta}>
            {item.likeCount || 0} begeni - {item.commentCount || 0} yorum
          </Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  container: {
    padding: 20,
    paddingBottom: 110,
    backgroundColor: '#F8FAFC',
  },
  header: {
    gap: 12,
  },
  cover: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  title: {
    color: '#0B1C30',
    fontSize: 28,
    fontWeight: '800',
  },
  description: {
    color: '#334155',
    fontSize: 15,
    lineHeight: 22,
  },
  meta: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
  },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: '#004AC6',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  membershipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    borderRadius: 10,
  },
  joinButton: {
    backgroundColor: '#004AC6',
  },
  leaveButton: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  feedbackButton: {
    borderWidth: 0,
    backgroundColor: '#16A34A',
  },
  leaveFeedbackButton: {
    borderWidth: 0,
    backgroundColor: '#DC2626',
  },
  disabledButton: {
    opacity: 0.72,
  },
  membershipButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  joinButtonText: {
    color: '#FFFFFF',
  },
  leaveButtonText: {
    color: '#0B1C30',
  },
  membershipError: {
    color: '#DC2626',
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    color: '#0B1C30',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  postInput: {
    minHeight: 86,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    color: '#0B1C30',
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
  },
  postCard: {
    gap: 6,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  postAuthor: {
    flex: 1,
    color: '#0B1C30',
    fontSize: 14,
    fontWeight: '700',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  savePostButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: '#EFF6FF',
  },
  postContent: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 15,
    marginTop: 12,
  },
});
