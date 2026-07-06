import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import {AnimatedBrandLogo} from './AnimatedBrandLogo';

export function Screen({
  children,
  scroll = false,
  padded = true,
  style,
}) {
  const {theme} = useTheme();

  const backgroundStyle = {
    backgroundColor: theme.colors.background,
  };

  const paddingStyle = padded
    ? {paddingHorizontal: theme.spacing.screen}
    : null;

  if (scroll) {
    return (
      <ScrollView
        style={[styles.screenRoot, backgroundStyle]}
        contentContainerStyle={[
          styles.scrollContent,
          paddingStyle,
          style,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View
      style={[
        styles.screenRoot,
        styles.screenContent,
        backgroundStyle,
        paddingStyle,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function BrandHeader({ title = 'CampusMerge', action, subtitle,onLogoPress, }) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.brandHeader,
        {
          backgroundColor:
            theme.mode === 'dark' ? 'rgba(7,17,31,0.88)' : 'rgba(248,249,255,0.88)',
          borderBottomColor: theme.colors.border,
        },
      ]}>
      <View style={styles.brandLeft}>
        <View>
          <Text style={[styles.brandTitle, { color: theme.colors.primary }]}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.brandSubtitle, { color: theme.colors.subtleText }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
        <View style={styles.brandRight}>
        {action}

        <AnimatedBrandLogo onPress={onLogoPress} />
      </View>
    </View>
  );
}

export function PageIntro({ eyebrow, title, subtitle }) {
  const { theme } = useTheme();

  return (
    <View style={styles.pageIntro}>
      {eyebrow ? (
        <Text style={[styles.eyebrow, { color: theme.colors.primary }]}>
          {eyebrow}
        </Text>
      ) : null}
      <Text style={[styles.pageTitle, { color: theme.colors.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.pageSubtitle, { color: theme.colors.mutedText }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export function SectionHeader({ title, action, onAction }) {
  const { theme } = useTheme();

  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction}>
          <Text style={[styles.sectionAction, { color: theme.colors.primary }]}>
            {action}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function AppButton({ children, onPress, disabled, variant = 'primary', style }) {
  const { theme } = useTheme();
  const secondary = variant === 'secondary';
  const danger = variant === 'danger';
  const textChild = typeof children === 'string' || typeof children === 'number';

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: danger
            ? theme.colors.danger
            : secondary
              ? theme.colors.surface
              : theme.colors.primaryBright,
          borderColor: secondary ? theme.colors.border : 'transparent',
          opacity: disabled ? 0.65 : 1,
        },
        style,
      ]}>
      {textChild ? (
        <Text
          style={[
            styles.buttonText,
            { color: secondary ? theme.colors.primary : '#FFFFFF' },
          ]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export function AppInput({ leftIcon, leftIconTintColor, rightIcon, rightIconTintColor, ...props }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.inputShell, props.style]}>
      {leftIcon ? (
        React.isValidElement(leftIcon) ? (
          <View style={[styles.inputIcon, { justifyContent: 'center', alignItems: 'center' }]}>
            {leftIcon}
          </View>
        ) : (
          <Image
            source={leftIcon}
            style={[
              styles.inputIcon,
              leftIconTintColor ? { tintColor: leftIconTintColor } : undefined,
            ]}
          />
        )
      ) : null}
      {rightIcon ? (
        <Image
          source={rightIcon}
          style={[
            styles.inputIconRight,
            rightIconTintColor ? { tintColor: rightIconTintColor } : undefined,
          ]}
        />
      ) : null}
      <TextInput
        {...props}
        placeholderTextColor={theme.colors.subtleText}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            color: theme.colors.text,
          },
          leftIcon && styles.inputWithLeftIcon,
          rightIcon && styles.inputWithRightIcon,
          props.multiline && styles.multilineInput,
        ]}
      />
    </View>
  );
}

export function ChipRow({ items, activeItem, onPress, onItemPress }) {
  return (
    <ScrollView
      horizontal
      contentContainerStyle={styles.chipRow}
      showsHorizontalScrollIndicator={false}>
      {items.map(item => (
        <Chip
          active={item === activeItem}
          key={item}
          label={item}
          onPress={() => {
            onPress?.(item);
            onItemPress?.(item);
          }}
        />
      ))}
    </ScrollView>
  );
}

export function Chip({ active, label, onPress }) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? theme.colors.primaryBright : theme.colors.primarySoft,
        },
      ]}>
      <Text
        style={[
          styles.chipText,
          { color: active ? '#EEF4FF' : theme.colors.mutedText },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Card({ children, style }) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

export function StateView({ error, loading, empty, title, children }) {
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={styles.stateWrap}>
        <ActivityIndicator color={theme.colors.primary} />
        <Text style={[styles.stateText, { color: theme.colors.subtleText }]}>
          {title || 'Yukleniyor...'}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.stateCard,
          { backgroundColor: theme.colors.dangerSoft, borderColor: theme.colors.danger },
        ]}>
        <Text style={[styles.stateTitle, { color: theme.colors.danger }]}>
          Bir sorun olustu
        </Text>
        <Text style={[styles.stateText, { color: theme.colors.danger }]}>{error}</Text>
      </View>
    );
  }

  if (empty) {
    return (
      <View
        style={[
          styles.stateCard,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}>
        <Text style={[styles.stateTitle, { color: theme.colors.text }]}>
          Henuz veri yok
        </Text>
        <Text style={[styles.stateText, { color: theme.colors.subtleText }]}>
          {title}
        </Text>
      </View>
    );
  }

  return children;
}

export const designTokens = {
  image:
    'https://www.figma.com/api/mcp/asset/3c703ee5-3d9f-43e9-a8de-1fbe633b823c',
};

const styles = StyleSheet.create({
  brandRight: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
},

  screenRoot: {
  flex: 1,
},

scrollContent: {
  flexGrow: 1,
  paddingTop: 24,
  paddingBottom: 140,
},

screenContent: {
  paddingTop: 24,
  paddingBottom: 140,
},
  brandHeader: {
    minHeight: 64,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoRing: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 2,
  },
  brandTitle: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '800',
  },
  brandSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  pageIntro: {
    gap: 4,
    marginBottom: 18,
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  pageTitle: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '800',
  },
  pageSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionHeader: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
  },
  sectionAction: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  button: {
    minHeight: 52,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '800',
  },
  inputShell: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 15,
    zIndex: 1,
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  inputIconRight: {
    position: 'absolute',
    right: 16,
    top: 15,
    zIndex: 1,
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  input: {
    minHeight: 54,
    paddingHorizontal: 17,
    borderWidth: 1,
    borderRadius: 12,
    fontSize: 14,
    lineHeight: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  inputWithLeftIcon: {
    paddingLeft: 48,
  },
  inputWithRightIcon: {
    paddingRight: 48,
  },
  multilineInput: {
    minHeight: 112,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  chipRow: {
    gap: 10,
    paddingRight: 16,
    paddingVertical: 2,
  },
  chip: {
    minHeight: 40,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 2,
  },
  stateWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  stateCard: {
    gap: 6,
    padding: 16,
    borderWidth: 1,
    borderRadius: 16,
  },
  stateTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
  },
  stateText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
