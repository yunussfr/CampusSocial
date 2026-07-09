import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  getListingSaveId,
  getPostSaveId,
  removeSavedItem,
  saveListingItem,
  savePostItem,
  subscribeToSaves,
} from '../services/savedService';

const SavedContext = createContext(null);

export function SavedProvider({ children }) {
  const [saves, setSaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startSavesListener = useCallback(userId => {
    if (!userId) {
      setSaves([]);
      setLoading(false);
      setError(null);

      return () => {};
    }

    setLoading(true);
    setError(null);

    return subscribeToSaves({
      userId,
      onData: nextSaves => {
        setSaves(nextSaves);
        setLoading(false);
      },
      onError: listenerError => {
        setError(listenerError.message);
        setLoading(false);
      },
    });
  }, []);

  const saveListing = useCallback(async (userId, listing) => {
    return saveListingItem(userId, listing);
  }, []);

  const savePost = useCallback(async (userId, communityId, post) => {
    return savePostItem(userId, communityId, post);
  }, []);

  const removeSave = useCallback(async (userId, saveId) => {
    return removeSavedItem(userId, saveId);
  }, []);

  const savedListingIds = useMemo(
    () =>
      saves
        .filter(item => item.type === 'listing' && item.listingId)
        .map(item => item.listingId),
    [saves],
  );

  const savedPostIds = useMemo(
    () =>
      saves
        .filter(item => item.type === 'post' && item.postId)
        .map(item => item.postId),
    [saves],
  );

  const value = useMemo(
    () => ({
      error,
      getListingSaveId,
      getPostSaveId,
      loading,
      removeSave,
      saveListing,
      savePost,
      savedListingIds,
      savedPostIds,
      saves,
      startSavesListener,
    }),
    [
      error,
      loading,
      removeSave,
      saveListing,
      savePost,
      savedListingIds,
      savedPostIds,
      saves,
      startSavesListener,
    ],
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved() {
  const context = useContext(SavedContext);

  if (!context) {
    throw new Error('useSaved must be used inside SavedProvider');
  }

  return context;
}
