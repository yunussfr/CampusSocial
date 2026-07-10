import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {mdiImageOutline, mdiLockOutline} from '@mdi/js';

import {IMAGES} from '../../constants/assets';
import {MdiIcon} from '../ui/MdiIcon';

function getUserAvatarSource(profile, user) {
  const candidate = profile?.photoURL || user?.photoURL;

  if (typeof candidate === 'string' && candidate.trim()) {
    return {uri: candidate};
  }

  return IMAGES.profileManPlaceholder;
}

export function CommunityPostComposer({
  disabled,
  disabledText,
  onChangeText,
  onSubmit,
  profile,
  submitting,
  theme,
  user,
  value,
}) {
  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <Image source={getUserAvatarSource(profile, user)} style={styles.avatar} />
        <View
          style={[
            styles.inputWrap,
            {
              backgroundColor: disabled ? theme.colors.surfaceAlt : theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          <TextInput
            editable={!disabled && !submitting}
            multiline
            autoCorrect={false}
            onChangeText={onChangeText}
            placeholder="Toplulukla bir şey paylaş..."
            placeholderTextColor={theme.colors.subtleText}
            spellCheck={false}
            style={[styles.input, {color: theme.colors.text}]}
            value={value}
          />
          <MdiIcon
            path={disabled ? mdiLockOutline : mdiImageOutline}
            size={23}
            color={theme.colors.subtleText}
          />
        </View>
        <Pressable
          disabled={disabled || submitting || !value.trim()}
          onPress={onSubmit}
          style={[
            styles.submitButton,
            {backgroundColor: theme.colors.primary},
            (disabled || submitting || !value.trim()) && styles.disabledButton,
          ]}>
          <Text style={styles.submitText}>{submitting ? 'Paylaşılıyor...' : 'Paylaş'}</Text>
        </Pressable>
      </View>

      {disabledText ? (
        <Text style={[styles.disabledText, {color: theme.colors.mutedText}]}>
          {disabledText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 10,
  },
  row: {
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
  inputWrap: {
    minWidth: 0,
    minHeight: 56,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 16,
  },
  input: {
    minWidth: 0,
    maxHeight: 96,
    flex: 1,
    paddingVertical: 0,
    fontSize: 15,
    fontWeight: '600',
  },
  submitButton: {
    minWidth: 78,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  disabledButton: {
    opacity: 0.52,
  },
  disabledText: {
    paddingLeft: 58,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
});
