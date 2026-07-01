import React, { useEffect } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import { EventCard } from '../../components/events/EventCard';
import { IconButton } from '../../components/ui/IconButton';
import {
  AppButton,
  AppInput,
  BrandHeader,
  ChipRow,
  PageIntro,
  Screen,
  SectionHeader,
  StateView,
} from '../../components/ui/DesignSystem';
import { ICONS } from '../../constants/assets';
import { ROUTES } from '../../constants/routes';
import { useEvents } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';

export function DiscoverScreen({ navigation }) {
  const { profile } = useAuth();
  const {
    events,
    error,
    loading,
    selectEvent,
    startEventsListener,
  } = useEvents();

  useEffect(() => {
    const unsubscribe = startEventsListener();

    return unsubscribe;
  }, [startEventsListener]);

  return (
    <>
      <BrandHeader
        action={
          <IconButton
            accessibilityLabel="Bildirimler"
            icon={ICONS.bell}
            onPress={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
            size={22}
          />
        }
      />
      <Screen padded={false}>
        <FlatList
          contentContainerStyle={styles.listContent}
          data={events}
          keyExtractor={item => item.id}
          ListHeaderComponent={
            <>
              <PageIntro
                title={`Gunaydin, ${profile?.displayName || 'Campus'}`}
                subtitle="Bugun kampuste neler oluyor kesfet."
              />
              <AppInput
                editable={false}
                leftIcon={ICONS.search}
                pointerEvents="none"
                placeholder="Etkinlik, topluluk veya mekan ara..."
              />
              <ChipRow
                activeItem="Tumu"
                items={['Tumu', 'Konser', 'Seminer', 'Spor', 'Atolye']}
              />
              <SectionHeader
                action="Olustur"
                onAction={() => navigation.navigate(ROUTES.CREATE_EVENT)}
                title="Yaklasan Etkinlikler"
              />
              <StateView
                error={error}
                loading={loading && events.length === 0}
                title="Etkinlikler yukleniyor..."
              />
            </>
          }
          ListEmptyComponent={
            !loading && !error ? (
              <StateView empty title="Henuz aktif etkinlik yok." />
            ) : null
          }
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={() => {
                selectEvent(item);
                navigation.navigate(ROUTES.EVENT_DETAIL, { eventId: item.id });
              }}
            />
          )}
        />
        <Pressable style={styles.fab}>
          <AppButton onPress={() => navigation.navigate(ROUTES.CREATE_EVENT)}>
            Etkinlik Olustur
          </AppButton>
        </Pressable>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  listContent: {
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 120,
    paddingTop: 16,
  },
  fab: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 82,
  },
});
