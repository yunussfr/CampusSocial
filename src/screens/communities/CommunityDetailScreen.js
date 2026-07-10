import React, {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {SafeAreaView} from 'react-native-safe-area-context';

import {CommunityAccessBanner} from '../../components/community/CommunityAccessBanner';
import {CommunityHeroHeader} from '../../components/community/CommunityHeroHeader';
import {CommunityPostCard} from '../../components/community/CommunityPostCard';
import {CommunityPostComposer} from '../../components/community/CommunityPostComposer';
import {CommunityTabs} from '../../components/community/CommunityTabs';
import {IMAGES} from '../../constants/assets';
import {ROUTES} from '../../constants/routes';
import {useAuth} from '../../context/AuthContext';
import {useCommunities} from '../../context/CommunityContext';
import {useSaved} from '../../context/SavedContext';
import {useTheme} from '../../context/ThemeContext';
import {
  canCreateCommunityPost,
  canOpenCommunityPostDetail,
  canViewCommunityPosts,
  isCommunityMember,
  isCommunityPrivate,
} from '../../utils/communityAccess';
import {
  formatCommunityCreatedAt,
  formatMemberCount,
  getCommunityCategory,
  getCommunityDetailedMembers,
  getCommunityDescription,
  getCommunityMemberCount,
  getCommunityRules,
  getCommunityTags,
  getCommunityPrivacyDisplayLabel,
} from '../../utils/communityFormatters';

const FEEDBACK_DURATION_MS = 1600;

export function CommunityDetailScreen({navigation, route}) {
  const {theme} = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const {profile, user} = useAuth();
  const {
    addCommunityPost,
    communities,
    joinSelectedCommunity,
    leaveSelectedCommunity,
    posts,
    requestSelectedCommunityJoin,
    selectedCommunity,
    startCommunityJoinRequestListener,
    startCommunityPostsListener,
  } = useCommunities();
  const {
    getPostSaveId,
    removeSave,
    savePost,
    savedPostIds = [],
    startSavesListener,
  } = useSaved();

  const [activeTab, setActiveTab] = useState('posts');
  const [postContent, setPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [membershipSubmitting, setMembershipSubmitting] = useState(false);
  const [optimisticMemberDelta, setOptimisticMemberDelta] = useState(0);
  const [membershipStatus, setMembershipStatus] = useState(null);
  const [joinRequest, setJoinRequest] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [membershipError, setMembershipError] = useState('');
  const [showAccessBanner, setShowAccessBanner] = useState(true);
  const communityId = route.params?.communityId;

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

  const serverMembership = useMemo(
    () => isCommunityMember(community, user, joinedCommunityIds),
    [community, joinedCommunityIds, user],
  );

  const isMember = membershipStatus ?? serverMembership;
  const isPrivateCommunity = isCommunityPrivate(community);
  const canViewPosts = canViewCommunityPosts(community, isMember);
  const canCreatePost = canCreateCommunityPost(community, isMember);
  const canOpenPostDetail = canOpenCommunityPostDetail(community, isMember);
  const displayedMemberCount = Math.max(
    0,
    getCommunityMemberCount(community) + optimisticMemberDelta,
  );
  const detailMembers = getCommunityDetailedMembers(community);
  const rules = getCommunityRules(community);
  const tags = getCommunityTags(community);
  const category = getCommunityCategory(community);

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

  useEffect(() => {
    if (!communityId || !user?.uid || !isPrivateCommunity || serverMembership) {
      setJoinRequest(null);
      return undefined;
    }

    return startCommunityJoinRequestListener({
      communityId,
      userId: user.uid,
      onData: setJoinRequest,
      onError: error => setMembershipError(error.message),
    });
  }, [
    communityId,
    isPrivateCommunity,
    serverMembership,
    startCommunityJoinRequestListener,
    user?.uid,
  ]);

  useEffect(() => {
    setMembershipStatus(null);
    setOptimisticMemberDelta(0);
    setMembershipError('');
    setJoinRequest(null);
    setShowAccessBanner(true);
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
      <SafeAreaView style={[styles.centerContent, {backgroundColor: theme.colors.background}]}>
        <Text style={[styles.title, {color: theme.colors.text}]}>Topluluk bulunamadı</Text>
      </SafeAreaView>
    );
  }

  async function handleToggleMembership() {
    if (!user?.uid || !community?.id || membershipSubmitting) {
      return;
    }

    const nextIsMember = !isMember;

    setMembershipSubmitting(true);
    setMembershipError('');

    try {
      if (nextIsMember) {
        if (isPrivateCommunity) {
          await requestSelectedCommunityJoin(community.id, {
            uid: user.uid,
            displayName: profile?.displayName || user?.displayName || '',
            photoURL: profile?.photoURL || user?.photoURL || '',
          });
          setFeedbackMessage('Katılım isteğin gönderildi');
          return;
        }

        setMembershipStatus(true);
        setOptimisticMemberDelta(1);
        await joinSelectedCommunity(community.id, user.uid);
        setFeedbackMessage('Topluluğa katıldın');
      } else {
        setMembershipStatus(false);
        setOptimisticMemberDelta(-1);
        await leaveSelectedCommunity(community.id, user.uid);
        setFeedbackMessage('Topluluktan ayrıldın');
      }
    } catch (error) {
      setMembershipStatus(isMember);
      setOptimisticMemberDelta(0);
      setMembershipError(error.message || 'Üyelik işlemi tamamlanamadı.');
    } finally {
      setMembershipSubmitting(false);
    }
  }

  async function handleCreatePost() {
    if (!canCreatePost || !postContent.trim() || !user?.uid) {
      return;
    }

    setSubmitting(true);

    try {
      await addCommunityPost(
        community.id,
        {content: postContent, imageURLs: []},
        {
          uid: user.uid,
          displayName: profile?.displayName || user?.displayName || '',
          photoURL: profile?.photoURL || user?.photoURL || '',
        },
      );
      setPostContent('');
    } catch (error) {
      Alert.alert('Gönderi paylaşılamadı', error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTogglePostSave(post) {
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

  function openPostDetail(post) {
    if (!canOpenPostDetail) {
      Alert.alert(
        'Özel topluluk',
        'Bu gönderiyi görmek için topluluğa katılmalısınız.',
      );
      return;
    }

    navigation.navigate(ROUTES.POST_DETAIL, {
      communityId: community.id,
      postId: post.id,
    });
  }

  function renderPostsTab() {
    if (!canViewPosts) {
      return (
        <View style={[styles.lockedState, {backgroundColor: theme.colors.surface}]}>
          <Text style={[styles.lockedTitle, {color: theme.colors.text}]}>
            Bu özel bir topluluktur
          </Text>
          <Text style={[styles.lockedText, {color: theme.colors.mutedText}]}>
            Gönderileri görmek ve paylaşım yapmak için topluluğa katıl.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        <CommunityPostComposer
          disabled={!canCreatePost}
          disabledText={
            canCreatePost
              ? undefined
              : isPrivateCommunity
                ? undefined
                : 'Paylaşım bu toplulukta kapalı.'
          }
          onChangeText={setPostContent}
          onSubmit={handleCreatePost}
          profile={profile}
          submitting={submitting}
          theme={theme}
          user={user}
          value={postContent}
        />

        {feedbackMessage ? (
          <Text style={[styles.feedbackText, {color: theme.colors.success}]}>
            {feedbackMessage}
          </Text>
        ) : null}

        <View style={styles.postList}>
          {posts.length > 0 ? (
            posts.map(post => (
              <CommunityPostCard
                canOpen={canOpenPostDetail}
                isSaved={savedPostIds.includes(post.id)}
                key={String(post.id)}
                onPress={() => openPostDetail(post)}
                onToggleSave={() => handleTogglePostSave(post)}
                post={post}
                theme={theme}
              />
            ))
          ) : (
            <View style={[styles.emptyState, {backgroundColor: theme.colors.surface}]}>
              <Text style={[styles.emptyTitle, {color: theme.colors.text}]}>
                Henüz gönderi yok
              </Text>
              <Text style={[styles.emptyText, {color: theme.colors.mutedText}]}>
                Bu toplulukta ilk gönderi paylaşıldığında burada görünecek.
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  function renderAboutTab() {
    return (
      <View style={styles.tabContent}>
        <InfoCard title="Açıklama" theme={theme}>
          <Text style={[styles.infoText, {color: theme.colors.mutedText}]}>
            {getCommunityDescription(community)}
          </Text>
        </InfoCard>

        <InfoCard title="Topluluk Bilgileri" theme={theme}>
          <InfoRow label="Kategori" value={category?.label || community?.category || 'Belirtilmedi'} theme={theme} />
          <InfoRow label="Durum" value={getCommunityPrivacyDisplayLabel(community)} theme={theme} />
          <InfoRow label="Üye Sayısı" value={formatMemberCount(community)} theme={theme} />
          <InfoRow label="Oluşturulma" value={formatCommunityCreatedAt(community)} theme={theme} />
        </InfoCard>

        {rules.length > 0 ? (
          <InfoCard title="Kurallar" theme={theme}>
            {rules.map((rule, index) => (
              <Text key={`${rule}-${index}`} style={[styles.infoText, {color: theme.colors.mutedText}]}>
                {index + 1}. {rule}
              </Text>
            ))}
          </InfoCard>
        ) : null}

        {tags.length > 0 ? (
          <InfoCard title="Etiketler" theme={theme}>
            <View style={styles.tagRow}>
              {tags.map(tag => (
                <View key={tag} style={[styles.tag, {backgroundColor: theme.colors.surfaceAlt}]}>
                  <Text style={[styles.tagText, {color: theme.colors.primary}]}>#{tag}</Text>
                </View>
              ))}
            </View>
          </InfoCard>
        ) : null}
      </View>
    );
  }

  function renderMembersTab() {
    return (
      <View style={styles.tabContent}>
        {detailMembers.length > 0 ? (
          detailMembers.map(member => (
            <View
              key={member.uid || member.userId || member.displayName}
              style={[
                styles.memberRow,
                {backgroundColor: theme.colors.surface, borderColor: theme.colors.border},
              ]}>
              <Image
                source={
                  member.photoURL || member.avatarURL
                    ? {uri: member.photoURL || member.avatarURL}
                    : IMAGES.profileManPlaceholder
                }
                style={styles.memberAvatar}
              />
              <View style={styles.memberTextBlock}>
                <Text style={[styles.memberName, {color: theme.colors.text}]}>
                  {member.displayName || member.name || 'Topluluk üyesi'}
                </Text>
                <Text style={[styles.memberRole, {color: theme.colors.mutedText}]}>
                  {member.role || 'Üye'}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={[styles.emptyState, {backgroundColor: theme.colors.surface}]}>
            <Text style={[styles.emptyTitle, {color: theme.colors.text}]}>
              Üye listesi hazır değil
            </Text>
            <Text style={[styles.emptyText, {color: theme.colors.mutedText}]}>
              Bu topluluk için detaylı üye profilleri henüz veritabanında yok.
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, {backgroundColor: theme.colors.background}]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={[
            styles.container,
            {paddingBottom: tabBarHeight + 34},
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <CommunityHeroHeader
            community={community}
            displayedMemberCount={displayedMemberCount}
            isMember={isMember}
            joinRequestStatus={joinRequest?.status}
            membershipError={membershipError}
            membershipSubmitting={membershipSubmitting}
            onBack={() => navigation.goBack()}
            onNotifications={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
            onSelectTab={setActiveTab}
            onToggleMembership={handleToggleMembership}
            theme={theme}
          />

          <View style={styles.body}>
            {showAccessBanner ? (
              <CommunityAccessBanner
                community={community}
                isMember={isMember}
                onDismiss={() => setShowAccessBanner(false)}
                theme={theme}
              />
            ) : null}

            <View
              style={[
                styles.tabsCard,
                {backgroundColor: theme.colors.surface, shadowColor: theme.colors.shadow},
              ]}>
              <CommunityTabs
                activeTab={activeTab}
                onChangeTab={setActiveTab}
                theme={theme}
              />

              {activeTab === 'posts' ? renderPostsTab() : null}
              {activeTab === 'about' ? renderAboutTab() : null}
              {activeTab === 'members' ? renderMembersTab() : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function InfoCard({children, theme, title}) {
  return (
    <View style={[styles.infoCard, {borderColor: theme.colors.border}]}>
      <Text style={[styles.infoTitle, {color: theme.colors.text}]}>{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({label, theme, value}) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, {color: theme.colors.subtleText}]}>{label}</Text>
      <Text style={[styles.infoValue, {color: theme.colors.text}]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
  },
  container: {
    flexGrow: 1,
  },
  body: {
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  tabsCard: {
    overflow: 'hidden',
    borderRadius: 20,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  tabContent: {
    gap: 14,
    padding: 12,
  },
  postList: {
    gap: 12,
  },
  lockedState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
    borderRadius: 18,
  },
  lockedTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  lockedText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    padding: 22,
    borderRadius: 18,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  infoCard: {
    gap: 10,
    padding: 14,
    borderWidth: 1,
    borderRadius: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoValue: {
    maxWidth: '58%',
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '900',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '800',
  },
  memberRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: 16,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
  },
  memberTextBlock: {
    minWidth: 0,
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '900',
  },
  memberRole: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: '700',
  },
});
