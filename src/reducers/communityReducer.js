export const communityInitialState = {
  communities: [],
  selectedCommunity: null,
  posts: [],
  loading: false,
  error: null,
};

export function communityReducer(state, action) {
  switch (action.type) {
    case 'COMMUNITIES_LOADING':
      return { ...state, loading: true, error: null };
    case 'COMMUNITIES_RECEIVED':
      return { ...state, communities: action.payload, loading: false };
    case 'COMMUNITY_SELECTED':
      return { ...state, selectedCommunity: action.payload };
    case 'COMMUNITY_POSTS_RECEIVED':
      return { ...state, posts: action.payload };
    case 'COMMUNITIES_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}
