import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
} from 'react-native';

import {IMAGES} from '../../constants/assets';

export function AnimatedBrandLogo({onPress}) {
  const entrance = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const entranceAnimation = Animated.spring(entrance, {
      toValue: 1,
      friction: 6,
      tension: 90,
      useNativeDriver: true,
    });

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(1800),

        Animated.timing(pulse, {
          toValue: 1.06,
          duration: 220,
          useNativeDriver: true,
        }),

        Animated.timing(pulse, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]),
    );

    entranceAnimation.start(({finished}) => {
      if (finished) {
        pulseAnimation.start();
      }
    });

    return () => {
      entranceAnimation.stop();
      pulseAnimation.stop();
    };
  }, [entrance, pulse]);

  const entranceScale = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [0.65, 1],
  });

  const rotation = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: ['-18deg', '0deg'],
  });

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      hitSlop={8}
      style={styles.logoButton}
    >
      <Animated.Image
        source={IMAGES.brandLogo}
        resizeMode="contain"
        style={[
          styles.logo,
          {
            opacity: entrance,
            transform: [
              {scale: entranceScale},
              {scale: pulse},
              {rotate: rotation},
            ],
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  logoButton: {
    width: 48,
    height: 48,
    borderRadius: 15,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FFFFFF',

    shadowColor: '#1359C8',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,

    elevation: 4,
  },

  logo: {
    width: 38,
    height: 38,
    borderRadius: 12,
  },
});