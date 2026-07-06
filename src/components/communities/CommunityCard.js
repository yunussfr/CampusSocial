import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {IMAGES} from '../../constants/assets';
import {useTheme} from '../../context/ThemeContext';

export function CommunityCard({community, onPress}) {
  const {theme} = useTheme();

  const communityLogo =
    community.logoURL || community.coverURL
      ? {
          uri: community.logoURL || community.coverURL,
        }
      : IMAGES.coverPlaceholder;

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
          opacity: pressed ? 0.88 : 1,
        },
      ]}>
      {/* Sol bölüm: topluluk bilgileri */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            numberOfLines={1}
            style={[
              styles.title,
              {
                color: theme.colors.text,
              },
            ]}>
            {community.name}
          </Text>

          {community.isPrivate ? (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: theme.colors.primarySoft,
                },
              ]}>
              <Text
                style={[
                  styles.badgeText,
                  {
                    color: theme.colors.accent,
                  },
                ]}>
                Özel
              </Text>
            </View>
          ) : null}
        </View>

        <Text
          numberOfLines={2}
          style={[
            styles.description,
            {
              color: theme.colors.mutedText,
            },
          ]}>
          {community.description || 'Topluluk açıklaması bulunmuyor.'}
        </Text>

        <Text
          numberOfLines={1}
          style={[
            styles.meta,
            {
              color: theme.colors.mutedText,
            },
          ]}>
          {community.category} · {community.memberCount || 0} üye
        </Text>
      </View>

      {/* Sağ bölüm: topluluk logosu */}
      <Image
        source={communityLogo}
        style={[
          styles.logo,
          {
            borderColor: theme.colors.border,
          },
        ]}
        resizeMode="cover"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',

    minHeight: 104,
    padding: 12,

    borderWidth: 1,
    borderRadius: 16,

    shadowOpacity: 0.06,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 10,

    elevation: 2,
  },

  content: {
    flex: 1,
    marginRight: 12,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },

  title: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 21,
  },

  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 7,
  },

  meta: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },

  logo: {
    width: 72,
    height: 72,

    borderWidth: 1,
    borderRadius: 16,

    backgroundColor: '#E2E8F0',
  },

  badge: {
    marginLeft: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});