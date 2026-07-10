import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';

export function ShimmerPlaceholder({
  borderRadius = 10,
  color = '#E2E8F0',
  highlightColor = 'rgba(255,255,255,0.58)',
  height,
  style,
  width = '100%',
}) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1150,
        useNativeDriver: true,
      }),
    );

    animation.start();

    return () => animation.stop();
  }, [shimmer]);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-180, 180],
  });

  return (
    <View
      style={[
        styles.root,
        {backgroundColor: color, borderRadius, height, width},
        style,
      ]}>
      <Animated.View
        style={[
          styles.highlight,
          {
            backgroundColor: highlightColor,
            transform: [{translateX}],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
  },
  highlight: {
    width: '42%',
    height: '100%',
    opacity: 0.74,
  },
});
