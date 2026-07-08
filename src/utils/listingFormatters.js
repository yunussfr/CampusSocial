import {IMAGES} from '../constants/assets';
import {
  LISTING_BOOLEAN_OPTIONS,
  LISTING_PAYMENT_OPTIONS,
  LISTING_SELLER_TYPES,
  LISTING_SHIPPING_PAYER_OPTIONS,
  LISTING_STATUS_OPTIONS,
} from '../constants/listingOptions';
import {
  MARKET_CONDITIONS,
  MARKET_STATUSES,
  getMarketCategoryByValue,
} from './marketCategories';

export function normalizeTurkishText(value) {
  return String(value ?? '')
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'c');
}

export function parseListingPrice(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = Number(
    String(value ?? '')
      .replace(/\s/g, '')
      .replace(/[^\d.,]/g, '')
      .replace(/\.(?=\d{3}(\D|$))/g, '')
      .replace(',', '.'),
  );

  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatListingPrice(listing) {
  const price = parseListingPrice(listing?.price);
  const currency = listing?.currency || 'TRY';

  if (price === 0 || listing?.isFree) {
    return 'Ucretsiz';
  }

  return `${new Intl.NumberFormat('tr-TR', {
    maximumFractionDigits: price % 1 === 0 ? 0 : 2,
  }).format(price)} ${currency}`;
}

export function convertFirestoreDate(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value.toDate === 'function') {
    return value.toDate();
  }

  if (typeof value.toMillis === 'function') {
    return new Date(value.toMillis());
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatRelativeListingTime(listing) {
  const date = convertFirestoreDate(listing?.createdAt || listing?.updatedAt);

  if (!date) {
    return 'Yeni';
  }

  const diffMinutes = Math.floor(Math.max(0, Date.now() - date.getTime()) / 60000);

  if (diffMinutes < 1) {
    return 'Az once';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} dk once`;
  }

  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) {
    return `${hours} saat once`;
  }

  return `${Math.floor(hours / 24)} gun once`;
}

export function getListingImages(listing) {
  const values = [
    ...(Array.isArray(listing?.imageURLs) ? listing.imageURLs : []),
    ...(Array.isArray(listing?.images) ? listing.images : []),
    listing?.imageURL,
    listing?.imageUrl,
  ].filter(Boolean);

  return values.length > 0 ? values : [IMAGES.coverPlaceholder];
}

export function getListingCoverImage(listing) {
  const image = getListingImages(listing)[0];
  return typeof image === 'string' ? {uri: image} : image;
}

export function getListingCategoryLabel(listing) {
  return (
    listing?.categoryLabel ||
    getMarketCategoryByValue(listing?.category, normalizeTurkishText)?.label ||
    listing?.category ||
    'Kategori'
  );
}

export function getListingConditionLabel(listing) {
  const value = normalizeTurkishText(listing?.condition);
  const option = MARKET_CONDITIONS.find(item =>
    item.aliases.some(alias => normalizeTurkishText(alias) === value),
  );
  return listing?.conditionLabel || option?.label || listing?.condition || 'Belirtilmedi';
}

export function getListingStatusLabel(listing) {
  const value = normalizeTurkishText(listing?.status || 'active');
  const localOption = LISTING_STATUS_OPTIONS.find(item => normalizeTurkishText(item.key) === value);
  const marketOption = MARKET_STATUSES.find(item => normalizeTurkishText(item.key) === value);
  return localOption?.label || marketOption?.label || listing?.status || 'Aktif';
}

export function getBooleanOptionLabel(value) {
  return LISTING_BOOLEAN_OPTIONS.find(item => item.key === value)?.label || 'Belirtilmedi';
}

export function getShippingPayerLabel(value) {
  return LISTING_SHIPPING_PAYER_OPTIONS.find(item => item.key === value)?.label || 'Belirtilmedi';
}

export function getSellerTypeLabel(value) {
  return LISTING_SELLER_TYPES.find(item => item.key === value)?.label || 'Bireysel';
}

export function formatPaymentMethods(methods) {
  if (!Array.isArray(methods) || methods.length === 0) {
    return 'Belirtilmedi';
  }

  return methods
    .map(key => LISTING_PAYMENT_OPTIONS.find(item => item.key === key)?.label || key)
    .join(', ');
}

export function getListingLocationText(listing) {
  return [
    listing?.location?.neighborhood || listing?.neighborhood,
    listing?.location?.district || listing?.district,
    listing?.location?.city || listing?.city || listing?.location,
  ]
    .filter(Boolean)
    .join(', ');
}

export function getSellerDisplayName(listing) {
  return listing?.seller?.displayName || listing?.sellerName || 'Bilinmeyen satici';
}

export function getSellerPhotoURL(listing) {
  return listing?.seller?.photoURL || listing?.seller?.avatarURL || '';
}

export function getListingShortId(listing) {
  return String(listing?.id || '').slice(0, 8).toUpperCase();
}
