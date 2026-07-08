import React, {memo, useState} from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  mdiAccountGroupOutline,
  mdiStar,
} from '@mdi/js';

import {MdiIcon} from '../ui/MdiIcon';

const RANK_STYLES = [
  {
    borderColor: '#F59E0B',
    badgeBackground: '#FDE68A',
    badgeText: '#92400E',
  },
  {
    borderColor: '#94A3B8',
    badgeBackground: '#E2E8F0',
    badgeText: '#334155',
  },
  {
    borderColor: '#C2410C',
    badgeBackground: '#FED7AA',
    badgeText: '#9A3412',
  },
];

function ActiveCommunityCard({
  item,
  width,
  theme,
  onPress,
}) {
  const [imageFailed, setImageFailed] =
    useState(false);

  const rankStyle =
    RANK_STYLES[item.rank - 1] || {
      borderColor: theme.colors.border,
      badgeBackground: theme.colors.surface,
      badgeText: theme.colors.text,
    };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.name} topluluğunu aç`}
      onPress={onPress}
      style={({pressed}) => [
        styles.card,
        {
          width,
          backgroundColor: theme.colors.surface,
          borderColor: rankStyle.borderColor,
          opacity: pressed ? 0.9 : 1,
        },
      ]}>
      <View
        style={[
          styles.rankBadge,
          {
            backgroundColor:
              rankStyle.badgeBackground,
          },
        ]}>
        <Text
          style={[
            styles.rankText,
            {
              color: rankStyle.badgeText,
            },
          ]}>
          {item.rank}
        </Text>
      </View>

      <View
        style={[
          styles.logoContainer,
          {
            backgroundColor:
              theme.colors.background,
            borderColor: theme.colors.border,
          },
        ]}>
        {item.logoURL && !imageFailed ? (
          <Image
            source={{uri: item.logoURL}}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
            style={styles.logo}
          />
        ) : (
          <Text
            style={[
              styles.logoFallback,
              {
                color: theme.colors.primary,
              },
            ]}>
            {item.name
              ?.charAt(0)
              ?.toLocaleUpperCase('tr-TR') || 'T'}
          </Text>
        )}
      </View>

      <Text
        numberOfLines={2}
        style={[
          styles.name,
          {
            color: theme.colors.text,
          },
        ]}>
        {item.name}
      </Text>

      <View style={styles.scoreRow}>
        <MdiIcon
          path={mdiStar}
          size={16}
          color="#F59E0B"
        />

        <Text
          style={[
            styles.scoreText,
            {
              color: theme.colors.mutedText,
            },
          ]}>
          {item.activityScore} aktivite skoru
        </Text>
      </View>

      <View
        style={[
          styles.footer,
          {
            borderTopColor: theme.colors.border,
          },
        ]}>
        <MdiIcon
          path={mdiAccountGroupOutline}
          size={16}
          color={theme.colors.mutedText}
        />

        <Text
          style={[
            styles.memberText,
            {
              color: theme.colors.mutedText,
            },
          ]}>
          {item.memberCount} üye
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 210,
    overflow: 'hidden',
    padding: 14,
    borderWidth: 1.3,
    borderRadius: 20,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,

    elevation: 4,
  },

  rankBadge: {
    position: 'absolute',
    top: 10,
    left: 10,

    width: 31,
    height: 31,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 16,
  },

  rankText: {
    fontSize: 15,
    fontWeight: '900',
  },

  logoContainer: {
    width: 62,
    height: 62,
    marginTop: 4,
    alignSelf: 'center',

    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,
    borderRadius: 18,
  },

  logo: {
    width: '100%',
    height: '100%',
  },

  logoFallback: {
    fontSize: 25,
    fontWeight: '900',
  },

  name: {
    minHeight: 42,
    marginTop: 13,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
  },

  scoreRow: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  scoreText: {
    fontSize: 11,
    fontWeight: '600',
  },

  footer: {
    marginTop: 'auto',
    paddingTop: 9,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 5,

    borderTopWidth: StyleSheet.hairlineWidth,
  },

  memberText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

export default memo(ActiveCommunityCard);
