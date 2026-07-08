export const LISTING_MAX_PHOTOS = 8;

export const LISTING_CURRENCIES = [
  {key: 'TRY', label: 'TRY'},
  {key: 'USD', label: 'USD'},
  {key: 'EUR', label: 'EUR'},
];

export const LISTING_SELLER_TYPES = [
  {key: 'individual', label: 'Bireysel'},
  {key: 'business', label: 'Kurumsal'},
];

export const LISTING_SHIPPING_PAYER_OPTIONS = [
  {key: 'buyer', label: 'Alici Oder'},
  {key: 'seller', label: 'Satici Oder'},
  {key: 'handoff', label: 'Elden Teslim'},
];

export const LISTING_DELIVERY_OPTIONS = [
  {key: 'cargo', label: 'Kargo'},
  {key: 'handoff', label: 'Elden Teslim'},
  {key: 'both', label: 'Kargo veya Elden'},
];

export const LISTING_STATUS_OPTIONS = [
  {key: 'active', label: 'Aktif'},
  {key: 'passive', label: 'Pasif'},
  {key: 'draft', label: 'Taslak'},
  {key: 'reserved', label: 'Rezerve'},
  {key: 'sold', label: 'Satildi'},
];

export const LISTING_PAYMENT_OPTIONS = [
  {key: 'cash', label: 'Nakit'},
  {key: 'bankTransfer', label: 'Havale/EFT'},
  {key: 'card', label: 'Kart'},
];

export const LISTING_BOOLEAN_OPTIONS = [
  {key: 'unknown', label: 'Belirtilmedi'},
  {key: 'yes', label: 'Var'},
  {key: 'no', label: 'Yok'},
];

export const DEFAULT_LISTING_FORM = {
  title: '',
  description: '',
  price: '',
  currency: 'TRY',
  category: '',
  subCategory: '',
  condition: 'used',
  brand: '',
  model: '',
  color: '',
  material: '',
  dimensions: '',
  usageDuration: '',
  warranty: 'unknown',
  invoice: 'unknown',
  originalBox: 'unknown',
  city: '',
  district: '',
  neighborhood: '',
  deliveryPreference: 'both',
  shippingPayer: 'buyer',
  paymentMethods: ['cash'],
  sellerType: 'individual',
  status: 'active',
  negotiable: true,
  tags: '',
};

export const LISTING_REQUIRED_FIELDS = [
  'title',
  'description',
  'price',
  'category',
  'condition',
  'city',
  'district',
];

export const LISTING_DETAIL_FIELDS = [
  {key: 'conditionLabel', label: 'Durum', icon: 'tag'},
  {key: 'brand', label: 'Marka', icon: 'bookmark'},
  {key: 'model', label: 'Model', icon: 'cube'},
  {key: 'color', label: 'Renk', icon: 'palette'},
  {key: 'material', label: 'Materyal', icon: 'cube-outline'},
  {key: 'dimensions', label: 'Boyut', icon: 'resize'},
  {key: 'usageDuration', label: 'Kullanim Suresi', icon: 'clock'},
  {key: 'warrantyLabel', label: 'Garanti', icon: 'shield'},
  {key: 'invoiceLabel', label: 'Fatura', icon: 'receipt'},
  {key: 'originalBoxLabel', label: 'Orijinal Kutu', icon: 'package'},
];
