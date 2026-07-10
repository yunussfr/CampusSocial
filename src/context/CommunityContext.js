import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import {
  communityInitialState,
  communityReducer,
} from '../reducers/communityReducer';
import {
  createCommunity,
  createCommunityPost,
  joinCommunity,
  leaveCommunity,
  requestCommunityJoin,
  subscribeToCommunityJoinRequest,
  subscribeToCommunities,
  subscribeToCommunityPosts,
  updateCommunityJoinRequestStatus,
  updateCommunityMedia,
} from '../services/communityService';

const CommunityContext = createContext(null);

export function CommunityProvider({ children }) {
  const [state, dispatch] = useReducer(
    communityReducer,
    communityInitialState,
  );

  const startCommunitiesListener = useCallback(() => {
    dispatch({ type: 'COMMUNITIES_LOADING' });

    return subscribeToCommunities({
      onData: communities => {
        dispatch({ type: 'COMMUNITIES_RECEIVED', payload: communities });
      },
      onError: error => {
        dispatch({ type: 'COMMUNITIES_ERROR', payload: error.message });
      },
    });
  }, []);

  const selectCommunity = useCallback(community => {
    dispatch({ type: 'COMMUNITY_SELECTED', payload: community });
  }, []);

  const addCommunity = useCallback(async (input, creator) => {
    return createCommunity(input, creator);
  }, []);

  const setCommunityMedia = useCallback(async (communityId, media) => {
    return updateCommunityMedia(communityId, media);
  }, []);

  const joinSelectedCommunity = useCallback(async (communityId, userId) => {
    return joinCommunity(communityId, userId);
  }, []);

  const requestSelectedCommunityJoin = useCallback(
    async (communityId, requester) => {
      return requestCommunityJoin(communityId, requester);
    },
    [],
  );

  const leaveSelectedCommunity = useCallback(async (communityId, userId) => {
    return leaveCommunity(communityId, userId);
  }, []);

  const reviewCommunityJoinRequest = useCallback(async input => {
    return updateCommunityJoinRequestStatus(input);
  }, []);

  const startCommunityJoinRequestListener = useCallback(
    ({communityId, userId, onData, onError}) => {
      return subscribeToCommunityJoinRequest({
        communityId,
        userId,
        onData,
        onError,
      });
    },
    [],
  );

  const startCommunityPostsListener = useCallback(communityId => {
    return subscribeToCommunityPosts({
      communityId,
      onData: posts => {
        dispatch({ type: 'COMMUNITY_POSTS_RECEIVED', payload: posts });
      },
      onError: error => {
        dispatch({ type: 'COMMUNITIES_ERROR', payload: error.message });
      },
    });
  }, []);

  const addCommunityPost = useCallback(async (communityId, input, author) => {
    return createCommunityPost(communityId, input, author);
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      addCommunity,
      addCommunityPost,
      dispatch,
      joinSelectedCommunity,
      leaveSelectedCommunity,
      requestSelectedCommunityJoin,
      reviewCommunityJoinRequest,
      selectCommunity,
      setCommunityMedia,
      startCommunityJoinRequestListener,
      startCommunitiesListener,
      startCommunityPostsListener,
    }),
    [
      addCommunity,
      addCommunityPost,
      joinSelectedCommunity,
      leaveSelectedCommunity,
      requestSelectedCommunityJoin,
      reviewCommunityJoinRequest,
      selectCommunity,
      setCommunityMedia,
      startCommunityJoinRequestListener,
      startCommunitiesListener,
      startCommunityPostsListener,
      state,
    ],
  );

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunities() {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunities must be used inside CommunityProvider');
  }
  return context;
}
