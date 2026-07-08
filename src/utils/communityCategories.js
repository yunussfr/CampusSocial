import {
  mdiAccountGroupOutline,
  mdiBriefcaseOutline,
  mdiCodeTags,
  mdiFlaskOutline,
  mdiHeartHandshakeOutline,
  mdiMicrophoneOutline,
  mdiPaletteOutline,
  mdiRun,
  mdiSchoolOutline,
  mdiTranslate,
  mdiViewGridOutline,
} from '@mdi/js';

export const COMMUNITY_CATEGORIES = [
  {
    key: 'academic',
    label: 'Akademik ve Bolum',
    shortLabel: 'Akademik',
    firestoreValue: 'Akademik ve Bolum',
    aliases: ['Akademik ve Bolum', 'Akademik ve Bolüm', 'Akademik ve Bölüm'],
    icon: mdiSchoolOutline,
    color: '#2563EB',
  },
  {
    key: 'technology',
    label: 'Teknoloji ve Yazilim',
    shortLabel: 'Teknoloji',
    firestoreValue: 'Teknoloji ve Yazilim',
    aliases: ['Teknoloji ve Yazilim', 'Teknoloji ve Yazılım', 'Yazilim', 'Yazılım'],
    icon: mdiCodeTags,
    color: '#6246EA',
  },
  {
    key: 'career',
    label: 'Kariyer ve Girisimcilik',
    shortLabel: 'Kariyer',
    firestoreValue: 'Kariyer ve Girisimcilik',
    aliases: ['Kariyer ve Girisimcilik', 'Kariyer ve Girişimcilik', 'Kariyer'],
    icon: mdiBriefcaseOutline,
    color: '#16A34A',
  },
  {
    key: 'culture',
    label: 'Kultur ve Sanat',
    shortLabel: 'Kultur',
    firestoreValue: 'Kultur ve Sanat',
    aliases: ['Kultur ve Sanat', 'Kültür ve Sanat', 'Sanat'],
    icon: mdiPaletteOutline,
    color: '#DB2777',
  },
  {
    key: 'sport',
    label: 'Spor',
    shortLabel: 'Spor',
    firestoreValue: 'Spor',
    aliases: ['Spor'],
    icon: mdiRun,
    color: '#F97316',
  },
  {
    key: 'social',
    label: 'Sosyal ve Hobi',
    shortLabel: 'Sosyal',
    firestoreValue: 'Sosyal ve Hobi',
    aliases: ['Sosyal ve Hobi', 'Hobi'],
    icon: mdiAccountGroupOutline,
    color: '#0EA5E9',
  },
  {
    key: 'volunteer',
    label: 'Gonulluluk',
    shortLabel: 'Gonullu',
    firestoreValue: 'Gonulluluk',
    aliases: ['Gonulluluk', 'Gönüllülük'],
    icon: mdiHeartHandshakeOutline,
    color: '#059669',
  },
  {
    key: 'language',
    label: 'Dil ve Uluslararasi',
    shortLabel: 'Dil',
    firestoreValue: 'Dil ve Uluslararasi',
    aliases: ['Dil ve Uluslararasi', 'Dil ve Uluslararası'],
    icon: mdiTranslate,
    color: '#7C3AED',
  },
  {
    key: 'science',
    label: 'Bilim ve Arastirma',
    shortLabel: 'Bilim',
    firestoreValue: 'Bilim ve Arastirma',
    aliases: ['Bilim ve Arastirma', 'Bilim ve Araştırma'],
    icon: mdiFlaskOutline,
    color: '#0891B2',
  },
  {
    key: 'media',
    label: 'Medya ve Iletisim',
    shortLabel: 'Medya',
    firestoreValue: 'Medya ve Iletisim',
    aliases: ['Medya ve Iletisim', 'Medya ve İletişim'],
    icon: mdiMicrophoneOutline,
    color: '#9333EA',
  },
  {
    key: 'networking',
    label: 'Mezuniyet ve Networking',
    shortLabel: 'Networking',
    firestoreValue: 'Mezuniyet ve Networking',
    aliases: ['Mezuniyet ve Networking', 'Networking'],
    icon: mdiAccountGroupOutline,
    color: '#475569',
  },
  {
    key: 'other',
    label: 'Diger',
    shortLabel: 'Diger',
    firestoreValue: 'Diger',
    aliases: ['Diger', 'Diğer', 'Other'],
    icon: mdiViewGridOutline,
    color: '#64748B',
  },
];

export const QUICK_COMMUNITY_CATEGORY_KEYS = [
  'all',
  'technology',
  'career',
  'sport',
  'culture',
  'academic',
  'social',
];

export const COMMUNITY_SORT_OPTIONS = [
  {key: 'active', label: 'En Aktif'},
  {key: 'members', label: 'Uye Sayisina Gore'},
  {key: 'newest', label: 'Yeni Topluluklar'},
  {key: 'alphabetical', label: 'Alfabetik'},
];

export const DEFAULT_COMMUNITY_FILTERS = {
  minMembers: '',
  maxMembers: '',
  categoryKeys: [],
  sortKey: 'active',
  joinOpenOnly: false,
  recommendedOnly: false,
  excludeJoined: false,
};

export function getCommunityCategoryByKey(key) {
  return COMMUNITY_CATEGORIES.find(category => category.key === key);
}

export function getCommunityCategoryByValue(value, normalize) {
  const normalizedValue = normalize(value);

  return COMMUNITY_CATEGORIES.find(category =>
    category.aliases.some(alias => normalize(alias) === normalizedValue),
  );
}
