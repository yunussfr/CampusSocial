import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  mdiCheck,
  mdiClose,
  mdiGiftOutline,
  mdiMapMarkerOutline,
} from '@mdi/js';
import {MdiIcon} from '../ui/MdiIcon';
import {
  DEFAULT_MARKET_FILTERS,
  MARKET_CONDITIONS,
  MARKET_SORT_OPTIONS,
  MARKET_STATUSES,
} from '../../utils/marketCategories';

function toggleArrayItem(values, value) {
  return values.includes(value)
    ? values.filter(item => item !== value)
    : [...values, value];
}

function Choice({label, selected, onPress, wide}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{selected}}
      onPress={onPress}
      style={({pressed}) => [
        styles.choice,
        wide && styles.choiceWide,
        selected && styles.choiceSelected,
        pressed && styles.pressed,
      ]}>
      <Text
        numberOfLines={1}
        style={[styles.choiceText, selected && styles.choiceTextSelected]}>
        {label}
      </Text>
      {selected ? (
        <View style={styles.choiceCheck}>
          <MdiIcon path={mdiCheck} size={14} color="#FFFFFF" />
        </View>
      ) : null}
    </Pressable>
  );
}

function SortChoice({option, selected, onPress}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{selected}}
      onPress={onPress}
      style={({pressed}) => [
        styles.sortChoice,
        selected && styles.sortChoiceSelected,
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.sortText, selected && styles.sortTextSelected]}>
        {option.label}
      </Text>
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
    </Pressable>
  );
}

export function MarketFilterSheet({
  visible,
  mode = 'filter',
  draftFilters,
  onChange,
  onApply,
  onClear,
  onClose,
  categories,
  campusFilterSupported,
}) {
  const filters = draftFilters || DEFAULT_MARKET_FILTERS;
  const sortOnly = mode === 'sort';

  function patchFilters(patch) {
    onChange({...filters, ...patch});
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardWrap}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={styles.title}>
                {sortOnly ? 'Market Sıralama' : 'Market Filtreleri'}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={onClose}
                style={styles.closeButton}>
                <MdiIcon path={mdiClose} size={24} color="#475569" />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              {!sortOnly ? (
                <>
                  <Text style={styles.sectionTitle}>Fiyat Aralığı</Text>
                  <View style={styles.priceRow}>
                    <View style={styles.priceBox}>
                      <Text style={styles.priceLabel}>Min</Text>
                      <TextInput
                        keyboardType="decimal-pad"
                        onChangeText={value => patchFilters({minPrice: value})}
                        placeholder="0"
                        placeholderTextColor="#94A3B8"
                        style={styles.priceInput}
                        value={String(filters.minPrice)}
                      />
                      <Text style={styles.currency}>TRY</Text>
                    </View>
                    <Text style={styles.priceDash}>-</Text>
                    <View style={styles.priceBox}>
                      <Text style={styles.priceLabel}>Max</Text>
                      <TextInput
                        keyboardType="decimal-pad"
                        onChangeText={value => patchFilters({maxPrice: value})}
                        placeholder="5000+"
                        placeholderTextColor="#94A3B8"
                        style={styles.priceInput}
                        value={String(filters.maxPrice)}
                      />
                      <Text style={styles.currency}>TRY</Text>
                    </View>
                  </View>

                  <Text style={styles.sectionTitle}>Kategoriler</Text>
                  <View style={styles.choicesWrap}>
                    {categories.map(category => (
                      <Choice
                        key={category.key}
                        label={category.label}
                        selected={filters.categoryKeys.includes(category.key)}
                        wide
                        onPress={() =>
                          patchFilters({
                            categoryKeys: toggleArrayItem(
                              filters.categoryKeys,
                              category.key,
                            ),
                          })
                        }
                      />
                    ))}
                  </View>

                  <Text style={styles.sectionTitle}>Durum</Text>
                  <View style={styles.choicesWrap}>
                    {MARKET_CONDITIONS.map(condition => (
                      <Choice
                        key={condition.key}
                        label={condition.label}
                        selected={filters.conditionKeys.includes(condition.key)}
                        onPress={() =>
                          patchFilters({
                            conditionKeys: toggleArrayItem(
                              filters.conditionKeys,
                              condition.key,
                            ),
                          })
                        }
                      />
                    ))}
                  </View>

                  <Text style={styles.sectionTitle}>İlan Durumu</Text>
                  <View style={styles.choicesWrap}>
                    {MARKET_STATUSES.map(status => (
                      <Choice
                        key={status.key}
                        label={status.label}
                        selected={filters.statusKeys.includes(status.key)}
                        onPress={() =>
                          patchFilters({
                            statusKeys: toggleArrayItem(
                              filters.statusKeys,
                              status.key,
                            ),
                          })
                        }
                      />
                    ))}
                  </View>
                </>
              ) : null}

              <Text style={styles.sectionTitle}>Sıralama</Text>
              <View style={styles.sortChoices}>
                {MARKET_SORT_OPTIONS.map(option => (
                  <SortChoice
                    key={option.key}
                    option={option}
                    selected={filters.sortKey === option.key}
                    onPress={() => patchFilters({sortKey: option.key})}
                  />
                ))}
              </View>

              {!sortOnly ? (
                <View style={styles.toggleGroup}>
                  <View style={styles.toggleRow}>
                    <View style={styles.toggleTextWrap}>
                      <MdiIcon
                        path={mdiMapMarkerOutline}
                        size={22}
                        color={campusFilterSupported ? '#475569' : '#94A3B8'}
                      />
                      <View style={styles.toggleCopy}>
                        <Text style={styles.toggleTitle}>
                          Sadece kampüs içi ilanlar
                        </Text>
                        {!campusFilterSupported ? (
                          <Text style={styles.toggleDescription}>
                            Bu veri modeli henüz her ilanda yok.
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    <Switch
                      disabled={!campusFilterSupported}
                      onValueChange={value => patchFilters({campusOnly: value})}
                      value={campusFilterSupported && filters.campusOnly}
                    />
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.toggleRow}>
                    <View style={styles.toggleTextWrap}>
                      <MdiIcon path={mdiGiftOutline} size={22} color="#475569" />
                      <Text style={styles.toggleTitle}>
                        Sadece ücretsiz ilanlar
                      </Text>
                    </View>
                    <Switch
                      onValueChange={value => patchFilters({freeOnly: value})}
                      value={filters.freeOnly}
                    />
                  </View>
                </View>
              ) : null}
            </ScrollView>

            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                onPress={onClear}
                style={styles.secondaryButton}>
                <Text style={styles.secondaryText}>Temizle</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={onApply}
                style={styles.primaryWrap}>
                <LinearGradient
                  colors={['#2563EB', '#1D4ED8']}
                  style={styles.primaryButton}>
                  <Text style={styles.primaryText}>
                    {sortOnly ? 'Sıralamayı Uygula' : 'Sonuçları Göster'}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(2,6,23,0.62)',
  },
  keyboardWrap: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '92%',
    overflow: 'hidden',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#FFFFFF',
  },
  handle: {
    width: 54,
    height: 5,
    alignSelf: 'center',
    marginTop: 10,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 13,
    paddingBottom: 10,
  },
  title: {
    flex: 1,
    color: '#0F172A',
    fontSize: 25,
    fontWeight: '900',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  sectionTitle: {
    marginTop: 19,
    marginBottom: 11,
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  priceBox: {
    flex: 1,
    minHeight: 67,
    paddingHorizontal: 13,
    paddingTop: 8,
    borderWidth: 1,
    borderColor: '#D8E0EC',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  priceLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
  },
  priceInput: {
    paddingVertical: 3,
    paddingRight: 36,
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '900',
  },
  currency: {
    position: 'absolute',
    right: 12,
    bottom: 14,
    color: '#475569',
    fontSize: 11,
    fontWeight: '900',
  },
  priceDash: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '800',
  },
  choicesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  choice: {
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#D8E0EC',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  choiceWide: {
    maxWidth: '100%',
  },
  choiceSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  choiceText: {
    maxWidth: 220,
    color: '#475569',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  choiceTextSelected: {
    color: '#1D4ED8',
    fontWeight: '900',
  },
  choiceCheck: {
    width: 19,
    height: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#2563EB',
  },
  sortChoices: {
    gap: 9,
  },
  sortChoice: {
    minHeight: 49,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#D8E0EC',
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },
  sortChoiceSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  sortText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },
  sortTextSelected: {
    color: '#1D4ED8',
    fontWeight: '900',
  },
  radioOuter: {
    width: 21,
    height: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    borderRadius: 11,
  },
  radioOuterSelected: {
    borderColor: '#2563EB',
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#2563EB',
  },
  toggleGroup: {
    marginTop: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 15,
    backgroundColor: '#F8FAFC',
  },
  toggleRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  toggleTextWrap: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  toggleCopy: {
    flex: 1,
  },
  toggleTitle: {
    color: '#1E293B',
    fontSize: 13,
    fontWeight: '800',
  },
  toggleDescription: {
    marginTop: 3,
    color: '#64748B',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginLeft: 46,
    backgroundColor: '#E2E8F0',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 18,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  secondaryButton: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: '#BFD0FF',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  secondaryText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '900',
  },
  primaryWrap: {
    flex: 1.25,
    overflow: 'hidden',
    borderRadius: 14,
  },
  primaryButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.78,
  },
});
