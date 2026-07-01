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
import { IMAGES } from '../../constants/assets';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';
import { useCommunities } from '../../context/CommunityContext';

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
  const [postContent, setPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const communityId = route.params?.communityId;

  const community = useMemo(
    () =>
      selectedCommunity ||
      communities.find(item => item.id === communityId),
    [communities, communityId, selectedCommunity],
  );

  useEffect(() => {
    if (!communityId) {
      return undefined;
    }

    const unsubscribe = startCommunityPostsListener(communityId);

    return unsubscribe;
  }, [communityId, startCommunityPostsListener]);

  if (!community) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.title}>Topluluk bulunamadi</Text>
      </View>
    );
  }

  async function handleJoin() {
    setSubmitting(true);

    try {
      await joinSelectedCommunity(community.id, user.uid);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLeave() {
    setSubmitting(true);

    try {
      await leaveSelectedCommunity(community.id, user.uid);
    } finally {
      setSubmitting(false);
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
            {community.category} - {community.memberCount} uye
          </Text>
          <Text style={styles.description}>{community.description}</Text>
          <View style={styles.actions}>
            <Pressable
              disabled={submitting}
              onPress={handleJoin}
              style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Katil</Text>
            </Pressable>
            <Pressable
              disabled={submitting}
              onPress={handleLeave}
              style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Ayril</Text>
            </Pressable>
          </View>
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
          <Text style={styles.postAuthor}>
            {item.author?.displayName || 'Anonim'}
          </Text>
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
  actions: {
    flexDirection: 'row',
    gap: 12,
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
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#0B1C30',
    fontSize: 15,
    fontWeight: '700',
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
    color: '#0B1C30',
    fontSize: 14,
    fontWeight: '700',
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
