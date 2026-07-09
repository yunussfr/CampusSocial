import {IMAGES} from '../constants/assets';

export function getTextValue(value, fallback = '') {
  if (typeof value === 'string') {
    return value.trim() || fallback;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return fallback;
}

export function convertToDate(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === 'function') {
    return value.toDate();
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function getEventDate(event) {
  return convertToDate(
    event?.startDate ||
      event?.startAt ||
      event?.startTime ||
      event?.eventDate ||
      event?.date,
  );
}

export function getEventEndDate(event) {
  return convertToDate(
    event?.endDate ||
      event?.endAt ||
      event?.endTime ||
      event?.finishDate ||
      event?.finishAt,
  );
}

export function getEventTitle(event) {
  return event?.title || event?.name || 'Etkinlik';
}

export function getEventCategory(event) {
  return event?.category || event?.type || 'Etkinlik';
}

export function getEventLocation(event) {
  const location =
    event?.locationName ||
    event?.locationLabel ||
    event?.location ||
    event?.venue ||
    event?.place ||
    'Kampüs';

  if (
    location &&
    typeof location === 'object' &&
    typeof location.latitude === 'number' &&
    typeof location.longitude === 'number'
  ) {
    return `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
  }

  return getTextValue(location, 'Kampüs');
}

export function getEventCommunityName(event) {
  return (
    event?.communityName ||
    event?.community?.name ||
    event?.organizerName ||
    event?.organizer?.name ||
    'CampusMerge'
  );
}

export function getEventImageURL(event) {
  return (
    event?.coverURL ||
    event?.imageURL ||
    event?.imageUrl ||
    event?.bannerURL ||
    event?.photoURL ||
    null
  );
}

export function getEventImageSource(event) {
  const imageURL = getEventImageURL(event);

  return imageURL ? {uri: imageURL} : IMAGES.coverPlaceholder;
}

export function getParticipantCount(event) {
  return Number(
    event?.participantCount ||
      event?.attendeesCount ||
      event?.joinedCount ||
      event?.attendeeCount ||
      0,
  );
}

export function formatEventDateTime(event) {
  const date = getEventDate(event);

  if (!date) {
    return event?.dateText || 'Tarih belirtilmedi';
  }

  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatEventTime(event) {
  const date = getEventDate(event);

  if (!date) {
    return '--:--';
  }

  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getDayNumber(event) {
  const date = getEventDate(event);

  return date ? String(date.getDate()).padStart(2, '0') : '--';
}

export function getMonthName(event) {
  const date = getEventDate(event);

  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat('tr-TR', {
    month: 'short',
  })
    .format(date)
    .replace('.', '')
    .toLocaleUpperCase('tr-TR');
}

export function isSameCalendarDay(firstDate, secondDate) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}
