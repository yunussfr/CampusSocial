import React from 'react';
import {Image, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {mdiClose, mdiPlus} from '@mdi/js';
import {MdiIcon} from '../../ui/MdiIcon';
import {LISTING_MAX_PHOTOS} from '../../../constants/listingOptions';

export function ListingPhotoPicker({assets, onPick, onRemove, errorText}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Fotograflar</Text>
        <Text style={styles.count}>{assets.length}/{LISTING_MAX_PHOTOS}</Text>
      </View>
      <ScrollView horizontal contentContainerStyle={styles.row} showsHorizontalScrollIndicator={false}>
        {assets.map((asset, index) => (
          <View key={`${asset.uri}-${index}`} style={styles.photoWrap}>
            <Image source={{uri: asset.uri}} style={styles.photo} />
            {index === 0 ? <Text style={styles.coverLabel}>Kapak</Text> : null}
            <Pressable onPress={() => onRemove(index)} style={styles.remove}>
              <MdiIcon path={mdiClose} size={15} color="#0F172A" />
            </Pressable>
          </View>
        ))}
        {assets.length < LISTING_MAX_PHOTOS ? (
          <Pressable onPress={onPick} style={styles.addBox}>
            <MdiIcon path={mdiPlus} size={30} color="#475569" />
            <Text style={styles.addText}>Ekle</Text>
          </Pressable>
        ) : null}
      </ScrollView>
      <Text style={styles.helper}>En fazla {LISTING_MAX_PHOTOS} fotograf yukleyebilirsiniz.</Text>
      {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {gap: 10},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  title: {color: '#0F172A', fontSize: 16, fontWeight: '900'},
  count: {color: '#64748B', fontSize: 12, fontWeight: '800'},
  row: {gap: 10, paddingRight: 16},
  photoWrap: {width: 104, height: 104, overflow: 'hidden', borderRadius: 14, backgroundColor: '#E2E8F0'},
  photo: {width: '100%', height: '100%'},
  coverLabel: {
    position: 'absolute',
    left: 7,
    bottom: 7,
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 999,
    color: '#FFFFFF',
    backgroundColor: 'rgba(15,23,42,0.72)',
    fontSize: 10,
    fontWeight: '900',
  },
  remove: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  addBox: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1.2,
    borderStyle: 'dashed',
    borderColor: '#94A3B8',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  addText: {color: '#475569', fontSize: 12, fontWeight: '800'},
  helper: {color: '#64748B', fontSize: 12, fontWeight: '600'},
  error: {color: '#DC2626', fontSize: 12, fontWeight: '700'},
});
