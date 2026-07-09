import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {mdiCheckBold} from '@mdi/js';
import {MdiIcon} from '../ui/MdiIcon';
import {PROFILE_THEMES} from '../../constants/profileThemes';

export function ProfileThemeSelector({
  colors,
  disabled,
  onSelectTheme,
  selectedThemeId,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, {color: colors.text}]}>Profil Teması</Text>
          <Text style={[styles.subtitle, {color: colors.mutedText}]}>
            Profil arka plan temasını seçin.
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        contentContainerStyle={styles.themeList}
        showsHorizontalScrollIndicator={false}>
        {PROFILE_THEMES.map(theme => {
          const selected = theme.id === selectedThemeId;

          return (
            <Pressable
              accessibilityRole="button"
              disabled={disabled}
              key={theme.id}
              onPress={() => onSelectTheme(theme.id)}
              style={({pressed}) => [
                styles.themeOption,
                {
                  opacity: disabled ? 0.62 : pressed ? 0.82 : 1,
                },
              ]}>
              <LinearGradient
                colors={theme.previewColors}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={[
                  styles.preview,
                  selected && styles.previewSelected,
                  selected && {
                    borderColor: colors.primary,
                  },
                ]}>
                <View style={styles.previewAvatar} />
                <View style={styles.previewWave} />
                {selected ? (
                  <View style={[styles.checkBadge, {backgroundColor: colors.primary}]}>
                    <MdiIcon path={mdiCheckBold} size={17} color="#FFFFFF" />
                  </View>
                ) : null}
              </LinearGradient>

              <View style={styles.optionLabelRow}>
                <View style={[styles.optionDot, {backgroundColor: theme.primary}]} />
                <Text
                  numberOfLines={1}
                  style={[styles.optionLabel, {color: colors.text}]}>
                  {theme.name}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
  },
  header: {
    minHeight: 34,
    justifyContent: 'center',
  },
  title: {
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  themeList: {
    gap: 12,
    paddingRight: 4,
  },
  themeOption: {
    width: 138,
  },
  preview: {
    overflow: 'hidden',
    height: 72,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.22)',
    borderRadius: 14,
  },
  previewSelected: {
    borderWidth: 2,
  },
  previewAvatar: {
    position: 'absolute',
    left: 13,
    bottom: 13,
    width: 34,
    height: 34,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.56)',
  },
  previewWave: {
    position: 'absolute',
    right: -22,
    top: 9,
    width: 105,
    height: 42,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.16)',
    transform: [{rotate: '-18deg'}],
  },
  checkBadge: {
    position: 'absolute',
    right: -2,
    top: -2,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 14,
  },
  optionLabelRow: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 8,
  },
  optionDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
  },
  optionLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
  },
});
