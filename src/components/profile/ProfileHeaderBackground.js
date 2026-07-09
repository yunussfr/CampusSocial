import React from 'react';
import {StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {getProfileTheme} from '../../constants/profileThemes';

export function ProfileHeaderBackground({
  children,
  profileTheme,
  style,
  contentStyle,
}) {
  const selectedTheme = getProfileTheme(profileTheme);
  const isLight = selectedTheme.id === 'classic' || selectedTheme.id === 'pearlPink';

  return (
    <LinearGradient
      colors={selectedTheme.backgroundColors}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={[styles.root, style]}>
      <View
        style={[
          styles.sweep,
          isLight ? styles.sweepLight : styles.sweepDark,
          {
            borderColor: selectedTheme.accent,
          },
        ]}
      />
      <View
        style={[
          styles.diagonal,
          isLight ? styles.diagonalLight : styles.diagonalDark,
          {
            backgroundColor: selectedTheme.primary,
          },
        ]}
      />
      <View
        style={[
          styles.glow,
          isLight ? styles.glowLight : styles.glowDark,
          {
            backgroundColor: selectedTheme.accent,
          },
        ]}
      />
      <View
        style={[
          styles.dotField,
          isLight ? styles.dotFieldLight : styles.dotFieldDark,
          {
            borderColor: selectedTheme.accent,
          },
        ]}
      />
      <View style={[styles.content, contentStyle]}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
  },
  content: {
    zIndex: 2,
  },
  sweep: {
    position: 'absolute',
    right: -72,
    top: -62,
    width: 260,
    height: 160,
    borderBottomWidth: 2,
    borderRadius: 80,
    transform: [{rotate: '12deg'}],
  },
  sweepLight: {
    opacity: 0.26,
  },
  sweepDark: {
    opacity: 0.42,
  },
  diagonal: {
    position: 'absolute',
    right: -34,
    bottom: 18,
    width: 210,
    height: 70,
    borderRadius: 22,
    transform: [{rotate: '-34deg'}],
  },
  diagonalLight: {
    opacity: 0.12,
  },
  diagonalDark: {
    opacity: 0.22,
  },
  glow: {
    position: 'absolute',
    left: -54,
    bottom: -42,
    width: 190,
    height: 112,
    borderRadius: 56,
    transform: [{rotate: '-10deg'}],
  },
  glowLight: {
    opacity: 0.16,
  },
  glowDark: {
    opacity: 0.24,
  },
  dotField: {
    position: 'absolute',
    left: -28,
    top: 28,
    width: 130,
    height: 130,
    borderWidth: 18,
    borderRadius: 65,
  },
  dotFieldLight: {
    opacity: 0.12,
  },
  dotFieldDark: {
    opacity: 0.22,
  },
});
