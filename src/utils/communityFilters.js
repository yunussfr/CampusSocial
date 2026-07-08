import {
  DEFAULT_COMMUNITY_FILTERS,
  getCommunityCategoryByKey,
} from './communityCategories';
import {
  getCommunityCategory,
  getCommunityMemberCount,
  getCommunityMemberIds,
  getCommunityName,
  getCommunityTimestamp,
  normalizeTurkishText,
  parseMemberCount,
} from './communityFormatters';

export function communityMatchesCategory(community, categoryKey) {
  if (!categoryKey || categoryKey === 'all') {
    return true;
  }

  const category = getCommunityCategoryByKey(categoryKey);

  if (!category) {
    return true;
  }

  const value = normalizeTurkishText(community?.category);
  return category.aliases.some(alias => {
    const normalizedAlias = normalizeTurkishText(alias);
    return (
      value === normalizedAlias ||
      value.includes(normalizedAlias) ||
      normalizedAlias.includes(value)
    );
  });
}

export function communityMatchesSearch(community, searchQuery) {
  const query = normalizeTurkishText(searchQuery);

  if (!query) {
    return true;
  }

  const searchable = [
    community?.name,
    community?.description,
    community?.category,
    community?.department,
    community?.owner?.displayName,
    ...(Array.isArray(community?.tags) ? community.tags : []),
    ...(Array.isArray(community?.keywords) ? community.keywords : []),
  ]
    .map(normalizeTurkishText)
    .join(' ');

  return searchable.includes(query);
}

export function communityMatchesMemberRange(community, filters) {
  const count = getCommunityMemberCount(community);
  const min = parseMemberCount(filters.minMembers);
  const max = parseMemberCount(filters.maxMembers);

  if (filters.minMembers !== '' && count < min) {
    return false;
  }

  if (filters.maxMembers !== '' && count > max) {
    return false;
  }

  return true;
}

export function communityIsJoined(community, userId, joinedCommunityIds = []) {
  if (!userId) {
    return false;
  }

  return (
    joinedCommunityIds.includes(community?.id) ||
    getCommunityMemberIds(community).includes(userId)
  );
}

export function communityMatchesJoinStatus(community, filters, userId, joinedCommunityIds) {
  if (filters.joinOpenOnly && community?.isPrivate === true) {
    return false;
  }

  if (filters.excludeJoined && communityIsJoined(community, userId, joinedCommunityIds)) {
    return false;
  }

  return true;
}

export function getCommunityActivityScore(community) {
  const explicitActivity = Number(community?.activeMemberCount || community?.recentEventCount || 0);
  const members = getCommunityMemberCount(community);
  const events = Number(community?.eventCount || 0);
  const posts = Number(community?.postCount || 0);
  const updatedBonus = getCommunityTimestamp(community, 'lastActivityAt')
    || getCommunityTimestamp(community, 'updatedAt');

  return explicitActivity * 5 + members + events * 3 + posts * 2 + updatedBonus / 1000000000000;
}

export function getCommunityRecommendationScore(community, user, joinedCommunityIds = []) {
  if (communityIsJoined(community, user?.uid, joinedCommunityIds)) {
    return -1;
  }

  const category = getCommunityCategory(community);
  const interests = [
    ...(Array.isArray(user?.interests) ? user.interests : []),
    ...(Array.isArray(user?.categories) ? user.categories : []),
    ...(Array.isArray(user?.favoriteCategories) ? user.favoriteCategories : []),
    user?.department,
    user?.faculty,
  ].filter(Boolean);

  const interestScore = interests.some(item => {
    const normalized = normalizeTurkishText(item);
    return (
      normalized &&
      (normalizeTurkishText(category?.label).includes(normalized) ||
        normalizeTurkishText(community?.category).includes(normalized) ||
        normalizeTurkishText(community?.department).includes(normalized))
    );
  })
    ? 100
    : 0;

  return interestScore + getCommunityActivityScore(community);
}

export function sortCommunities(communities, sortKey = DEFAULT_COMMUNITY_FILTERS.sortKey) {
  const nextCommunities = [...communities];

  switch (sortKey) {
    case 'members':
      return nextCommunities.sort(
        (first, second) => getCommunityMemberCount(second) - getCommunityMemberCount(first),
      );
    case 'newest':
      return nextCommunities.sort(
        (first, second) =>
          getCommunityTimestamp(second, 'createdAt') - getCommunityTimestamp(first, 'createdAt'),
      );
    case 'alphabetical':
      return nextCommunities.sort((first, second) =>
        getCommunityName(first).localeCompare(getCommunityName(second), 'tr-TR'),
      );
    case 'active':
    default:
      return nextCommunities.sort(
        (first, second) => getCommunityActivityScore(second) - getCommunityActivityScore(first),
      );
  }
}

export function filterCommunities({
  communities,
  searchQuery,
  activeCategoryKey,
  filters,
  user,
  joinedCommunityIds = [],
}) {
  const appliedFilters = filters || DEFAULT_COMMUNITY_FILTERS;
  const userId = user?.uid;

  const result = communities.filter(community => {
    const categoryMatches =
      communityMatchesCategory(community, activeCategoryKey) &&
      (appliedFilters.categoryKeys.length === 0 ||
        appliedFilters.categoryKeys.some(key => communityMatchesCategory(community, key)));

    if (!categoryMatches) {
      return false;
    }

    return (
      communityMatchesSearch(community, searchQuery) &&
      communityMatchesMemberRange(community, appliedFilters) &&
      communityMatchesJoinStatus(community, appliedFilters, userId, joinedCommunityIds)
    );
  });

  return sortCommunities(result, appliedFilters.sortKey);
}

export function getRecommendedCommunities(communities, user, joinedCommunityIds = [], limit = 6) {
  return [...communities]
    .map(community => ({
      community,
      score: getCommunityRecommendationScore(community, user, joinedCommunityIds),
    }))
    .filter(item => item.score >= 0)
    .sort((first, second) => second.score - first.score)
    .slice(0, limit)
    .map(item => item.community);
}

export function getActiveCommunities(communities) {
  return sortCommunities(
    communities.filter(community => {
      if (community?.status) {
        return normalizeTurkishText(community.status) === 'active';
      }

      if (community?.isActive !== undefined) {
        return community.isActive === true;
      }

      return true;
    }),
    'active',
  );
}

export function getActiveCommunityFilterCount(filters, supportedFilters = {}) {
  let count = 0;

  if (filters.minMembers !== '' || filters.maxMembers !== '') {
    count += 1;
  }

  if (filters.categoryKeys.length > 0) {
    count += 1;
  }

  if (filters.sortKey !== DEFAULT_COMMUNITY_FILTERS.sortKey) {
    count += 1;
  }

  if (filters.joinOpenOnly && supportedFilters.joinOpenOnly) {
    count += 1;
  }

  if (filters.recommendedOnly) {
    count += 1;
  }

  if (filters.excludeJoined && supportedFilters.excludeJoined) {
    count += 1;
  }

  return count;
}
