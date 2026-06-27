import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useCommunities } from '../../context/CommunityContext';

export function PostDetailScreen({ route }) {
  const { posts } = useCommunities();
  const postId = route.params?.postId;

  const post = useMemo(
    () => posts.find(item => item.id === postId),
    [postId, posts],
  );

  if (!post) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.title}>Post bulunamadi</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.author}>{post.author?.displayName || 'Anonim'}</Text>
      <Text style={styles.content}>{post.content}</Text>
      <Text style={styles.meta}>
        {post.likeCount || 0} begeni - {post.commentCount || 0} yorum
      </Text>
      <Text style={styles.note}>
        Yorum ve begeni detaylari sonraki Community polish adiminda genisletilir.
      </Text>
    </View>
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
    flex: 1,
    gap: 12,
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  title: {
    color: '#0B1C30',
    fontSize: 24,
    fontWeight: '800',
  },
  author: {
    color: '#0B1C30',
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    color: '#334155',
    fontSize: 16,
    lineHeight: 24,
  },
  meta: {
    color: '#64748B',
    fontSize: 13,
  },
  note: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 12,
  },
});
