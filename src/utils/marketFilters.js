import {
  DEFAULT_MARKET_FILTERS,
  MARKET_CATEGORIES,
  MARKET_CONDITIONS,
  getMarketCategoryByKey,
} from './marketCategories';
import {
  getListingTimestamp,
  normalizeTurkishText,
  parseListingPrice,
} from './marketFormatters';

export function listingMatchesCategory(listing, categoryKey) {
  if (!categoryKey || categoryKey === 'all') {
    return true;
  }

  const category = getMarketCategoryByKey(categoryKey);

  if (!category) {
    return true;
  }

  const listingCategory = normalizeTurkishText(listing?.category);

  return category.aliases.some(alias => {
    const normalizedAlias = normalizeTurkishText(alias);
    return (
      listingCategory === normalizedAlias ||
      listingCategory.includes(normalizedAlias) ||
      normalizedAlias.includes(listingCategory)
    );
  });
}

export function listingMatchesSearch(listing, searchQuery) {
  const query = normalizeTurkishText(searchQuery);

  if (!query) {
    return true;
  }

  const searchable = [
    listing?.title,
    listing?.description,
    listing?.category,
    ...(Array.isArray(listing?.tags) ? listing.tags : []),
    listing?.seller?.displayName,
    listing?.seller?.department,
    listing?.location,
  ]
    .map(normalizeTurkishText)
    .join(' ');

  return searchable.includes(query);
}

export function listingMatchesCondition(listing, conditionKey) {
  if (!conditionKey) {
    return true;
  }

  const option = MARKET_CONDITIONS.find(item => item.key === conditionKey);

  if (!option) {
    return true;
  }

  const value = normalizeTurkishText(listing?.condition);
  return option.aliases.some(alias => normalizeTurkishText(alias) === value);
}

export function listingMatchesStatus(listing, statusKey) {
  if (!statusKey) {
    return true;
  }

  return normalizeTurkishText(listing?.status || 'active') === normalizeTurkishText(statusKey);
}

export function listingMatchesPriceRange(listing, filters) {
  const price = parseListingPrice(listing?.price);
  const min = parseListingPrice(filters.minPrice);
  const max = parseListingPrice(filters.maxPrice);

  if (filters.minPrice !== '' && price < min) {
    return false;
  }

  if (filters.maxPrice !== '' && price > max) {
    return false;
  }

  return true;
}

export function listingMatchesCampus(listing, user) {
  if (listing?.campusOnly === true || listing?.isCampusOnly === true) {
    return true;
  }

  if (listing?.campusId && user?.campusId) {
    return listing.campusId === user.campusId;
  }

  if (listing?.universityId && user?.universityId) {
    return listing.universityId === user.universityId;
  }

  if (listing?.seller?.campusId && user?.campusId) {
    return listing.seller.campusId === user.campusId;
  }

  return false;
}

export function listingIsFree(listing) {
  return (
    parseListingPrice(listing?.price) === 0 ||
    listing?.isFree === true ||
    MARKET_CATEGORIES.find(category => category.key === 'free')?.aliases.some(
      alias => normalizeTurkishText(alias) === normalizeTurkishText(listing?.category),
    )
  );
}

export function getListingPopularityScore(listing) {
  return Number(listing?.savedCount || 0) * 3 + Number(listing?.viewCount || 0);
}

export function sortMarketListings(listings, sortKey = DEFAULT_MARKET_FILTERS.sortKey) {
  const nextListings = [...listings];

  switch (sortKey) {
    case 'priceAsc':
      return nextListings.sort(
        (first, second) =>
          parseListingPrice(first?.price) - parseListingPrice(second?.price),
      );
    case 'priceDesc':
      return nextListings.sort(
        (first, second) =>
          parseListingPrice(second?.price) - parseListingPrice(first?.price),
      );
    case 'popular':
      return nextListings.sort(
        (first, second) =>
          getListingPopularityScore(second) - getListingPopularityScore(first),
      );
    case 'newest':
    default:
      return nextListings.sort(
        (first, second) => getListingTimestamp(second) - getListingTimestamp(first),
      );
  }
}

export function filterMarketListings({
  listings,
  searchQuery,
  activeCategoryKey,
  filters,
  user,
}) {
  const appliedFilters = filters || DEFAULT_MARKET_FILTERS;

  const result = listings.filter(listing => {
    const categoryMatches =
      listingMatchesCategory(listing, activeCategoryKey) &&
      (appliedFilters.categoryKeys.length === 0 ||
        appliedFilters.categoryKeys.some(key => listingMatchesCategory(listing, key)));

    if (!categoryMatches) {
      return false;
    }

    if (!listingMatchesSearch(listing, searchQuery)) {
      return false;
    }

    if (
      appliedFilters.conditionKeys.length > 0 &&
      !appliedFilters.conditionKeys.some(key => listingMatchesCondition(listing, key))
    ) {
      return false;
    }

    if (
      appliedFilters.statusKeys.length > 0 &&
      !appliedFilters.statusKeys.some(key => listingMatchesStatus(listing, key))
    ) {
      return false;
    }

    if (!listingMatchesPriceRange(listing, appliedFilters)) {
      return false;
    }

    if (appliedFilters.campusOnly && !listingMatchesCampus(listing, user)) {
      return false;
    }

    if (appliedFilters.freeOnly && !listingIsFree(listing)) {
      return false;
    }

    return true;
  });

  return sortMarketListings(result, appliedFilters.sortKey);
}

export function getRecommendedListings(listings, limit = 6) {
  // This is not true personalization; it ranks active listings by available
  // saved/view counters until a recommendation service exists.
  return sortMarketListings(
    listings.filter(listing => normalizeTurkishText(listing?.status || 'active') === 'active'),
    'popular',
  ).slice(0, limit);
}

export function getActiveMarketFilterCount(filters, campusFilterSupported = true) {
  let count = 0;

  if (filters.minPrice !== '') {
    count += 1;
  }

  if (filters.maxPrice !== '') {
    count += 1;
  }

  count += filters.categoryKeys.length;
  count += filters.conditionKeys.length;
  count += filters.statusKeys.length;

  if (filters.sortKey !== DEFAULT_MARKET_FILTERS.sortKey) {
    count += 1;
  }

  if (filters.campusOnly && campusFilterSupported) {
    count += 1;
  }

  if (filters.freeOnly) {
    count += 1;
  }

  return count;
}
