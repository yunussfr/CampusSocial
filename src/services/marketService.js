import firestore from '@react-native-firebase/firestore';
import { COLLECTIONS } from '../constants/collections';
import { firestoreDb } from './firebase';

function mapDoc(doc) {
  return {
    id: doc.id,
    ...doc.data(),
  };
}

export function subscribeToListings({ onData, onError }) {
  return firestoreDb
    .collection(COLLECTIONS.LISTINGS)
    .where('status', 'in', ['active', 'reserved'])
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

export async function createListing(input, seller) {
  const now = firestore.FieldValue.serverTimestamp();
  const listingRef = firestoreDb.collection(COLLECTIONS.LISTINGS).doc();

  await listingRef.set({
    title: input.title.trim(),
    description: input.description.trim(),
    price: Number(input.price),
    currency: input.currency || 'TRY',
    category: input.category.trim(),
    condition: input.condition || 'used',
    imageURLs: input.imageURLs || [],
    sellerId: seller.uid,
    seller: {
      uid: seller.uid,
      displayName: seller.displayName || '',
      photoURL: seller.photoURL || '',
    },
    status: 'active',
    viewCount: 0,
    savedCount: 0,
    tags: input.tags || [],
    createdAt: now,
    updatedAt: now,
  });

  return listingRef.id;
}

export async function saveListing(userId, listingId) {
  return firestoreDb
    .collection(COLLECTIONS.USERS)
    .doc(userId)
    .collection(COLLECTIONS.SAVED_LISTINGS)
    .doc(listingId)
    .set({
      listingId,
      savedAt: firestore.FieldValue.serverTimestamp(),
    });
}
