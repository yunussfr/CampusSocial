import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  mdiBookmark,
  mdiBookmarkOutline,
  mdiChatOutline,
  mdiDotsHorizontal,
  mdiEarth,
  mdiShieldCheckOutline,
  mdiThumbUp,
} from '@mdi/js';

import {MdiIcon} from '../ui/MdiIcon';
import {
  getPostAuthorName,
  getPostAuthorPhotoSource,
  getPostCreatedAtText,
  getPostImages,
} from '../../utils/communityFormatters';

export function CommunityPostCard({
  canOpen,
  isSaved,
  onPress,
  onToggleSave,
  post,
  theme,
}) {
  const images = getPostImages(post);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!canOpen}
      onPress={onPress}
      style={({pressed}) => [
        styles.root,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
          opacity: pressed ? 0.92 : 1,
        },
      ]}>
      <View style={styles.header}>
        <Image source={getPostAuthorPhotoSource(post)} style={styles.avatar} />
        <View style={styles.authorBlock}>
          <View style={styles.authorRow}>
            <Text numberOfLines={1} style={[styles.author, {color: theme.colors.text}]}>
              {getPostAuthorName(post)}
            </Text>
            <Text style={[styles.dot, {color: theme.colors.subtleText}]}>·</Text>
            <Text style={[styles.time, {color: theme.colors.subtleText}]}>
              {getPostCreatedAtText(post)}
            </Text>
          </View>
          <View style={styles.badgeRow}>
            <View style={styles.roleBadge}>
              <MdiIcon path={mdiShieldCheckOutline} size={14} color={theme.colors.primary} />
              <Text style={[styles.roleText, {color: theme.colors.primary}]}>
                Topluluk üyesi
              </Text>
            </View>
            <MdiIcon path={mdiEarth} size={15} color={theme.colors.subtleText} />
          </View>
        </View>
        <MdiIcon path={mdiDotsHorizontal} size={24} color={theme.colors.subtleText} />
      </View>

      {post?.content ? (
        <Text style={[styles.content, {color: theme.colors.text}]}>
          {post.content}
        </Text>
      ) : null}

      {images.length > 0 ? (
        <Image resizeMode="cover" source={{uri: images[0]}} style={styles.postImage} />
      ) : null}

      <View style={styles.footer}>
        <View style={styles.metric}>
          <MdiIcon path={mdiThumbUp} size={22} color={theme.colors.primary} />
          <Text style={[styles.metricText, {color: theme.colors.text}]}>
            {Number(post?.likeCount || 0)}
          </Text>
        </View>

        <View style={styles.metric}>
          <MdiIcon path={mdiChatOutline} size={22} color={theme.colors.mutedText} />
          <Text style={[styles.metricText, {color: theme.colors.text}]}>
            {Number(post?.commentCount || 0)}
          </Text>
        </View>

        <Pressable
          hitSlop={8}
          onPress={event => {
            event.stopPropagation?.();
            onToggleSave?.();
          }}
          style={styles.saveButton}>
          <MdiIcon
            path={isSaved ? mdiBookmark : mdiBookmarkOutline}
            size={23}
            color={isSaved ? theme.colors.primary : theme.colors.mutedText}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderRadius: 18,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
  },
  authorBlock: {
    minWidth: 0,
    flex: 1,
  },
  authorRow: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  author: {
    maxWidth: '55%',
    fontSize: 15,
    fontWeight: '900',
  },
  dot: {
    fontSize: 14,
    fontWeight: '900',
  },
  time: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  roleBadge: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#EEF4FF',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '800',
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  postImage: {
    width: '100%',
    height: 156,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
  },
  footer: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  metricText: {
    fontSize: 14,
    fontWeight: '800',
  },
  saveButton: {
    marginLeft: 'auto',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
});
