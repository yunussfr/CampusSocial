import React, {useEffect, useMemo, useRef} from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
  getFocusedRouteNameFromRoute,
  StackActions,
} from '@react-navigation/native';

import {
  mdiAccount,
  mdiAccountGroup,
  mdiAccountGroupOutline,
  mdiAccountOutline,
  mdiBellOutline,
  mdiCompass,
  mdiCompassOutline,
  mdiHub,
  mdiHubOutline,
  mdiMessageText,
  mdiMessageTextOutline,
  mdiShopping,
  mdiShoppingOutline,
} from '@mdi/js';

import {ROUTES} from '../constants/routes';
import {IMAGES} from '../constants/assets';

import {useAuth} from '../context/AuthContext';
import {useChats} from '../context/ChatContext';
import {useTheme} from '../context/ThemeContext';

import {IconButton} from '../components/ui/IconButton';
import {MdiIcon} from '../components/ui/MdiIcon';

import {ForgotPasswordScreen} from '../screens/auth/ForgotPasswordScreen';
import {LoginScreen} from '../screens/auth/LoginScreen';
import {ProfileCompletionScreen} from '../screens/auth/ProfileCompletionScreen';
import {RegisterScreen} from '../screens/auth/RegisterScreen';

import {ChatDetailScreen} from '../screens/chat/ChatDetailScreen';
import {ChatListScreen} from '../screens/chat/ChatListScreen';

import {CommunityDetailScreen} from '../screens/communities/CommunityDetailScreen';
import {CommunityListScreen} from '../screens/communities/CommunityListScreen';
import {CreateCommunityScreen} from '../screens/communities/CreateCommunityScreen';
import {PostDetailScreen} from '../screens/communities/PostDetailScreen';

import {CreateEventScreen} from '../screens/events/CreateEventScreen';
import {DiscoverScreen} from '../screens/events/DiscoverScreen';
import {EventDetailScreen} from '../screens/events/EventDetailScreen';

import {HubScreen} from '../screens/hub/HubScreen';
import {MyCommunitiesScreen} from '../screens/hub/MyCommunitiesScreen';
import {MyEventsScreen} from '../screens/hub/MyEventsScreen';

import {CreateListingScreen} from '../screens/market/CreateListingScreen';
import {ListingDetailScreen} from '../screens/market/ListingDetailScreen';
import {MarketHomeScreen} from '../screens/market/MarketHomeScreen';
import {MyListingsScreen} from '../screens/market/MyListingsScreen';

import {EditProfileScreen} from '../screens/profile/EditProfileScreen';
import {FollowConnectionsScreen} from '../screens/profile/FollowConnectionsScreen';
import {ProfileScreen} from '../screens/profile/ProfileScreen';
import {UserProfileScreen} from '../screens/profile/UserProfileScreen';

import {NotificationsScreen} from '../screens/settings/NotificationsScreen';
import {SavedItemsScreen} from '../screens/settings/SavedItemsScreen';
import {SettingsScreen} from '../screens/settings/SettingsScreen';

const AuthStack = createNativeStackNavigator();
const EventsStack = createNativeStackNavigator();
const CommunitiesStack = createNativeStackNavigator();
const MarketStack = createNativeStackNavigator();
const ChatStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const HubStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  HubTab: {
    active: mdiHub,
    inactive: mdiHubOutline,
  },

  EventsTab: {
    active: mdiCompass,
    inactive: mdiCompassOutline,
  },

  CommunitiesTab: {
    active: mdiAccountGroup,
    inactive: mdiAccountGroupOutline,
  },

  MarketTab: {
    active: mdiShopping,
    inactive: mdiShoppingOutline,
  },

  ChatTab: {
    active: mdiMessageText,
    inactive: mdiMessageTextOutline,
  },

  ProfileTab: {
    active: mdiAccount,
    inactive: mdiAccountOutline,
  },
};

const HIDDEN_TAB_SCREENS = [
  ROUTES.CHAT_DETAIL,
  ROUTES.CREATE_EVENT,
  ROUTES.CREATE_COMMUNITY,
  ROUTES.CREATE_LISTING,
  ROUTES.EDIT_PROFILE,
];

const TAB_INITIAL_ROUTES = {
  HubTab: ROUTES.HUB,
  EventsTab: ROUTES.DISCOVER,
  CommunitiesTab: ROUTES.COMMUNITY_LIST,
  MarketTab: ROUTES.MARKET_HOME,
  ChatTab: ROUTES.CHAT_LIST,
  ProfileTab: ROUTES.PROFILE,
};

function createTabResetListeners(initialRouteName) {
  return ({navigation, route}) => ({
    tabPress: event => {
      event.preventDefault();

      const nestedStackKey = route.state?.key;
      const nestedRouteCount = route.state?.routes?.length || 0;

      if (nestedStackKey && nestedRouteCount > 1) {
        navigation.dispatch({
          ...StackActions.popToTop(),
          target: nestedStackKey,
        });
      }

      navigation.navigate(route.name, {
        screen: initialRouteName,
      });
    },
  });
}

export function RootNavigator() {
  const {
    initializing,
    isProfileComplete,
    profileLoading,
    user,
  } = useAuth();

  if (initializing || profileLoading) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator />

        <Text style={styles.loadingText}>
          Oturum kontrol ediliyor...
        </Text>
      </View>
    );
  }

  if (!user) {
    return <AuthNavigator />;
  }

  if (!isProfileComplete) {
    return <ProfileCompletionScreen />;
  }

  return <MainTabs />;
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <AuthStack.Screen
        name={ROUTES.LOGIN}
        component={LoginScreen}
      />

      <AuthStack.Screen
        name={ROUTES.REGISTER}
        component={RegisterScreen}
      />

      <AuthStack.Screen
        name={ROUTES.FORGOT_PASSWORD}
        component={ForgotPasswordScreen}
      />
    </AuthStack.Navigator>
  );
}

function HubNavigator() {
  const screenOptions = useStackOptions();

  return (
    <HubStack.Navigator screenOptions={screenOptions}>
      <HubStack.Screen
        name={ROUTES.HUB}
        component={HubScreen}
        options={{
          headerShown: false,
        }}
      />

      <HubStack.Screen
        name={ROUTES.MY_EVENTS}
        component={MyEventsScreen}
        options={{
          title: 'Katıldığım Etkinlikler',
        }}
      />

      <HubStack.Screen
        name={ROUTES.MY_COMMUNITIES}
        component={MyCommunitiesScreen}
        options={{
          title: 'Topluluklarım',
        }}
      />
    </HubStack.Navigator>
  );
}

function EventsNavigator() {
  const screenOptions = useStackOptions();

  return (
    <EventsStack.Navigator screenOptions={screenOptions}>
      <EventsStack.Screen
        name={ROUTES.DISCOVER}
        component={DiscoverScreen}
        options={{
          headerShown: false,
        }}
      />

      <EventsStack.Screen
        name={ROUTES.EVENT_DETAIL}
        component={EventDetailScreen}
        options={{
          title: 'Etkinlik Detayı',
        }}
      />

      <EventsStack.Screen
        name={ROUTES.CREATE_EVENT}
        component={CreateEventScreen}
        options={{
          headerShown: false,
          title: 'Etkinlik Oluştur',
        }}
      />

      <EventsStack.Screen
        name={ROUTES.NOTIFICATIONS}
        component={NotificationsScreen}
        options={{
          title: 'Bildirimler',
        }}
      />
    </EventsStack.Navigator>
  );
}

function CommunitiesNavigator() {
  const screenOptions = useStackOptions();

  return (
    <CommunitiesStack.Navigator
      screenOptions={screenOptions}>
      <CommunitiesStack.Screen
        name={ROUTES.COMMUNITY_LIST}
        component={CommunityListScreen}
        options={{
          headerShown: false,
        }}
      />

      <CommunitiesStack.Screen
        name={ROUTES.COMMUNITY_DETAIL}
        component={CommunityDetailScreen}
        options={{
          headerShown: false,
        }}
      />

      <CommunitiesStack.Screen
        name={ROUTES.CREATE_COMMUNITY}
        component={CreateCommunityScreen}
        options={{
          headerShown: false,
        }}
      />

      <CommunitiesStack.Screen
        name={ROUTES.POST_DETAIL}
        component={PostDetailScreen}
        options={{
          headerShown: false,
        }}
      />

      <CommunitiesStack.Screen
        name={ROUTES.NOTIFICATIONS}
        component={NotificationsScreen}
        options={{
          title: 'Bildirimler',
        }}
      />
    </CommunitiesStack.Navigator>
  );
}

function MarketNavigator() {
  const screenOptions = useStackOptions();

  return (
    <MarketStack.Navigator screenOptions={screenOptions}>
      <MarketStack.Screen
        name={ROUTES.MARKET_HOME}
        component={MarketHomeScreen}
        options={{
          headerShown: false,
        }}
      />

      <MarketStack.Screen
        name={ROUTES.CREATE_LISTING}
        component={CreateListingScreen}
        options={{
          title: 'İlan Oluştur',
        }}
      />

      <MarketStack.Screen
        name={ROUTES.LISTING_DETAIL}
        component={ListingDetailScreen}
        options={{
          title: 'İlan Detayı',
        }}
      />

      <MarketStack.Screen
        name={ROUTES.MY_LISTINGS}
        component={MyListingsScreen}
        options={{
          title: 'İlanlarım',
        }}
      />

      <MarketStack.Screen
        name={ROUTES.CHAT_DETAIL}
        component={ChatDetailScreen}
        options={{
          title: 'Mesaj',
        }}
      />

      <MarketStack.Screen
        name={ROUTES.NOTIFICATIONS}
        component={NotificationsScreen}
        options={{
          title: 'Bildirimler',
        }}
      />
    </MarketStack.Navigator>
  );
}

function ChatNavigator() {
  const screenOptions = useStackOptions();

  return (
    <ChatStack.Navigator screenOptions={screenOptions}>
      <ChatStack.Screen
        name={ROUTES.CHAT_LIST}
        component={ChatListScreen}
        options={{
          headerShown: false,
        }}
      />

      <ChatStack.Screen
        name={ROUTES.CHAT_DETAIL}
        component={ChatDetailScreen}
        options={{
          title: 'Mesaj',
        }}
      />

      <ChatStack.Screen
        name={ROUTES.NOTIFICATIONS}
        component={NotificationsScreen}
        options={{
          title: 'Bildirimler',
        }}
      />
    </ChatStack.Navigator>
  );
}

function ProfileNavigator() {
  const screenOptions = useStackOptions();

  return (
    <ProfileStack.Navigator screenOptions={screenOptions}>
      <ProfileStack.Screen
        name={ROUTES.PROFILE}
        component={ProfileScreen}
        options={{
          title: 'Profil',
        }}
      />

      <ProfileStack.Screen
        name={ROUTES.SETTINGS}
        component={SettingsScreen}
        options={{
          title: 'Ayarlar',
        }}
      />

      <ProfileStack.Screen
        name={ROUTES.SAVED_ITEMS}
        component={SavedItemsScreen}
        options={{
          title: 'Kaydedilenler',
        }}
      />

      <ProfileStack.Screen
        name={ROUTES.EDIT_PROFILE}
        component={EditProfileScreen}
        options={{
          headerShown: false,
          title: 'Profili Düzenle',
        }}
      />

      <ProfileStack.Screen
        name={ROUTES.USER_PROFILE}
        component={UserProfileScreen}
        options={{
          title: 'Kullanıcı Profili',
        }}
      />
      <ProfileStack.Screen
        name={ROUTES.FOLLOW_CONNECTIONS}
        component={FollowConnectionsScreen}
        options={{
          title: 'Takipler',
        }}
      />
      <ProfileStack.Screen
        name={ROUTES.NOTIFICATIONS}
        component={NotificationsScreen}
        options={{
          title: 'Bildirimler',
        }}
      />
    </ProfileStack.Navigator>
  );
}

function MainTabs() {
  const {chats, notifications, startChatsListener, startNotificationsListener} = useChats();
  const {theme} = useTheme();
  const {user} = useAuth();

  useEffect(() => {
    if (!user?.uid) {
      return undefined;
    }

    return startChatsListener(user.uid);
  }, [startChatsListener, user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      return undefined;
    }

    return startNotificationsListener(user.uid);
  }, [startNotificationsListener, user?.uid]);

  const unreadChatCount = useMemo(() => {
    if (!user?.uid) {
      return 0;
    }

    return chats.reduce((total, chat) => {
      return total + Number(chat.unreadCounts?.[user.uid] || 0);
    }, 0);
  }, [chats, user?.uid]);

  const hasUnreadNotifications = useMemo(
    () => notifications.some(item => item.read !== true),
    [notifications],
  );

  return (
    <Tab.Navigator
      screenOptions={({route}) => {
        const selectedIcons = TAB_ICONS[route.name];
        const focusedRouteName = getFocusedRouteNameFromRoute(route);
        const shouldHideTabBar = HIDDEN_TAB_SCREENS.includes(focusedRouteName);

        return {
          headerShown: false,

          tabBarActiveTintColor:
            theme.colors.primary,

          tabBarInactiveTintColor:
            theme.colors.mutedText,

          tabBarLabelStyle: styles.tabLabel,

          tabBarIcon: ({
            focused,
            color,
            size,
          }) => {
            const chatBadgeCount =
              route.name === 'ChatTab' ? unreadChatCount : 0;
            const showProfileBadge =
              route.name === 'ProfileTab' && hasUnreadNotifications;

            return (
              <View
                style={[
                  styles.tabIconWrap,
                  focused &&
                    styles.tabIconWrapActive,
                ]}>
                <MdiIcon
                  path={
                    focused
                      ? selectedIcons.active
                      : selectedIcons.inactive
                  }
                  color={color}
                  size={focused ? size + 1 : size}
                />
                {chatBadgeCount > 0 ? (
                  <PulseBadge count={chatBadgeCount} />
                ) : null}
                {showProfileBadge ? <PulseBadge dot /> : null}
              </View>
            );
          },

          tabBarStyle: shouldHideTabBar
            ? {display: 'none'}
            : [
                styles.tabBar,
                {
                  backgroundColor:
                    theme.mode === 'dark'
                      ? 'rgba(15,27,45,0.94)'
                      : 'rgba(248,249,255,0.94)',

                  borderTopColor:
                    theme.colors.border,
                },
              ],
        };
      }}>
      <Tab.Screen
        name="HubTab"
        component={HubNavigator}
        listeners={createTabResetListeners(TAB_INITIAL_ROUTES.HubTab)}
        options={{
          title: 'Hub',
        }}
      />

      <Tab.Screen
        name="EventsTab"
        component={EventsNavigator}
        listeners={createTabResetListeners(TAB_INITIAL_ROUTES.EventsTab)}
        options={{
          title: 'Discover',
        }}
      />

      <Tab.Screen
        name="CommunitiesTab"
        component={CommunitiesNavigator}
        listeners={createTabResetListeners(TAB_INITIAL_ROUTES.CommunitiesTab)}
        options={{
          title: 'Community',
        }}
      />

      <Tab.Screen
        name="MarketTab"
        component={MarketNavigator}
        listeners={createTabResetListeners(TAB_INITIAL_ROUTES.MarketTab)}
        options={{
          title: 'Market',
        }}
      />

      <Tab.Screen
        name="ChatTab"
        component={ChatNavigator}
        listeners={createTabResetListeners(TAB_INITIAL_ROUTES.ChatTab)}
        options={{
          title: 'Messages',
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        listeners={createTabResetListeners(TAB_INITIAL_ROUTES.ProfileTab)}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

function PulseBadge({count, dot = false}) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.18,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 520,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[
        dot ? styles.pulseDot : styles.pulseBadge,
        {transform: [{scale: pulse}]},
      ]}>
      {!dot ? (
        <Text style={styles.pulseBadgeText}>{count > 99 ? '99+' : count}</Text>
      ) : null}
    </Animated.View>
  );
}

function useStackOptions() {
  const {theme} = useTheme();

  return ({navigation, route}) => ({
    headerStyle: {
      backgroundColor:
        theme.colors.background,
    },

    headerShadowVisible: false,

    headerTintColor:
      theme.colors.text,

    headerTitleStyle: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: '800',
    },

    contentStyle: {
      backgroundColor:
        theme.colors.background,
    },

    headerRight:
      route.name === ROUTES.NOTIFICATIONS ||
      route.name === ROUTES.EDIT_PROFILE
        ? undefined
        : route.name === ROUTES.PROFILE
          ? () => (
              <Pressable
                onPress={() =>
                  navigation.navigate(
                    'EventsTab',
                    {
                      screen:
                        ROUTES.DISCOVER,
                    },
                  )
                }
                style={styles.headerLogoButton}>
                <Image
                  source={IMAGES.brandLogo}
                  style={styles.headerLogo}
                  resizeMode="contain"
                />
              </Pressable>
            )
          : () => (
              <IconButton
                accessibilityLabel="Bildirimler"
                icon={mdiBellOutline}
                onPress={() =>
                  navigation.navigate(
                    ROUTES.NOTIFICATIONS,
                  )
                }
                size={22}
                style={styles.headerBell}
                tintColor={
                  theme.colors.primary
                }
              />
            ),
  });
}

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
    backgroundColor: '#F8FAFC',
  },

  loadingText: {
    color: '#64748B',
    fontSize: 15,
  },

  tabBar: {
    height: 64,
    paddingTop: 8,
    paddingBottom: 8,

    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,

    position: 'absolute',

    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowRadius: 20,

    elevation: 8,
  },

  tabLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },

  tabIconWrap: {
    width: 40,
    height: 32,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 14,
    backgroundColor: 'transparent',
  },

  tabIconWrapActive: {
    backgroundColor: '#FEF3C7',
  },

  pulseBadge: {
    position: 'absolute',
    top: -4,
    right: -3,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderRadius: 9,
    backgroundColor: '#DC2626',
  },

  pulseBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '900',
  },

  pulseDot: {
    position: 'absolute',
    top: 0,
    right: 4,
    width: 9,
    height: 9,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderRadius: 5,
    backgroundColor: '#DC2626',
  },

  headerBell: {
    marginRight: 4,
  },

  headerLogoButton: {
    marginRight: 8,
  },

  headerLogo: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
});
