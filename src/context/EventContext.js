import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import { eventInitialState, eventReducer } from '../reducers/eventReducer';
import {
  createEvent,
  joinEvent,
  leaveEvent,
  subscribeToEvents,
  updateEventCover,
} from '../services/eventService';

const EventContext = createContext(null);

export function EventProvider({ children }) {
  const [state, dispatch] = useReducer(eventReducer, eventInitialState);

  const startEventsListener = useCallback(() => {
    dispatch({ type: 'EVENTS_LOADING' });

    return subscribeToEvents({
      onData: events => {
        dispatch({ type: 'EVENTS_RECEIVED', payload: events });
      },
      onError: error => {
        dispatch({ type: 'EVENTS_ERROR', payload: error.message });
      },
    });
  }, []);

  const selectEvent = useCallback(event => {
    dispatch({ type: 'EVENT_SELECTED', payload: event });
  }, []);

  const addEvent = useCallback(async (input, organizer) => {
    return createEvent(input, organizer);
  }, []);

  const setEventCover = useCallback(async (eventId, coverURL) => {
    return updateEventCover(eventId, coverURL);
  }, []);

  const joinSelectedEvent = useCallback(async (eventId, userId) => {
    return joinEvent(eventId, userId);
  }, []);

  const leaveSelectedEvent = useCallback(async (eventId, userId) => {
    return leaveEvent(eventId, userId);
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      addEvent,
      dispatch,
      joinSelectedEvent,
      leaveSelectedEvent,
      selectEvent,
      setEventCover,
      startEventsListener,
    }),
    [
      addEvent,
      joinSelectedEvent,
      leaveSelectedEvent,
      selectEvent,
      setEventCover,
      startEventsListener,
      state,
    ],
  );

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}

export function useEvents() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used inside EventProvider');
  }
  return context;
}
