import app from '@react-native-firebase/app';
import analytics from '@react-native-firebase/analytics';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import storage from '@react-native-firebase/storage';

export const firebaseServices = {
  app,
  auth: auth(),
  db: firestore(),
  storage: storage(),
  functions: null,
  analytics: analytics(),
  messaging: messaging(),
};

export const firebaseApp = firebaseServices.app;
export const firebaseAuth = firebaseServices.auth;
export const firestoreDb = firebaseServices.db;
export const firebaseStorage = firebaseServices.storage;
export const firebaseAnalytics = firebaseServices.analytics;
export const firebaseMessaging = firebaseServices.messaging;
