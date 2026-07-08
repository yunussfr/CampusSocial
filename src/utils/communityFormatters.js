import {IMAGES} from '../constants/assets';
import {getCommunityCategoryByValue} from './communityCategories';

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

export function parseMemberCount(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.max(0, value) : 0;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^\d]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (Array.isArray(value)) {
    return value.length;
  }

  return 0;
}

export function getCommunityMemberCount(community) {
  return (
    parseMemberCount(community?.memberCount) ||
    parseMemberCount(community?.membersCount) ||
    parseMemberCount(community?.members) ||
    parseMemberCount(community?.memberIds) ||
    parseMemberCount(community?.stats?.memberCount)
  );
}

export function formatMemberCount(community) {
  return `${new Intl.NumberFormat('tr-TR').format(getCommunityMemberCount(community))} uye`;
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

export function getCommunityTimestamp(community, field = 'createdAt') {
  return convertFirestoreDate(community?.[field])?.getTime() || 0;
}

export function formatRelativeCommunityActivity(community) {
  const date = convertFirestoreDate(
    community?.lastActivityAt || community?.updatedAt || community?.createdAt,
  );

  if (!date) {
    return 'Aktif';
  }

  const diffMinutes = Math.floor(Math.max(0, Date.now() - date.getTime()) / 60000);

  if (diffMinutes < 60) {
    return 'Yeni aktif';
  }

  const days = Math.floor(diffMinutes / 1440);
  return days < 1 ? 'Bugun aktif' : `${days} gun once aktif`;
}

export function getCommunityImageSource(community, variant = 'cover') {
  const candidate =
    (variant === 'icon' && (community?.iconURL || community?.logoURL)) ||
    community?.coverURL ||
    community?.coverImageURL ||
    community?.imageURL ||
    community?.imageUrl ||
    community?.logoURL ||
    community?.avatarURL ||
    community?.photoURL;

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

export function getCommunityName(community) {
  return community?.name || 'Topluluk';
}

export function getCommunityDescription(community) {
  return community?.description || 'Topluluk aciklamasi bulunmuyor.';
}

export function getCommunityCategory(community) {
  return getCommunityCategoryByValue(community?.category, normalizeTurkishText);
}

export function getCommunityMemberIds(community) {
  if (Array.isArray(community?.memberIds)) {
    return community.memberIds;
  }

  if (Array.isArray(community?.members)) {
    return community.members
      .map(member => (typeof member === 'string' ? member : member?.userId || member?.uid))
      .filter(Boolean);
  }

  return [];
}

export function getCommunityMemberAvatars(community) {
  const candidates = community?.memberAvatars || community?.members || [];

  if (!Array.isArray(candidates)) {
    return [];
  }

  return candidates
    .map(member =>
      typeof member === 'string'
        ? member
        : member?.photoURL || member?.avatarURL || member?.imageURL,
    )
    .filter(Boolean)
    .slice(0, 5);
}

export function getCommunityJoinStatus(community, userId) {
  if (!userId) {
    return 'guest';
  }

  return getCommunityMemberIds(community).includes(userId) ? 'member' : 'none';
}

export function getCommunityPrivacyLabel(community) {
  if (community?.isPrivate || community?.privacy === 'private') {
    return 'Ozel';
  }

  return 'Acik';
}
