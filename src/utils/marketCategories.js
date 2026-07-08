import {
  mdiBasketball,
  mdiBookOpenPageVariantOutline,
  mdiGamepadVariantOutline,
  mdiGiftOutline,
  mdiMonitor,
  mdiPencilRulerOutline,
  mdiSofaOutline,
  mdiTshirtCrewOutline,
  mdiViewGridOutline,
} from '@mdi/js';

export const MARKET_CATEGORIES = [
  {
    key: 'book',
    label: 'Kitap ve Ders Materyali',
    shortLabel: 'Kitap',
    firestoreValue: 'Kitap ve Ders Materyali',
    aliases: ['Kitap ve Ders Materyali', 'Kitap', 'Ders Materyali'],
    icon: mdiBookOpenPageVariantOutline,
  },
  {
    key: 'stationery',
    label: 'Kırtasiye',
    shortLabel: 'Kırtasiye',
    firestoreValue: 'Kırtasiye',
    aliases: ['Kırtasiye', 'Kirtasiye'],
    icon: mdiPencilRulerOutline,
  },
  {
    key: 'computer',
    label: 'Bilgisayar ve Teknoloji',
    shortLabel: 'Bilgisayar',
    firestoreValue: 'Bilgisayar ve Teknoloji',
    aliases: ['Bilgisayar ve Teknoloji', 'Bilgisayar', 'Teknoloji'],
    icon: mdiMonitor,
  },
  {
    key: 'phone',
    label: 'Telefon ve Aksesuar',
    shortLabel: 'Telefon',
    firestoreValue: 'Telefon ve Aksesuar',
    aliases: ['Telefon ve Aksesuar', 'Telefon'],
    icon: mdiMonitor,
  },
  {
    key: 'electronics',
    label: 'Elektronik',
    shortLabel: 'Elektronik',
    firestoreValue: 'Elektronik',
    aliases: ['Elektronik'],
    icon: mdiMonitor,
  },
  {
    key: 'clothing',
    label: 'Giyim ve Aksesuar',
    shortLabel: 'Giyim',
    firestoreValue: 'Giyim ve Aksesuar',
    aliases: ['Giyim ve Aksesuar', 'Giyim', 'Aksesuar'],
    icon: mdiTshirtCrewOutline,
  },
  {
    key: 'home',
    label: 'Yurt ve Ev Eşyası',
    shortLabel: 'Yurt ve Ev',
    firestoreValue: 'Yurt ve Ev Eşyası',
    aliases: ['Yurt ve Ev Eşyası', 'Yurt Eşyası', 'Ev Eşyası', 'Mobilya'],
    icon: mdiSofaOutline,
  },
  {
    key: 'sport',
    label: 'Spor ve Kamp',
    shortLabel: 'Spor',
    firestoreValue: 'Spor ve Kamp',
    aliases: ['Spor ve Kamp', 'Spor', 'Kamp'],
    icon: mdiBasketball,
  },
  {
    key: 'music',
    label: 'Müzik Aletleri',
    shortLabel: 'Müzik',
    firestoreValue: 'Müzik Aletleri',
    aliases: ['Müzik Aletleri', 'Muzik Aletleri', 'Müzik'],
    icon: mdiBookOpenPageVariantOutline,
  },
  {
    key: 'hobby',
    label: 'Hobi ve Oyun',
    shortLabel: 'Hobi ve Oyun',
    firestoreValue: 'Hobi ve Oyun',
    aliases: ['Hobi ve Oyun', 'Hobi', 'Oyun'],
    icon: mdiGamepadVariantOutline,
  },
  {
    key: 'handmade',
    label: 'El Yapımı Ürünler',
    shortLabel: 'El Yapımı',
    firestoreValue: 'El Yapımı Ürünler',
    aliases: ['El Yapımı Ürünler', 'El Yapımı', 'El Yapimi Urunler'],
    icon: mdiGiftOutline,
  },
  {
    key: 'free',
    label: 'Ücretsiz ve Bağış',
    shortLabel: 'Ücretsiz',
    firestoreValue: 'Ücretsiz ve Bağış',
    aliases: ['Ücretsiz ve Bağış', 'Ücretsiz', 'Bağış'],
    icon: mdiGiftOutline,
  },
  {
    key: 'other',
    label: 'Diğer',
    shortLabel: 'Diğer',
    firestoreValue: 'Diğer',
    aliases: ['Diğer', 'Diger', 'Other'],
    icon: mdiViewGridOutline,
  },
];

export const QUICK_MARKET_CATEGORY_KEYS = [
  'all',
  'book',
  'electronics',
  'clothing',
  'home',
  'sport',
  'hobby',
];

export const MARKET_CONDITIONS = [
  {key: 'new', label: 'Yeni', firestoreValue: 'new', aliases: ['new', 'yeni']},
  {
    key: 'like-new',
    label: 'Az Kullanılmış',
    firestoreValue: 'like-new',
    aliases: ['like-new', 'like new', 'az kullanılmış', 'az kullanilmis'],
  },
  {key: 'good', label: 'İyi', firestoreValue: 'good', aliases: ['good', 'iyi']},
  {
    key: 'used',
    label: 'Kullanılmış',
    firestoreValue: 'used',
    aliases: ['used', 'fair', 'kullanılmış', 'kullanilmis', 'ikinci el'],
  },
];

export const MARKET_STATUSES = [
  {key: 'active', label: 'Aktif'},
  {key: 'reserved', label: 'Rezerve'},
  {key: 'sold', label: 'Satıldı'},
];

export const MARKET_SORT_OPTIONS = [
  {key: 'newest', label: 'En Yeni'},
  {key: 'priceAsc', label: 'Fiyata Göre Artan'},
  {key: 'priceDesc', label: 'Fiyata Göre Azalan'},
  {key: 'popular', label: 'En Popüler'},
];

export const DEFAULT_MARKET_FILTERS = {
  minPrice: '',
  maxPrice: '',
  categoryKeys: [],
  conditionKeys: [],
  statusKeys: [],
  sortKey: 'newest',
  campusOnly: false,
  freeOnly: false,
};

export function getMarketCategoryByKey(key) {
  return MARKET_CATEGORIES.find(category => category.key === key);
}

export function getMarketCategoryByValue(value, normalize) {
  const normalizedValue = normalize(value);

  return MARKET_CATEGORIES.find(category =>
    category.aliases.some(alias => normalize(alias) === normalizedValue),
  );
}
