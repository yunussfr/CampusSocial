import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {mdiChevronRight} from '@mdi/js';
import {MdiIcon} from '../ui/MdiIcon';

export function MarketPromoBanner({onPress}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [styles.wrap, pressed && styles.pressed]}>
      <LinearGradient
        colors={['#EEF2FF', '#F5F3FF', '#EFF6FF']}
        end={{x: 1, y: 1}}
        start={{x: 0, y: 0}}
        style={styles.banner}>
        <View style={styles.copy}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>KAMPÜS FIRSATLARI</Text>
          </View>

          <Text style={styles.title}>İhtiyacın olan ürünü kampüste bul</Text>

          <Text style={styles.subtitle}>
            Kitap, teknoloji ve yurt eşyalarını öğrencilerden keşfet.
          </Text>

          <View style={styles.actionRow}>
            <Text style={styles.actionText}>İlanları Keşfet</Text>
            <MdiIcon path={mdiChevronRight} size={18} color="#7C3AED" />
          </View>
        </View>

        <View style={styles.visual}>
          <View style={[styles.bubble, styles.bubbleOne]}>
            <Text style={styles.bubbleIcon}>🎧</Text>
          </View>
          <View style={[styles.bubble, styles.bubbleTwo]}>
            <Text style={styles.bubbleIcon}>📚</Text>
          </View>
          <View style={[styles.bubble, styles.bubbleThree]}>
            <Text style={styles.bubbleIcon}>💻</Text>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
    overflow: 'hidden',
    borderRadius: 22,
    shadowColor: '#4338CA',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  pressed: {
    opacity: 0.82,
  },
  banner: {
    minHeight: 176,
    flexDirection: 'row',
    padding: 18,
  },
  copy: {
    flex: 1.25,
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#7C3AED',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  title: {
    marginTop: 10,
    color: '#172554',
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 7,
    color: '#64748B',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  actionRow: {
    marginTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionText: {
    color: '#7C3AED',
    fontSize: 13,
    fontWeight: '900',
  },
  visual: {
    flex: 0.75,
    minHeight: 140,
  },
  bubble: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.72)',
    backgroundColor: '#FFFFFF',
    shadowColor: '#312E81',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  bubbleOne: {
    top: 5,
    right: 2,
    width: 72,
    height: 72,
    borderRadius: 24,
  },
  bubbleTwo: {
    bottom: 2,
    left: -3,
    width: 76,
    height: 76,
    borderRadius: 25,
  },
  bubbleThree: {
    bottom: 16,
    right: -5,
    width: 64,
    height: 64,
    borderRadius: 22,
  },
  bubbleIcon: {
    fontSize: 32,
  },
});
