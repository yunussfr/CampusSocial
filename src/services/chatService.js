import firestore from '@react-native-firebase/firestore';
import { COLLECTIONS } from '../constants/collections';
import { firestoreDb } from './firebase';

function mapDoc(doc) {
  return {
    id: doc.id,
    ...doc.data(),
  };
}

export function subscribeToChats({ userId, onData, onError }) {
  return firestoreDb
    .collection(COLLECTIONS.CHATS)
    .where('participants', 'array-contains', userId)
    .orderBy('updatedAt', 'desc')
    .onSnapshot(
      snapshot => onData(snapshot.docs.map(mapDoc)),
      error => {
        if (onError) {
          onError(error);
        }
      },
    );
}

export function subscribeToMessages({ chatId, onData, onError }) {
  return firestoreDb
    .collection(COLLECTIONS.CHATS)
    .doc(chatId)
    .collection(COLLECTIONS.MESSAGES)
    .orderBy('createdAt', 'asc')
    .onSnapshot(
      snapshot => onData(snapshot.docs.map(mapDoc)),
      error => {
        if (onError) {
          onError(error);
        }
      },
    );
}

export async function sendMessage(chatId, senderId, text) {
  return firestoreDb
    .collection(COLLECTIONS.CHATS)
    .doc(chatId)
    .collection(COLLECTIONS.MESSAGES)
    .add({
      senderId,
      text: text.trim(),
      read: false,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
}
