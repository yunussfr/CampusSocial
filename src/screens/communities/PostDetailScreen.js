import React, {useEffect, useMemo} from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  mdiBellOutline,
  mdiChevronDown,
  mdiChevronLeft,
  mdiEarth,
  mdiLockOutline,
  mdiPaperclip,
  mdiSend,
} from '@mdi/js';

import {PostDetailCard} from '../../components/community/PostDetailCard';
import {MdiIcon} from '../../components/ui/MdiIcon';
import {IMAGES} from '../../constants/assets';
import {ROUTES} from '../../constants/routes';
import {useAuth} from '../../context/AuthContext';
import {useCommunities} from '../../context/CommunityContext';
import {useSaved} from '../../context/SavedContext';
import {useTheme} from '../../context/ThemeContext';
import {
  canViewCommunityPosts,
  isCommunityMember,
  isCommunityPrivate,
} from '../../utils/communityAccess';
import {
  getCommunityImageSource,
  getCommunityName,
  getCommunityPrivacyDisplayLabel,
} from '../../utils/communityFormatters';

export function PostDetailScreen({navigation, route}) {
  const {theme} = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const {profile, user} = useAuth();
  const {
    communities,
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
  const communityId = route.params?.communityId;
  const postId = route.params?.postId;

  const community = useMemo(() => {
    const liveCommunity = communities.find(item => item.id === communityId);
    const matchingSelectedCommunity =
      selectedCommunity?.id === communityId ? selectedCommunity : null;

    return liveCommunity || matchingSelectedCommunity;
  }, [communities, communityId, selectedCommunity]);

  const joinedCommunityIds = useMemo(() => {
    return [
      ...(Array.isArray(profile?.joinedCommunityIds) ? profile.joinedCommunityIds : []),
      ...(Array.isArray(user?.joinedCommunityIds) ? user.joinedCommunityIds : []),
    ];
  }, [profile?.joinedCommunityIds, user?.joinedCommunityIds]);

  const isMember = useMemo(
    () => isCommunityMember(community, user, joinedCommunityIds),
    [community, joinedCommunityIds, user],
  );

  const canViewPost = community
    ? canViewCommunityPosts(community, isMember)
    : false;

  const post = useMemo(
    () => posts.find(item => item.id === postId),
    [postId, posts],
  );

  useEffect(() => {
    if (!communityId) {
      return undefined;
    }

    return startCommunityPostsListener(communityId);
  }, [communityId, startCommunityPostsListener]);

  useEffect(() => {
    if (!user?.uid) {
      return undefined;
    }

    return startSavesListener(user.uid);
  }, [startSavesListener, user?.uid]);

  async function handleTogglePostSave() {
    if (!user?.uid || !community?.id || !post?.id) {
      return;
    }

    try {
      if (savedPostIds.includes(post.id)) {
        await removeSave(user.uid, getPostSaveId(community.id, post.id));
        return;
      }

      await savePost(user.uid, community.id, post);
    } catch (error) {
      Alert.alert('Kaydetme işlemi tamamlanamadı', error.message);
    }
  }

  function renderBody() {
    if (!community) {
      return (
        <View style={[styles.stateCard, {backgroundColor: theme.colors.surface}]}>
          <Text style={[styles.stateTitle, {color: theme.colors.text}]}>
            Topluluk bilgisi bulunamadı
          </Text>
          <Text style={[styles.stateText, {color: theme.colors.mutedText}]}>
            Gönderi detayını güvenli şekilde gösterebilmek için topluluk bilgisi yüklenmeli.
          </Text>
        </View>
      );
    }

    if (!canViewPost) {
      return (
        <View style={[styles.stateCard, {backgroundColor: theme.colors.surface}]}>
          <View style={styles.lockIcon}>
            <MdiIcon path={mdiLockOutline} size={30} color={theme.colors.primary} />
          </View>
          <Text style={[styles.stateTitle, {color: theme.colors.text}]}>
            Bu gönderi özel bir topluluğa ait
          </Text>
          <Text style={[styles.stateText, {color: theme.colors.mutedText}]}>
            Görmek için topluluğa katılmalısınız.
          </Text>
        </View>
      );
    }

    if (!post) {
      return (
        <View style={[styles.stateCard, {backgroundColor: theme.colors.surface}]}>
          <Text style={[styles.stateTitle, {color: theme.colors.text}]}>
            Gönderi bulunamadı
          </Text>
          <Text style={[styles.stateText, {color: theme.colors.mutedText}]}>
            Bu gönderi silinmiş veya henüz yüklenmemiş olabilir.
          </Text>
        </View>
      );
    }

    return (
      <>
        <PostDetailCard
          isSaved={savedPostIds.includes(post.id)}
          onToggleSave={handleTogglePostSave}
          post={post}
          theme={theme}
        />

        {isCommunityPrivate(community) && isMember ? (
          <View style={[styles.memberNotice, {backgroundColor: '#EEF4FF'}]}>
            <MdiIcon path={mdiLockOutline} size={28} color={theme.colors.primary} />
            <View style={styles.noticeTextBlock}>
              <Text style={[styles.noticeTitle, {color: theme.colors.primary}]}>
                Bu özel topluluğun bir üyesisin
              </Text>
              <Text style={[styles.noticeText, {color: theme.colors.mutedText}]}>
                Yorum yapabilir, beğenebilir ve topluluk üyeleriyle etkileşimde bulunabilirsin.
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.commentsHeader}>
          <View style={styles.commentsTitleRow}>
            <Text style={[styles.commentsTitle, {color: theme.colors.text}]}>Yorumlar</Text>
            <View style={[styles.commentCountBadge, {backgroundColor: theme.colors.surfaceAlt}]}>
              <Text style={[styles.commentCountText, {color: theme.colors.primary}]}>
                {Number(post?.commentCount || 0)}
              </Text>
            </View>
          </View>
          <View style={styles.sortButton}>
            <Text style={[styles.sortText, {color: theme.colors.primary}]}>En Yeni</Text>
            <MdiIcon path={mdiChevronDown} size={20} color={theme.colors.primary} />
          </View>
        </View>

        <View style={[styles.stateCard, {backgroundColor: theme.colors.surface}]}>
          <Text style={[styles.stateTitle, {color: theme.colors.text}]}>
            Henüz yorum yok
          </Text>
          <Text style={[styles.stateText, {color: theme.colors.mutedText}]}>
            İlk yorum altyapı hazır olduğunda burada görünecek.
          </Text>
        </View>
      </>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, {backgroundColor: theme.colors.background}]}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {paddingBottom: tabBarHeight + 122},
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.navRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
            style={[styles.navButton, {backgroundColor: theme.colors.surface}]}>
            <MdiIcon path={mdiChevronLeft} size={28} color={theme.colors.text} />
          </Pressable>
          <Text style={[styles.navTitle, {color: theme.colors.text}]}>Gönderi Detayı</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
            style={[styles.navButton, {backgroundColor: theme.colors.surface}]}>
            <MdiIcon path={mdiBellOutline} size={25} color={theme.colors.text} />
            <View style={styles.notificationDot} />
          </Pressable>
        </View>

        {community ? (
          <View
            style={[
              styles.communityChip,
              {backgroundColor: theme.colors.surface, borderColor: theme.colors.border},
            ]}>
            <Image source={getCommunityImageSource(community, 'icon')} style={styles.communityIcon} />
            <Text numberOfLines={1} style={[styles.communityName, {color: theme.colors.primary}]}>
              {getCommunityName(community)}
            </Text>
            <Text style={[styles.communityDot, {color: theme.colors.subtleText}]}>·</Text>
            <MdiIcon
              path={isCommunityPrivate(community) ? mdiLockOutline : mdiEarth}
              size={18}
              color={theme.colors.primary}
            />
            <Text style={[styles.privacyText, {color: theme.colors.primary}]}>
              {getCommunityPrivacyDisplayLabel(community)}
            </Text>
          </View>
        ) : null}

        {renderBody()}
      </ScrollView>

      {canViewPost && post ? (
        <View
          style={[
            styles.commentComposer,
            {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.border,
              bottom: tabBarHeight,
            },
          ]}>
          <Image
            source={
              profile?.photoURL || user?.photoURL
                ? {uri: profile?.photoURL || user?.photoURL}
                : IMAGES.profileManPlaceholder
            }
            style={styles.composerAvatar}
          />
          <View
            style={[
              styles.commentInputWrap,
              {backgroundColor: theme.colors.background, borderColor: theme.colors.border},
            ]}>
            <TextInput
              editable={false}
              placeholder="Yorum yaz..."
              placeholderTextColor={theme.colors.subtleText}
              style={[styles.commentInput, {color: theme.colors.text}]}
            />
            <MdiIcon path={mdiPaperclip} size={23} color={theme.colors.subtleText} />
          </View>
          <View style={[styles.sendButton, {backgroundColor: theme.colors.primary}]}>
            <MdiIcon path={mdiSend} size={24} color="#FFFFFF" />
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  navRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  navTitle: {
    fontSize: 22,
    fontWeight: '900',
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 9,
    height: 9,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  communityChip: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 16,
  },
  communityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
  },
  communityName: {
    maxWidth: '38%',
    fontSize: 15,
    fontWeight: '900',
  },
  communityDot: {
    fontSize: 18,
    fontWeight: '900',
  },
  privacyText: {
    fontSize: 15,
    fontWeight: '800',
  },
  stateCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
    borderRadius: 20,
  },
  lockIcon: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 29,
    backgroundColor: '#EEF4FF',
  },
  stateTitle: {
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '900',
  },
  stateText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  memberNotice: {
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
  },
  noticeTextBlock: {
    minWidth: 0,
    flex: 1,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  noticeText: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  commentsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentsTitle: {
    fontSize: 19,
    fontWeight: '900',
  },
  commentCountBadge: {
    minWidth: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  commentCountText: {
    fontSize: 13,
    fontWeight: '900',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 14,
    fontWeight: '900',
  },
  commentComposer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 94,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
  },
  composerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
  },
  commentInputWrap: {
    minWidth: 0,
    minHeight: 54,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 27,
  },
  commentInput: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 15,
    fontWeight: '600',
  },
  sendButton: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
});
