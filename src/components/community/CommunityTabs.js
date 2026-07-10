import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

export const COMMUNITY_DETAIL_TABS = [
  {id: 'posts', label: 'Gönderiler'},
  {id: 'about', label: 'Hakkında'},
  {id: 'members', label: 'Üyeler'},
];

export function CommunityTabs({activeTab, onChangeTab, theme}) {
  return (
    <View style={[styles.root, {borderBottomColor: theme.colors.border}]}>
      {COMMUNITY_DETAIL_TABS.map(tab => {
        const active = activeTab === tab.id;

        return (
          <Pressable
            accessibilityRole="button"
            key={tab.id}
            onPress={() => onChangeTab(tab.id)}
            style={styles.tab}>
            <Text
              style={[
                styles.label,
                {color: active ? theme.colors.primary : theme.colors.mutedText},
              ]}>
              {tab.label}
            </Text>
            <View
              style={[
                styles.indicator,
                {backgroundColor: active ? theme.colors.primary : 'transparent'},
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    minHeight: 50,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 11,
  },
  label: {
    fontSize: 14,
    fontWeight: '900',
  },
  indicator: {
    width: '100%',
    height: 3,
    borderRadius: 2,
  },
});
