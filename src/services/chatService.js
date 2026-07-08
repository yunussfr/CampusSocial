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
    .onSnapshot(
      snapshot => {
        const chats = snapshot.docs.map(mapDoc);
        chats.sort((a, b) => {
          let aTime = 0;
          let bTime = 0;
          if (a.updatedAt) {
            aTime = typeof a.updatedAt.toDate === 'function' 
              ? a.updatedAt.toDate().getTime() 
              : new Date(a.updatedAt).getTime() || 0;
          }
          if (b.updatedAt) {
            bTime = typeof b.updatedAt.toDate === 'function' 
              ? b.updatedAt.toDate().getTime() 
              : new Date(b.updatedAt).getTime() || 0;
          }
          return bTime - aTime;
        });
        onData(chats);
      },
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

export async function createOrGetDirectChat({
  currentUser,
  otherUser,
  relatedListingId,
}) {
  const participantIds = [currentUser.uid, otherUser.uid].sort();
  const chatId = relatedListingId
    ? `${participantIds.join('_')}_${relatedListingId}`
    : participantIds.join('_');
  const chatRef = firestoreDb.collection(COLLECTIONS.CHATS).doc(chatId);
  const chatDoc = await chatRef.get();

  if (!chatDoc.exists) {
    await chatRef.set({
      participants: participantIds,
      participantProfiles: {
        [currentUser.uid]: {
          uid: currentUser.uid,
          displayName: currentUser.displayName || '',
          photoURL: currentUser.photoURL || '',
        },
        [otherUser.uid]: {
          uid: otherUser.uid,
          displayName: otherUser.displayName || '',
          photoURL: otherUser.photoURL || '',
        },
      },
      relatedListingId: relatedListingId || null,
      lastMessage: null,
      unreadCounts: {
        [currentUser.uid]: 0,
        [otherUser.uid]: 0,
      },
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  }

  return chatId;
}

export async function sendMessage(chatId, senderId, text) {
  const trimmedText = text.trim();
  const chatRef = firestoreDb.collection(COLLECTIONS.CHATS).doc(chatId);
  const chatDoc = await chatRef.get();

  if (!chatDoc.exists) {
    throw new Error('Chat bulunamadı.');
  }

  const chat = chatDoc.data();
  const messageRef = chatRef.collection(COLLECTIONS.MESSAGES).doc();
  const now = firestore.FieldValue.serverTimestamp();
  const chatUpdate = {
    lastMessage: {
      text: trimmedText,
      senderId,
      createdAt: now,
    },
    updatedAt: now,
  };

  (chat.participants || [])
    .filter(participantId => participantId !== senderId)
    .forEach(participantId => {
      chatUpdate[`unreadCounts.${participantId}`] =
        firestore.FieldValue.increment(1);
    });

  const batch = firestoreDb.batch();

  batch.set(messageRef, {
    senderId,
    text: trimmedText,
    read: false,
    createdAt: now,
  });
  batch.set(chatRef, chatUpdate, { merge: true });

  await batch.commit();

  return messageRef;
}

export async function markChatRead(chatId, userId) {
  return firestoreDb.collection(COLLECTIONS.CHATS).doc(chatId).set(
    {
      [`unreadCounts.${userId}`]: 0,
    },
    { merge: true },
  );
}

export function subscribeToNotifications({ userId, onData, onError }) {
  return firestoreDb
    .collection(COLLECTIONS.USERS)
    .doc(userId)
    .collection(COLLECTIONS.NOTIFICATIONS)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      snapshot => onData(snapshot.docs.map(mapDoc)),
      error => {
        if (onError) {
          onError(error);
        }
      },
    );
}

export function markNotificationsRead(userId, notificationIds) {
  if (!notificationIds?.length) {
    return Promise.resolve();
  }

  const batch = firestoreDb.batch();
  const notificationsRef = firestoreDb
    .collection(COLLECTIONS.USERS)
    .doc(userId)
    .collection(COLLECTIONS.NOTIFICATIONS);

  notificationIds.forEach(notificationId => {
    batch.update(notificationsRef.doc(notificationId), {
      read: true,
    });
  });

  return batch.commit();
}
