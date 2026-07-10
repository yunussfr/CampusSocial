import React from 'react';
import { Image, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import {MdiIcon} from './MdiIcon';

export function IconButton({
  accessibilityLabel,
  icon,
  onPress,
  size = 24,
  style,
  tintColor,
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        style,
      ]}>
      {typeof icon === 'string' ? (
        <MdiIcon
          path={icon}
          size={size}
          color={tintColor || theme.colors.primary}
        />
      ) : React.isValidElement(icon) ? (
        icon
      ) : (
        <Image
          source={icon}
          style={[
            styles.icon,
            {
              height: size,
              width: size,
            },
            tintColor ? {tintColor} : undefined,
          ]}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
  },
  icon: {
    resizeMode: 'contain',
  },
});
