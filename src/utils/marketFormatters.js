import {IMAGES} from '../constants/assets';
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

  const raw = String(value ?? '').trim();

  if (!raw) {
    return 0;
  }

  const normalized = raw
    .replace(/\s/g, '')
    .replace(/[^\d.,]/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '')
    .replace(',', '.');

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatListingPrice(listing) {
  const price = parseListingPrice(listing?.price);
  const currency = listing?.currency || 'TRY';

  if (price === 0 || listing?.isFree === true) {
    return 'Ücretsiz';
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

export function getListingTimestamp(listing) {
  return (
    convertFirestoreDate(listing?.createdAt || listing?.updatedAt)?.getTime() ||
    0
  );
}

export function formatRelativeListingTime(listing) {
  const date = convertFirestoreDate(listing?.createdAt || listing?.updatedAt);

  if (!date) {
    return 'Yeni';
  }

  const diffMinutes = Math.floor(
    Math.max(0, Date.now() - date.getTime()) / 60000,
  );

  if (diffMinutes < 1) {
    return 'Az önce';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} dk önce`;
  }

  const hours = Math.floor(diffMinutes / 60);

  if (hours < 24) {
    return `${hours} sa önce`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} gün önce`;
  }

  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
  });
}

export function getListingImageSource(listing) {
  const candidate =
    listing?.imageURLs?.[0] ||
    listing?.images?.[0] ||
    listing?.imageURL ||
    listing?.imageUrl ||
    listing?.thumbnailURL;

  if (typeof candidate === 'number') {
    return candidate;
  }

  if (typeof candidate === 'string' && candidate.trim()) {
    return {uri: candidate};
  }

  if (candidate?.uri) {
    return candidate;
  }

  return IMAGES.coverPlaceholder;
}

export function getSellerName(listing) {
  return (
    listing?.seller?.displayName ||
    listing?.sellerName ||
    listing?.owner?.displayName ||
    'CampusConnect kullanıcısı'
  );
}

export function getSellerAvatarSource(listing) {
  const url =
    listing?.seller?.photoURL ||
    listing?.seller?.avatarURL ||
    listing?.owner?.photoURL;

  return url ? {uri: url} : null;
}

export function getSellerSubtitle(listing) {
  return (
    listing?.seller?.department ||
    listing?.seller?.campusName ||
    listing?.location ||
    listing?.campusName ||
    'Kampüs'
  );
}

export function getListingStatusLabel(listing) {
  const status = normalizeTurkishText(listing?.status);
  const option = MARKET_STATUSES.find(item => normalizeTurkishText(item.key) === status);
  return option?.label || null;
}

export function getListingConditionLabel(listing) {
  const condition = normalizeTurkishText(listing?.condition);
  const option = MARKET_CONDITIONS.find(item =>
    item.aliases.some(alias => normalizeTurkishText(alias) === condition),
  );

  return option?.label || listing?.condition || 'İkinci El';
}

export function getListingCategory(listing) {
  return getMarketCategoryByValue(listing?.category, normalizeTurkishText);
}
