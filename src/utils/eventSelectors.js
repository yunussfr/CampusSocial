import {
  getEventCategory,
  getEventCommunityName,
  getEventDate,
  getEventEndDate,
  getParticipantCount,
  isSameCalendarDay,
} from './eventFormatters';

export function filterEventsByCategory(events, category) {
  if (!category?.value) {
    return events;
  }

  return events.filter(event => getEventCategory(event) === category.value);
}

export function sortEventsByDate(events) {
  return [...events].sort((firstEvent, secondEvent) => {
    const firstDate = getEventDate(firstEvent);
    const secondDate = getEventDate(secondEvent);

    if (!firstDate && !secondDate) {
      return 0;
    }

    if (!firstDate) {
      return 1;
    }

    if (!secondDate) {
      return -1;
    }

    return firstDate.getTime() - secondDate.getTime();
  });
}

export function selectFeaturedEvents(events, limit = 4) {
  const sorted = sortEventsByDate(events);
  const featured = sorted.filter(event => (
    event?.isFeatured === true || event?.featured === true
  ));

  return [...featured, ...sorted.filter(event => !featured.includes(event))]
    .slice(0, limit);
}

export function selectUpcomingEvents(events, limit = 8) {
  const now = new Date();

  return sortEventsByDate(events)
    .filter(event => {
      const eventDate = getEventDate(event);

      return eventDate && eventDate.getTime() > now.getTime();
    })
    .slice(0, limit);
}

export function isActiveEventNow(event) {
  if (
    event?.isLive === true ||
    event?.isOngoing === true ||
    event?.isActiveNow === true
  ) {
    return true;
  }

  const now = new Date();
  const startDate = getEventDate(event);
  const endDate = getEventEndDate(event);

  if (!startDate) {
    return false;
  }

  if (endDate) {
    return startDate.getTime() <= now.getTime() &&
      endDate.getTime() >= now.getTime();
  }

  return startDate.getTime() <= now.getTime() &&
    isSameCalendarDay(startDate, now);
}

export function selectActiveEvents(events, limit = 4) {
  return sortEventsByDate(events)
    .filter(event => isActiveEventNow(event))
    .slice(0, limit);
}

export function derivePopularCommunities(events, limit = 6) {
  const communityMap = new Map();

  events.forEach(event => {
    const communityObject = event?.community || event?.organizer || {};
    const communityId =
      event?.communityId ||
      communityObject.id ||
      event?.organizerId ||
      event?.communityName ||
      event?.organizerName;
    const communityName = getEventCommunityName(event);

    if (!communityId || !communityName) {
      return;
    }

    const existing = communityMap.get(communityId);

    if (existing) {
      existing.eventCount += 1;
      existing.memberCount = existing.memberCount ||
        event?.communityMemberCount ||
        communityObject.memberCount ||
        null;
      existing.score = existing.eventCount * 10 + Number(existing.memberCount || 0);
      return;
    }

    const memberCount =
      event?.communityMemberCount ||
      communityObject.memberCount ||
      null;

    communityMap.set(communityId, {
      id: communityId,
      name: communityName,
      logoURL:
        event?.communityLogoURL ||
        communityObject.logoURL ||
        communityObject.logoUrl ||
        event?.organizerLogoURL ||
        null,
      memberCount,
      eventCount: 1,
      score: 10 + Number(memberCount || 0),
    });
  });

  return [...communityMap.values()]
    .sort((firstCommunity, secondCommunity) => secondCommunity.score - firstCommunity.score)
    .slice(0, limit)
    .map((community, index) => ({
      ...community,
      rank: index + 1,
    }));
}

export function getTodayEventCount(events) {
  const now = new Date();

  return events.filter(event => {
    const eventDate = getEventDate(event);

    return eventDate && isSameCalendarDay(eventDate, now);
  }).length;
}

export function getTopCategory(events) {
  const counts = new Map();

  events.forEach(event => {
    const category = getEventCategory(event);
    counts.set(category, (counts.get(category) || 0) + 1);
  });

  return [...counts.entries()]
    .sort((first, second) => second[1] - first[1])
    .map(([category]) => category)[0] || 'Etkinlik';
}

export function getNearbyEventCount(events) {
  return events.filter(event => getParticipantCount(event) > 0).length;
}
