import app from '@react-native-firebase/app';
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
  analytics: null,
  messaging: messaging(),
};

export const firebaseApp = firebaseServices.app;
export const firebaseAuth = firebaseServices.auth;
export const firestoreDb = firebaseServices.db;
export const firebaseStorage = firebaseServices.storage;
export const firebaseMessaging = firebaseServices.messaging;
