import {firebaseAnalytics} from './firebase';

export const ANALYTICS_EVENTS = {
  DISCOVER_CATEGORY_SELECT: 'discover_category_select',
  DISCOVER_SEARCH: 'discover_search',
  DISCOVER_SHOW_ALL_UPCOMING: 'discover_show_all_upcoming',
  EVENT_OPEN: 'event_open',
  EVENT_JOIN: 'event_join',
  EVENT_LEAVE: 'event_leave',
  EVENT_CREATE_SUCCESS: 'event_create_success',
  MARKET_VIEW: 'market_view',
  MARKET_SEARCH: 'market_search',
  MARKET_FILTER_APPLY: 'market_filter_apply',
  MARKET_SORT_APPLY: 'market_sort_apply',
  LISTING_OPEN: 'listing_open',
  LISTING_SAVE: 'listing_save',
  LISTING_UNSAVE: 'listing_unsave',
  LISTING_CREATE_SUCCESS: 'listing_create_success',
  SELLER_MESSAGE_START: 'seller_message_start',
  NOTIFICATION_OPEN: 'notification_open',
  COMMUNITY_JOIN_REQUEST_APPROVE: 'community_join_request_approve',
  COMMUNITY_JOIN_REQUEST_REJECT: 'community_join_request_reject',
};

function normalizeAnalyticsValue(value) {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}

function sanitizeParams(params = {}) {
  return Object.entries(params).reduce((result, [key, value]) => {
    const nextValue = normalizeAnalyticsValue(value);

    if (nextValue !== undefined) {
      result[key] = nextValue;
    }

    return result;
  }, {});
}

export async function logAnalyticsEvent(name, params = {}) {
  if (!name || !firebaseAnalytics?.logEvent) {
    return;
  }

  try {
    await firebaseAnalytics.logEvent(name, sanitizeParams(params));
  } catch (error) {
    if (__DEV__) {
      console.warn('Analytics event failed', name, error.message);
    }
  }
}

export async function logScreenView(screenName) {
  if (!screenName || !firebaseAnalytics?.logScreenView) {
    return;
  }

  try {
    await firebaseAnalytics.logScreenView({
      screen_name: screenName,
      screen_class: screenName,
    });
  } catch (error) {
    if (__DEV__) {
      console.warn('Analytics screen failed', screenName, error.message);
    }
  }
}
