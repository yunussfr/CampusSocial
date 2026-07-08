import firestore from '@react-native-firebase/firestore';
import { COLLECTIONS } from '../constants/collections';
import { firestoreDb } from './firebase';

function mapDoc(doc) {
  const data = doc.data();

  return {
    id: doc.id,
    ...data,
  };
}

export function subscribeToEvents({ onData, onError }) {
  return firestoreDb
    .collection(COLLECTIONS.EVENTS)
    .where('status', '==', 'active')
    .onSnapshot(
      snapshot => {
        onData(snapshot.docs.map(mapDoc));
      },
      error => {
        if (onError) {
          onError(error);
        }
      },
    );
}

export async function createEvent(eventInput, organizer) {
  const now = firestore.FieldValue.serverTimestamp();
  const eventRef = firestoreDb.collection(COLLECTIONS.EVENTS).doc();

  await eventRef.set({
    title: eventInput.title.trim(),
    description: eventInput.description.trim(),
    coverURL: eventInput.coverURL || '',
    organizerId: organizer.uid,
    organizer: {
      uid: organizer.uid,
      displayName: organizer.displayName || eventInput.organizerName || '',
      photoURL: organizer.photoURL || '',
    },
    category: eventInput.category.trim(),
    location: eventInput.location,
    locationLabel: eventInput.locationLabel || '',
    startDate: eventInput.startDate || now,
    endDate: eventInput.endDate || eventInput.startDate || now,
    capacity: Number(eventInput.capacity),
    attendeeCount: 0,
    isOnline: Boolean(eventInput.isOnline),
    tags: eventInput.tags || [],
    likeCount: 0,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  });

  return eventRef.id;
}

export async function updateEventCover(eventId, coverURL) {
  return firestoreDb.collection(COLLECTIONS.EVENTS).doc(eventId).update({
    coverURL,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

export async function joinEvent(eventId, userId) {
  return firestoreDb
    .collection(COLLECTIONS.EVENTS)
    .doc(eventId)
    .collection(COLLECTIONS.ATTENDEES)
    .doc(userId)
    .set({
      userId,
      joinedAt: firestore.FieldValue.serverTimestamp(),
      status: 'confirmed',
    });
}

export async function leaveEvent(eventId, userId) {
  return firestoreDb
    .collection(COLLECTIONS.EVENTS)
    .doc(eventId)
    .collection(COLLECTIONS.ATTENDEES)
    .doc(userId)
    .delete();
}
