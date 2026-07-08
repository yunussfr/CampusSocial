import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import { marketInitialState, marketReducer } from '../reducers/marketReducer';
import {
  createListing,
  removeSavedListing as deleteSavedListing,
  saveListing,
  subscribeToListings,
  subscribeToSavedListingIds,
  subscribeToUserListings,
  updateListingImages,
} from '../services/marketService';

const MarketContext = createContext(null);

export function MarketProvider({ children }) {
  const [state, dispatch] = useReducer(marketReducer, marketInitialState);

  const startListingsListener = useCallback(() => {
    dispatch({ type: 'LISTINGS_LOADING' });

    return subscribeToListings({
      onData: listings => {
        dispatch({ type: 'LISTINGS_RECEIVED', payload: listings });
      },
      onError: error => {
        dispatch({ type: 'LISTINGS_ERROR', payload: error.message });
      },
    });
  }, []);

  const selectListing = useCallback(listing => {
    dispatch({ type: 'LISTING_SELECTED', payload: listing });
  }, []);

  const addListing = useCallback(async (input, seller) => {
    return createListing(input, seller);
  }, []);

  const startMyListingsListener = useCallback(userId => {
    dispatch({ type: 'LISTINGS_LOADING' });

    return subscribeToUserListings({
      userId,
      onData: listings => {
        dispatch({ type: 'LISTINGS_RECEIVED', payload: listings });
      },
      onError: error => {
        dispatch({ type: 'LISTINGS_ERROR', payload: error.message });
      },
    });
  }, []);

  const startSavedListingsListener = useCallback(userId => {
    return subscribeToSavedListingIds({
      userId,
      onData: ids => {
        dispatch({ type: 'SAVED_LISTINGS_RECEIVED', payload: ids });
      },
      onError: error => {
        dispatch({ type: 'LISTINGS_ERROR', payload: error.message });
      },
    });
  }, []);

  const saveSelectedListing = useCallback(async (userId, listingId) => {
    return saveListing(userId, listingId);
  }, []);

  const removeSavedListing = useCallback(async (userId, listingId) => {
    return deleteSavedListing(userId, listingId);
  }, []);

  const setListingImages = useCallback(async (listingId, imageURLs) => {
    return updateListingImages(listingId, imageURLs);
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      addListing,
      dispatch,
      removeSavedListing,
      saveSelectedListing,
      selectListing,
      setListingImages,
      startMyListingsListener,
      startListingsListener,
      startSavedListingsListener,
    }),
    [
      addListing,
      removeSavedListing,
      saveSelectedListing,
      selectListing,
      setListingImages,
      startMyListingsListener,
      startListingsListener,
      startSavedListingsListener,
      state,
    ],
  );

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarket() {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used inside MarketProvider');
  }
  return context;
}
