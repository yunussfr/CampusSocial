import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {
  mdiAlertCircleOutline,
  mdiFilterOffOutline,
  mdiMagnifyClose,
  mdiPackageVariantClosed,
} from '@mdi/js';
import {MdiIcon} from '../ui/MdiIcon';

const EMPTY_COPY = {
  empty: {
    icon: mdiPackageVariantClosed,
    title: 'Henüz ilan yok.',
    description: 'Kampüs markette ilk ilanı sen oluşturabilirsin.',
  },
  search: {
    icon: mdiMagnifyClose,
    title: 'Aramanla eşleşen ilan bulunamadı.',
    description: 'Farklı bir kelime veya kategori deneyebilirsin.',
  },
  filter: {
    icon: mdiFilterOffOutline,
    title: 'Seçtiğin filtrelere uygun ilan bulunamadı.',
    description: 'Filtreleri temizleyerek daha fazla ilan görebilirsin.',
  },
  error: {
    icon: mdiAlertCircleOutline,
    title: 'İlanlar yüklenemedi.',
    description: 'Bir süre sonra tekrar dene.',
  },
};

export function MarketEmptyState({
  type = 'empty',
  title,
  description,
  actionLabel,
  onAction,
}) {
  const copy = EMPTY_COPY[type] || EMPTY_COPY.empty;
  const isError = type === 'error';

  return (
    <View style={styles.wrap}>
      <View style={[styles.iconWrap, isError && styles.errorIconWrap]}>
        <MdiIcon
          path={copy.icon}
          size={34}
          color={isError ? '#DC2626' : '#2563EB'}
        />
      </View>
      <Text style={styles.title}>{title || copy.title}</Text>
      <Text style={styles.description}>{description || copy.description}</Text>

      {actionLabel ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={styles.button}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: 42,
    paddingHorizontal: 24,
  },
  iconWrap: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
  },
  errorIconWrap: {
    backgroundColor: '#FEF2F2',
  },
  title: {
    marginTop: 16,
    color: '#0F172A',
    fontSize: 19,
    fontWeight: '900',
    textAlign: 'center',
  },
  description: {
    maxWidth: 310,
    marginTop: 7,
    color: '#64748B',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
    textAlign: 'center',
  },
  button: {
    marginTop: 17,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#2563EB',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
