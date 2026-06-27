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
  saveListing,
  subscribeToListings,
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

  const saveSelectedListing = useCallback(async (userId, listingId) => {
    return saveListing(userId, listingId);
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      addListing,
      dispatch,
      saveSelectedListing,
      selectListing,
      startListingsListener,
    }),
    [
      addListing,
      saveSelectedListing,
      selectListing,
      startListingsListener,
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
