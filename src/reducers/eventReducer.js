export const eventInitialState = {
  events: [],
  selectedEvent: null,
  savedEventIds: [],
  loading: false,
  error: null,
};

export function eventReducer(state, action) {
  switch (action.type) {
    case 'EVENTS_LOADING':
      return { ...state, loading: true, error: null };
    case 'EVENTS_RECEIVED':
      return { ...state, events: action.payload, loading: false };
    case 'EVENT_SELECTED':
      return { ...state, selectedEvent: action.payload };
    case 'SAVED_EVENTS_RECEIVED':
      return { ...state, savedEventIds: action.payload };
    case 'EVENTS_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}
