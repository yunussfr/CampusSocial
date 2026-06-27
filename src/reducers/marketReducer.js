export const marketInitialState = {
  listings: [],
  selectedListing: null,
  savedListingIds: [],
  filters: {
    category: null,
    condition: null,
    priceRange: null,
    searchText: '',
  },
  loading: false,
  error: null,
};

export function marketReducer(state, action) {
  switch (action.type) {
    case 'LISTINGS_LOADING':
      return { ...state, loading: true, error: null };
    case 'LISTINGS_RECEIVED':
      return { ...state, listings: action.payload, loading: false };
    case 'LISTING_SELECTED':
      return { ...state, selectedListing: action.payload };
    case 'LISTING_FILTERS_CHANGED':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SAVED_LISTINGS_RECEIVED':
      return { ...state, savedListingIds: action.payload };
    case 'LISTINGS_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}
