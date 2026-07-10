import React from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  mdiAccountGroupOutline,
  mdiBellOutline,
  mdiCalendarBlankOutline,
  mdiChevronDown,
  mdiChevronLeft,
  mdiCheck,
  mdiCodeTags,
  mdiEarth,
  mdiInformationOutline,
  mdiLockOutline,
} from '@mdi/js';

import {MdiIcon} from '../ui/MdiIcon';
import {
  formatMemberCount,
  getCommunityCategory,
  getCommunityDescription,
  getCommunityImageSource,
  getCommunityName,
  getCommunityPrivacyDisplayLabel,
} from '../../utils/communityFormatters';
import {isCommunityPrivate} from '../../utils/communityAccess';

function hasCommunityImage(community, variant) {
  if (variant === 'icon') {
    return Boolean(community?.iconURL || community?.logoURL || community?.avatarURL || community?.photoURL);
  }

  return Boolean(
    community?.coverURL ||
      community?.coverImageURL ||
      community?.imageURL ||
      community?.imageUrl,
  );
}

function Cover({community}) {
  const category = getCommunityCategory(community);
  const hasCover = hasCommunityImage(community, 'cover');

  if (hasCover) {
    return (
      <ImageBackground
        imageStyle={styles.coverRadius}
        resizeMode="cover"
        source={getCommunityImageSource(community)}
        style={styles.cover}
      />
    );
  }
  return (
    <LinearGradient
      colors={[category?.color || '#2563EB', '#0F4FD8', '#FF8A1F']}
      end={{x: 1, y: 1}}
      start={{x: 0, y: 0}}
      style={styles.cover}>
      <View style={styles.coverCodePlate}>
        <MdiIcon path={category?.icon || mdiCodeTags} size={44} color="#FFFFFF" />
      </View>
    </LinearGradient>
  );
}

export function CommunityHeroHeader({
  community,
  displayedMemberCount,
  isMember,
  joinRequestStatus,
  membershipError,
  membershipSubmitting,
  onBack,
  onNotifications,
  onSelectTab,
  onToggleMembership,
  theme,
}) {
  const category = getCommunityCategory(community);
  const privateCommunity = isCommunityPrivate(community);
  const hasIcon = hasCommunityImage(community, 'icon');
  const hasPendingRequest =
    privateCommunity && !isMember && joinRequestStatus === 'pending';
  const hasRejectedRequest =
    privateCommunity && !isMember && joinRequestStatus === 'rejected';
  const membershipLabel = membershipSubmitting
    ? isMember
      ? 'Ayrılıyor...'
      : privateCommunity
        ? 'Gönderiliyor...'
        : 'Katılıyor...'
    : isMember
      ? 'Üyesin'
      : hasPendingRequest
        ? 'İstek gönderildi'
        : hasRejectedRequest
          ? 'İstek reddedildi'
          : 'Topluluğa Katıl';

  const actionLabel =
    privateCommunity &&
    !isMember &&
    !membershipSubmitting &&
    !hasPendingRequest &&
    !hasRejectedRequest
      ? 'Katılım isteği gönder'
      : membershipLabel;

  return (
    <View style={styles.root}>
      <View style={styles.navRow}>
        <Pressable
          accessibilityRole="button"
          onPress={onBack}
          style={[styles.navButton, {backgroundColor: theme.colors.surface}]}>
          <MdiIcon path={mdiChevronLeft} size={28} color={theme.colors.text} />
        </Pressable>

        <Text style={[styles.navTitle, {color: theme.colors.text}]}>Topluluk</Text>

        <Pressable
          accessibilityRole="button"
          onPress={onNotifications}
          style={[styles.navButton, {backgroundColor: theme.colors.surface}]}>
          <MdiIcon path={mdiBellOutline} size={25} color={theme.colors.text} />
          <View style={styles.notificationDot} />
        </Pressable>
      </View>

      <Cover community={community} />

      <View style={[styles.profileCard, {backgroundColor: theme.colors.surface}]}>
        <View style={styles.avatarWrap}>
          {hasIcon ? (
            <Image
              resizeMode="cover"
              source={getCommunityImageSource(community, 'icon')}
              style={styles.avatar}
            />
          ) : (
            <LinearGradient
              colors={[category?.color || '#2563EB', '#1D4ED8']}
              style={styles.avatarFallback}>
              <MdiIcon path={category?.icon || mdiCodeTags} size={42} color="#FFFFFF" />
            </LinearGradient>
          )}
          <View style={styles.avatarBadge}>
            <MdiIcon
              path={privateCommunity ? mdiLockOutline : mdiEarth}
              size={15}
              color="#FFFFFF"
            />
          </View>
        </View>

        <Text style={[styles.name, {color: theme.colors.text}]}>
          {getCommunityName(community)}
        </Text>

        <View style={styles.chipRow}>
          <View style={[styles.chip, {backgroundColor: theme.colors.surfaceAlt}]}>
            <MdiIcon path={category?.icon || mdiCodeTags} size={16} color={theme.colors.subtleText} />
            <Text style={[styles.chipText, {color: theme.colors.mutedText}]}>
              {category?.shortLabel || category?.label || community?.category || 'Kategori'}
            </Text>
          </View>

          <View style={[styles.chip, {backgroundColor: theme.colors.surfaceAlt}]}>
            <MdiIcon path={mdiAccountGroupOutline} size={16} color={theme.colors.subtleText} />
            <Text style={[styles.chipText, {color: theme.colors.mutedText}]}>
              {displayedMemberCount !== undefined
                ? `${new Intl.NumberFormat('tr-TR').format(displayedMemberCount)} üye`
                : formatMemberCount(community)}
            </Text>
          </View>

          <View style={[styles.privacyChip, {backgroundColor: privateCommunity ? '#EEF4FF' : '#ECFDF5'}]}>
            <MdiIcon
              path={privateCommunity ? mdiLockOutline : mdiEarth}
              size={16}
              color={privateCommunity ? '#004AC6' : '#059669'}
            />
            <Text style={[styles.privacyText, {color: privateCommunity ? '#004AC6' : '#059669'}]}>
              {getCommunityPrivacyDisplayLabel(community)}
            </Text>
          </View>
        </View>

        <Text style={[styles.description, {color: theme.colors.mutedText}]}>
          {getCommunityDescription(community)}
        </Text>

        <View style={styles.actionRow}>
          <Pressable
            disabled={membershipSubmitting || hasPendingRequest || hasRejectedRequest}
            onPress={onToggleMembership}
            style={[
              styles.mainAction,
              {backgroundColor: theme.colors.primary},
              (membershipSubmitting || hasPendingRequest || hasRejectedRequest) &&
                styles.disabled,
            ]}>
            <MdiIcon
              path={isMember ? mdiCheck : mdiAccountGroupOutline}
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.mainActionText}>{actionLabel}</Text>
            {isMember ? <MdiIcon path={mdiChevronDown} size={18} color="#FFFFFF" /> : null}
          </Pressable>

          <Pressable
            disabled
            style={[styles.sideAction, {borderColor: theme.colors.border}]}>
            <MdiIcon path={mdiCalendarBlankOutline} size={21} color={theme.colors.primary} />
            <Text style={[styles.sideActionText, {color: theme.colors.text}]}>Etkinlikler</Text>
          </Pressable>

          <Pressable
            onPress={() => onSelectTab?.('members')}
            style={[styles.sideAction, {borderColor: theme.colors.border}]}>
            <MdiIcon path={mdiAccountGroupOutline} size={21} color={theme.colors.primary} />
            <Text style={[styles.sideActionText, {color: theme.colors.text}]}>Üyeler</Text>
          </Pressable>

          <Pressable
            onPress={() => onSelectTab?.('about')}
            style={[styles.sideAction, {borderColor: theme.colors.border}]}>
            <MdiIcon path={mdiInformationOutline} size={21} color={theme.colors.primary} />
            <Text style={[styles.sideActionText, {color: theme.colors.text}]}>Hakkında</Text>
          </Pressable>
        </View>

        {membershipError ? (
          <Text style={styles.errorText}>{membershipError}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
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
  cover: {
    height: 176,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    overflow: 'hidden',
    borderRadius: 20,
  },
  coverRadius: {
    borderRadius: 20,
  },
  coverCodePlate: {
    width: 86,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  profileCard: {
    marginTop: -10,
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 18,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
  },
  avatarWrap: {
    position: 'absolute',
    top: -48,
    left: 16,
    width: 100,
    height: 100,
    borderWidth: 5,
    borderColor: '#FFFFFF',
    borderRadius: 50,
    backgroundColor: '#EEF4FF',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  avatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: 6,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 14,
    backgroundColor: '#2563EB',
  },
  name: {
    fontSize: 31,
    lineHeight: 37,
    fontWeight: '900',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  privacyChip: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  privacyText: {
    fontSize: 13,
    fontWeight: '800',
  },
  description: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },
  mainAction: {
    minHeight: 50,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  mainActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  sideAction: {
    minHeight: 50,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  sideActionText: {
    fontSize: 13,
    fontWeight: '800',
  },
  disabled: {
    opacity: 0.7,
  },
  errorText: {
    marginTop: 10,
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
});
