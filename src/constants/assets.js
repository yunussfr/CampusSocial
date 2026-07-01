export const ICONS = {
  bell: require('../assets/icons/bell.png'),
  calendar: require('../assets/icons/calender.png'),
  location: require('../assets/icons/locatian.png'),
  logout: require('../assets/icons/logout.png'),
  search: require('../assets/icons/search.png'),
  send: require('../assets/icons/send.png'),
  tabCommunity: require('../assets/icons/tab-community.png'),
  tabDiscover: require('../assets/icons/tab-discover.png'),
  tabMarket: require('../assets/icons/tab-market.png'),
  tabMessages: require('../assets/icons/tab-messages.png'),
  tabProfile: require('../assets/icons/tab-profil.png'),
};

export const IMAGES = {
  coverPlaceholder: require('../assets/images/default_community_or_event_cover_photo_placeholder.png'),
  profileManPlaceholder: require('../assets/images/default_user_profile_avatar_forMan_placeholder.png'),
  profileWomanPlaceholder: require('../assets/images/default_user_profile_avatar_forWoman_placeholder.png'),
};

export function getProfilePlaceholder(profile) {
  const gender = String(
    profile?.gender || profile?.sex || profile?.genderIdentity || '',
  ).toLowerCase();

  if (
    gender.includes('woman') ||
    gender.includes('female') ||
    gender.includes('kadin') ||
    gender.includes('kadın')
  ) {
    return IMAGES.profileWomanPlaceholder;
  }

  return IMAGES.profileManPlaceholder;
}
