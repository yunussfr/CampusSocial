import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {
  mdiClose,
  mdiEarth,
  mdiLockOutline,
  mdiShieldCheckOutline,
} from '@mdi/js';

import {MdiIcon} from '../ui/MdiIcon';
import {getCommunityAccessMessage} from '../../utils/communityAccess';

const TONE_COLORS = {
  privateMember: {
    background: '#EEF4FF',
    iconBackground: '#2563EB',
    icon: mdiShieldCheckOutline,
  },
  locked: {
    background: '#EFF6FF',
    iconBackground: '#DBEAFE',
    icon: mdiLockOutline,
  },
  public: {
    background: '#ECFDF5',
    iconBackground: '#D1FAE5',
    icon: mdiEarth,
  },
};

export function CommunityAccessBanner({community, isMember, onDismiss, theme}) {
  const message = getCommunityAccessMessage(community, isMember);
  const tone = TONE_COLORS[message.tone] || TONE_COLORS.public;

  return (
    <View style={[styles.root, {backgroundColor: tone.background}]}>
      <View style={[styles.iconWrap, {backgroundColor: tone.iconBackground}]}>
        <MdiIcon
          path={tone.icon}
          size={28}
          color={message.tone === 'privateMember' ? '#FFFFFF' : theme.colors.primary}
        />
      </View>

      <View style={styles.textBlock}>
        <Text style={[styles.title, {color: theme.colors.primary}]}>
          {message.title}
        </Text>
        <Text style={[styles.description, {color: theme.colors.mutedText}]}>
          {message.description}
        </Text>
      </View>

      {onDismiss ? (
        <Pressable hitSlop={8} onPress={onDismiss} style={styles.closeButton}>
          <MdiIcon path={mdiClose} size={22} color={theme.colors.subtleText} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
  },
  iconWrap: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
  textBlock: {
    minWidth: 0,
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '900',
  },
  description: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  closeButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
