import React from 'react';
import {Image, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {getListingImages} from '../../../utils/listingFormatters';

export function ListingImageGallery({listing, selectedIndex, onSelectIndex}) {
  const images = getListingImages(listing);
  const selected = images[selectedIndex] || images[0];
  const source = typeof selected === 'string' ? {uri: selected} : selected;

  return (
    <View style={styles.wrap}>
      <Image source={source} style={styles.hero} />
      <View style={styles.counter}>
        <Text style={styles.counterText}>{selectedIndex + 1}/{images.length}</Text>
      </View>
      {images.length > 1 ? (
        <ScrollView horizontal contentContainerStyle={styles.thumbs} showsHorizontalScrollIndicator={false}>
          {images.map((image, index) => (
            <Pressable
              key={`${typeof image === 'string' ? image : 'placeholder'}-${index}`}
              onPress={() => onSelectIndex(index)}
              style={[styles.thumbWrap, index === selectedIndex && styles.thumbActive]}>
              <Image source={typeof image === 'string' ? {uri: image} : image} style={styles.thumb} />
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {gap: 10},
  hero: {width: '100%', height: 340, borderRadius: 0, backgroundColor: '#E2E8F0'},
  counter: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(15,23,42,0.78)',
  },
  counterText: {color: '#FFFFFF', fontSize: 12, fontWeight: '900'},
  thumbs: {gap: 10, paddingHorizontal: 16},
  thumbWrap: {borderWidth: 2, borderColor: 'transparent', borderRadius: 12},
  thumbActive: {borderColor: '#4F46E5'},
  thumb: {width: 82, height: 82, borderRadius: 10, backgroundColor: '#E2E8F0'},
});
