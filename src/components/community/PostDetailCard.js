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
  mdiShareOutline,
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

export function PostDetailCard({isSaved, onToggleSave, post, theme}) {
  const images = getPostImages(post);

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
        },
      ]}>
      <View style={styles.header}>
        <Image source={getPostAuthorPhotoSource(post)} style={styles.avatar} />
        <View style={styles.authorBlock}>
          <Text numberOfLines={1} style={[styles.author, {color: theme.colors.text}]}>
            {getPostAuthorName(post)}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.roleBadge}>
              <MdiIcon path={mdiShieldCheckOutline} size={14} color={theme.colors.primary} />
              <Text style={[styles.roleText, {color: theme.colors.primary}]}>
                Topluluk üyesi
              </Text>
            </View>
            <Text style={[styles.time, {color: theme.colors.subtleText}]}>
              · {getPostCreatedAtText(post)}
            </Text>
            <MdiIcon path={mdiEarth} size={15} color={theme.colors.subtleText} />
          </View>
        </View>
        <MdiIcon path={mdiDotsHorizontal} size={25} color={theme.colors.subtleText} />
      </View>

      {post?.content ? (
        <Text style={[styles.content, {color: theme.colors.text}]}>
          {post.content}
        </Text>
      ) : null}

      {images.length > 0 ? (
        <Image resizeMode="cover" source={{uri: images[0]}} style={styles.postImage} />
      ) : null}

      <View style={styles.actions}>
        <View style={styles.actionItem}>
          <MdiIcon path={mdiThumbUp} size={25} color={theme.colors.primary} />
          <Text style={[styles.actionText, {color: theme.colors.text}]}>
            {Number(post?.likeCount || 0)}
          </Text>
        </View>

        <View style={styles.actionItem}>
          <MdiIcon path={mdiChatOutline} size={25} color={theme.colors.mutedText} />
          <Text style={[styles.actionText, {color: theme.colors.text}]}>
            {Number(post?.commentCount || 0)}
          </Text>
        </View>

        <Pressable onPress={onToggleSave} style={styles.actionItem}>
          <MdiIcon
            path={isSaved ? mdiBookmark : mdiBookmarkOutline}
            size={25}
            color={isSaved ? theme.colors.primary : theme.colors.mutedText}
          />
          <Text style={[styles.actionText, {color: theme.colors.text}]}>Kaydet</Text>
        </Pressable>

        <View style={[styles.actionItem, styles.passiveAction]}>
          <MdiIcon path={mdiShareOutline} size={25} color={theme.colors.mutedText} />
          <Text style={[styles.actionText, {color: theme.colors.text}]}>Paylaş</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 16,
    padding: 18,
    borderWidth: 1,
    borderRadius: 22,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#E2E8F0',
  },
  authorBlock: {
    minWidth: 0,
    flex: 1,
  },
  author: {
    fontSize: 18,
    fontWeight: '900',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 6,
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
  time: {
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '600',
  },
  postImage: {
    width: '100%',
    height: 230,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
  },
  actions: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '800',
  },
  passiveAction: {
    opacity: 0.72,
  },
});
