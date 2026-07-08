import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {
  mdiAlertCircleOutline,
  mdiFilterOffOutline,
  mdiMagnify,
  mdiStarOutline,
  mdiViewGridPlusOutline,
} from '@mdi/js';
import {MdiIcon} from '../ui/MdiIcon';

const STATE_COPY = {
  empty: {
    icon: mdiViewGridPlusOutline,
    title: 'Henuz topluluk yok.',
    description: 'Ilk kampus toplulugunu olusturarak baslayabilirsin.',
  },
  search: {
    icon: mdiMagnify,
    title: 'Aramanla eslesen topluluk bulunamadi.',
    description: 'Farkli bir kelime veya kategori deneyebilirsin.',
  },
  filter: {
    icon: mdiFilterOffOutline,
    title: 'Sectigin filtrelere uygun topluluk bulunamadi.',
    description: 'Filtreleri temizleyerek tekrar dene.',
  },
  error: {
    icon: mdiAlertCircleOutline,
    title: 'Topluluklar yuklenemedi.',
    description: 'Baglanti veya yetki durumunu kontrol et.',
  },
  recommendation: {
    icon: mdiStarOutline,
    title: 'Onerilen topluluk bulunamadi.',
    description: 'Yeni topluluklar eklendikce burada gorunecek.',
  },
};

export function CommunityEmptyState({
  type = 'empty',
  title,
  description,
  actionLabel,
  onAction,
  theme,
}) {
  const copy = STATE_COPY[type] || STATE_COPY.empty;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
        },
      ]}>
      <View style={[styles.iconWrap, {backgroundColor: theme.colors.primarySoft}]}>
        <MdiIcon path={copy.icon} size={28} color={theme.colors.primary} />
      </View>
      <Text style={[styles.title, {color: theme.colors.text}]}>
        {title || copy.title}
      </Text>
      <Text style={[styles.description, {color: theme.colors.mutedText}]}>
        {description || copy.description}
      </Text>
      {actionLabel ? (
        <Pressable
          onPress={onAction}
          style={[styles.button, {backgroundColor: theme.colors.primary}]}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: 9,
    padding: 22,
    borderWidth: 1,
    borderRadius: 18,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  iconWrap: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  title: {
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '900',
  },
  description: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  button: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    paddingHorizontal: 18,
    borderRadius: 13,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
