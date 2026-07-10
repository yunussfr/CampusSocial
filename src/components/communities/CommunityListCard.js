import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {
  mdiAccountMultipleOutline,
  mdiDotsHorizontal,
  mdiLockOutline,
} from '@mdi/js';
import {MdiIcon} from '../ui/MdiIcon';
import {
  formatMemberCount,
  formatRelativeCommunityActivity,
  getCommunityCategory,
  getCommunityDescription,
  getCommunityImageSource,
  getCommunityMemberAvatars,
  getCommunityName,
  getCommunityPrivacyLabel,
} from '../../utils/communityFormatters';

export const CommunityListCard = React.memo(function CommunityListCard({
  community,
  isMember,
  isJoining,
  onPress,
  onJoin,
  theme,
}) {
  const category = getCommunityCategory(community);
  const avatars = getCommunityMemberAvatars(community);
  const privateCommunity = getCommunityPrivacyLabel(community) === 'Ozel';
  const buttonLabel = privateCommunity ? 'İncele' : isMember ? 'Ayrıl' : 'Katıl';

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
          opacity: pressed ? 0.9 : 1,
        },
      ]}>
      <Image source={getCommunityImageSource(community, 'icon')} style={styles.logo} />

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={[styles.title, {color: theme.colors.text}]}>
            {getCommunityName(community)}
          </Text>
          {privateCommunity ? (
            <MdiIcon path={mdiLockOutline} size={15} color="#92400E" />
          ) : null}
        </View>
        <Text
          numberOfLines={2}
          style={[styles.description, {color: theme.colors.mutedText}]}>
          {getCommunityDescription(community)}
        </Text>
        <View style={styles.bottomRow}>
          {avatars.length > 0 ? (
            <View style={styles.avatarRow}>
              {avatars.map((avatar, index) => (
                <Image
                  key={`${avatar}-${index}`}
                  source={{uri: avatar}}
                  style={[styles.avatar, index > 0 && styles.avatarOverlap]}
                />
              ))}
            </View>
          ) : (
            <View style={styles.memberMeta}>
              <MdiIcon path={mdiAccountMultipleOutline} size={17} color={theme.colors.mutedText} />
              <Text style={[styles.memberText, {color: theme.colors.mutedText}]}>
                {formatMemberCount(community)}
              </Text>
            </View>
          )}
          <Text numberOfLines={1} style={[styles.activity, {color: theme.colors.subtleText}]}>
            {formatRelativeCommunityActivity(community)}
          </Text>
        </View>
      </View>

      <View style={styles.side}>
        <View style={[styles.categoryBadge, {backgroundColor: `${category?.color || '#2563EB'}16`}]}>
          <Text
            numberOfLines={1}
            style={[styles.categoryText, {color: category?.color || theme.colors.primary}]}>
            {category?.shortLabel || community?.category || 'Diğer'}
          </Text>
        </View>
        {false ? <MdiIcon path={mdiDotsHorizontal} size={22} color={theme.colors.text} /> : null}
        <Pressable
          disabled={isJoining}
          onPress={privateCommunity ? onPress : onJoin}
          style={[
            styles.joinButton,
            {
              borderColor: theme.colors.primary,
              backgroundColor: isMember ? theme.colors.primarySoft : theme.colors.surface,
              opacity: isJoining ? 0.7 : 1,
            },
          ]}>
          <Text style={[styles.joinText, {color: theme.colors.primary}]}>
            {isJoining ? '...' : buttonLabel}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: 20,
    shadowOffset: {width: 0, height: 7},
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },
  logo: {
    width: 74,
    height: 74,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
  },
  content: {
    minWidth: 0,
    flex: 1,
    gap: 5,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  title: {
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 26,
    height: 26,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderRadius: 13,
    backgroundColor: '#CBD5E1',
  },
  avatarOverlap: {
    marginLeft: -8,
  },
  memberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  memberText: {
    fontSize: 12,
    fontWeight: '800',
  },
  activity: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
  },
  side: {
    width: 116,
    alignItems: 'flex-end',
    gap: 10,
  },
  categoryBadge: {
    maxWidth: 116,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '900',
  },
  joinButton: {
    minWidth: 86,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderRadius: 13,
  },
  joinText: {
    fontSize: 14,
    fontWeight: '900',
  },
});
