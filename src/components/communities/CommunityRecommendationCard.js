import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  mdiAccountMultipleOutline,
  mdiLockOutline,
  mdiStar,
} from '@mdi/js';
import {MdiIcon} from '../ui/MdiIcon';
import {
  formatMemberCount,
  formatRelativeCommunityActivity,
  getCommunityCategory,
  getCommunityDescription,
  getCommunityImageSource,
  getCommunityName,
  getCommunityPrivacyLabel,
} from '../../utils/communityFormatters';

export const CommunityRecommendationCard = React.memo(function CommunityRecommendationCard({
  community,
  isMember,
  isJoining,
  onPress,
  onJoin,
  width,
  theme,
}) {
  const category = getCommunityCategory(community);
  const privateCommunity = getCommunityPrivacyLabel(community) === 'Ozel';
  const buttonLabel = privateCommunity ? 'Incele' : isMember ? 'Ayril' : 'Katil';

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.card,
        {
          width,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
          opacity: pressed ? 0.9 : 1,
        },
      ]}>
      <View style={styles.coverWrap}>
        <Image source={getCommunityImageSource(community)} style={styles.cover} />
        <LinearGradient
          colors={['rgba(37,99,235,0.75)', 'rgba(124,58,237,0.62)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.recommendedBadge}>
          <MdiIcon path={mdiStar} size={16} color="#FDE047" />
          <Text style={styles.recommendedText}>Onerilen</Text>
        </View>
        <View style={styles.categoryIcon}>
          <MdiIcon
            path={category?.icon}
            size={34}
            color={category?.color || theme.colors.primary}
          />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={[styles.title, {color: theme.colors.text}]}>
            {getCommunityName(community)}
          </Text>
          {privateCommunity ? (
            <View style={styles.privateBadge}>
              <MdiIcon path={mdiLockOutline} size={12} color="#92400E" />
            </View>
          ) : null}
        </View>

        <Text
          numberOfLines={2}
          style={[styles.description, {color: theme.colors.mutedText}]}>
          {getCommunityDescription(community)}
        </Text>

        <View style={styles.metaRow}>
          <View style={[styles.categoryBadge, {backgroundColor: `${category?.color || '#2563EB'}16`}]}>
            <Text
              numberOfLines={1}
              style={[styles.categoryText, {color: category?.color || theme.colors.primary}]}>
              {category?.label || community?.category || 'Diger'}
            </Text>
          </View>
          <View style={styles.memberMeta}>
            <MdiIcon path={mdiAccountMultipleOutline} size={17} color={theme.colors.mutedText} />
            <Text style={[styles.memberText, {color: theme.colors.mutedText}]}>
              {formatMemberCount(community)}
            </Text>
          </View>
        </View>

        <Text style={[styles.statusText, {color: theme.colors.subtleText}]}>
          {formatRelativeCommunityActivity(community)}
        </Text>

        <Pressable
          disabled={isJoining}
          onPress={privateCommunity ? onPress : onJoin}
          style={({pressed}) => [styles.buttonWrap, pressed && styles.pressed]}>
          <LinearGradient
            colors={
              isMember
                ? ['#64748B', '#475569']
                : [category?.color || theme.colors.primary, theme.colors.accent]
            }
            style={[styles.button, isJoining && styles.disabledButton]}>
            <Text style={styles.buttonText}>{isJoining ? 'Isleniyor...' : buttonLabel}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 20,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.09,
    shadowRadius: 16,
    elevation: 4,
  },
  coverWrap: {
    height: 145,
    justifyContent: 'flex-end',
    backgroundColor: '#DBEAFE',
  },
  cover: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  recommendedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(124,58,237,0.92)',
  },
  recommendedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  categoryIcon: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 18,
    marginBottom: -22,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
  },
  body: {
    gap: 9,
    padding: 18,
    paddingTop: 30,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    flex: 1,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
  },
  privateBadge: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: '#FEF3C7',
  },
  description: {
    minHeight: 40,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  metaRow: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  categoryBadge: {
    minWidth: 0,
    flexShrink: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 11,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '900',
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
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  buttonWrap: {
    overflow: 'hidden',
    borderRadius: 14,
  },
  button: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.78,
  },
});
