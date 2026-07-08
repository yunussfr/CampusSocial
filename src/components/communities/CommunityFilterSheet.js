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
  mdiFilterVariant,
  mdiLockOpenOutline,
  mdiStarOutline,
} from '@mdi/js';
import {MdiIcon} from '../ui/MdiIcon';
import {
  COMMUNITY_SORT_OPTIONS,
  DEFAULT_COMMUNITY_FILTERS,
} from '../../utils/communityCategories';

function toggleArrayItem(values, value) {
  return values.includes(value)
    ? values.filter(item => item !== value)
    : [...values, value];
}

function Choice({label, selected, onPress, color}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{selected}}
      onPress={onPress}
      style={({pressed}) => [
        styles.choice,
        selected && {borderColor: color, backgroundColor: `${color}14`},
        pressed && styles.pressed,
      ]}>
      <Text
        numberOfLines={1}
        style={[styles.choiceText, selected && {color, fontWeight: '900'}]}>
        {label}
      </Text>
      {selected ? (
        <View style={[styles.choiceCheck, {backgroundColor: color}]}>
          <MdiIcon path={mdiCheck} size={13} color="#FFFFFF" />
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

function ToggleRow({disabled, icon, title, description, value, onChange}) {
  return (
    <View style={[styles.toggleRow, disabled && styles.disabledRow]}>
      <View style={styles.toggleTextWrap}>
        <MdiIcon path={icon} size={22} color={disabled ? '#94A3B8' : '#475569'} />
        <View style={styles.toggleCopy}>
          <Text style={[styles.toggleTitle, disabled && styles.disabledText]}>
            {title}
          </Text>
          {description ? (
            <Text style={styles.toggleDescription}>{description}</Text>
          ) : null}
        </View>
      </View>
      <Switch disabled={disabled} onValueChange={onChange} value={!disabled && value} />
    </View>
  );
}

export function CommunityFilterSheet({
  visible,
  draftFilters,
  onChange,
  onApply,
  onClear,
  onClose,
  categories,
  supportedFilters,
  theme,
}) {
  const filters = draftFilters || DEFAULT_COMMUNITY_FILTERS;
  const color = theme.colors.primary;

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
          <View style={[styles.sheet, {backgroundColor: theme.colors.surface}]}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={[styles.title, {color: theme.colors.text}]}>
                Topluluk Filtreleri
              </Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <MdiIcon path={mdiClose} size={24} color="#475569" />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionLeft}>
                  <MdiIcon path={mdiFilterVariant} size={22} color={theme.colors.text} />
                  <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
                    Uye Siniri
                  </Text>
                </View>
                <Text style={[styles.rangeLabel, {color: theme.colors.text}]}>
                  {filters.minMembers || '0'} - {filters.maxMembers || '300+'}
                </Text>
              </View>
              <View style={styles.rangeRow}>
                <TextInput
                  keyboardType="number-pad"
                  onChangeText={value => patchFilters({minMembers: value})}
                  placeholder="Minimum uye"
                  placeholderTextColor="#94A3B8"
                  style={styles.rangeInput}
                  value={String(filters.minMembers)}
                />
                <TextInput
                  keyboardType="number-pad"
                  onChangeText={value => patchFilters({maxMembers: value})}
                  placeholder="Maksimum uye"
                  placeholderTextColor="#94A3B8"
                  style={styles.rangeInput}
                  value={String(filters.maxMembers)}
                />
              </View>

              <View style={styles.categoryPanel}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
                    Kategoriler
                  </Text>
                  <Text style={[styles.selectedCount, {color}]}>
                    {filters.categoryKeys.length} secildi
                  </Text>
                </View>
                <View style={styles.choicesWrap}>
                  {categories.map(category => (
                    <Choice
                      key={category.key}
                      color={category.color || color}
                      label={category.label}
                      selected={filters.categoryKeys.includes(category.key)}
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
              </View>

              <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>Sirala</Text>
              <View style={styles.sortChoices}>
                {COMMUNITY_SORT_OPTIONS.map(option => (
                  <SortChoice
                    key={option.key}
                    option={option}
                    selected={filters.sortKey === option.key}
                    onPress={() => patchFilters({sortKey: option.key})}
                  />
                ))}
              </View>

              <View style={styles.toggleGroup}>
                <ToggleRow
                  disabled={!supportedFilters?.joinOpenOnly}
                  icon={mdiLockOpenOutline}
                  title="Sadece katilima acik topluluklar"
                  description={
                    supportedFilters?.joinOpenOnly
                      ? undefined
                      : 'Veri modelinde yalnizca ozel/acik bilgisi var.'
                  }
                  value={filters.joinOpenOnly}
                  onChange={value => patchFilters({joinOpenOnly: value})}
                />
                <View style={styles.divider} />
                <ToggleRow
                  icon={mdiStarOutline}
                  title="Onerilenleri goster"
                  value={filters.recommendedOnly}
                  onChange={value => patchFilters({recommendedOnly: value})}
                />
                {supportedFilters?.excludeJoined ? (
                  <>
                    <View style={styles.divider} />
                    <ToggleRow
                      icon={mdiFilterVariant}
                      title="Katilmadigim topluluklar"
                      value={filters.excludeJoined}
                      onChange={value => patchFilters({excludeJoined: value})}
                    />
                  </>
                ) : null}
              </View>
            </ScrollView>

            <View style={styles.actions}>
              <Pressable onPress={onClear} style={styles.secondaryButton}>
                <Text style={styles.secondaryText}>Temizle</Text>
              </Pressable>
              <Pressable onPress={onApply} style={styles.primaryWrap}>
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.accent]}
                  style={styles.primaryButton}>
                  <Text style={styles.primaryText}>Filtreyi Uygula</Text>
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
    backgroundColor: 'rgba(2,6,23,0.58)',
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
    fontSize: 25,
    fontWeight: '900',
  },
  closeButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  sectionHeader: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 16,
    marginBottom: 10,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  rangeLabel: {
    fontSize: 16,
    fontWeight: '900',
  },
  rangeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rangeInput: {
    flex: 1,
    minHeight: 56,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#D8E0EC',
    borderRadius: 14,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  categoryPanel: {
    marginTop: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  selectedCount: {
    fontSize: 13,
    fontWeight: '900',
  },
  choicesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  choice: {
    minHeight: 44,
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#D8E0EC',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  choiceText: {
    maxWidth: 230,
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  choiceCheck: {
    width: 19,
    height: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
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
  disabledRow: {
    opacity: 0.68,
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
  disabledText: {
    color: '#64748B',
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
