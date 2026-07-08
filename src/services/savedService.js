import firestore from '@react-native-firebase/firestore';
import { COLLECTIONS } from '../constants/collections';
import { firestoreDb } from './firebase';

function mapDoc(doc) {
  return {
    id: doc.id,
    ...doc.data(),
  };
}

export function getListingSaveId(listingId) {
  return `listing_${listingId}`;
}

export function getPostSaveId(communityId, postId) {
  return `post_${communityId}_${postId}`;
}

export function subscribeToSaves({ userId, onData, onError }) {
  return firestoreDb
    .collection(COLLECTIONS.USERS)
    .doc(userId)
    .collection(COLLECTIONS.SAVES)
    .orderBy('savedAt', 'desc')
    .onSnapshot(
      snapshot => onData(snapshot.docs.map(mapDoc)),
      error => {
        if (onError) {
          onError(error);
        }
      },
    );
}

export async function saveListingItem(userId, listing) {
  const listingId = listing?.id;

  if (!listingId) {
    throw new Error('Kaydedilecek ilan bulunamadi.');
  }

  return firestoreDb
    .collection(COLLECTIONS.USERS)
    .doc(userId)
    .collection(COLLECTIONS.SAVES)
    .doc(getListingSaveId(listingId))
    .set({
      type: 'listing',
      listingId,
      title: listing.title || 'Ilan',
      description: listing.description || '',
      price: listing.price ?? null,
      currency: listing.currency || 'TRY',
      imageURL: listing.imageURLs?.[0] || '',
      sellerId: listing.sellerId || '',
      savedAt: firestore.FieldValue.serverTimestamp(),
    });
}

export async function savePostItem(userId, communityId, post) {
  const postId = post?.id;

  if (!communityId || !postId) {
    throw new Error('Kaydedilecek post bulunamadi.');
  }

  return firestoreDb
    .collection(COLLECTIONS.USERS)
    .doc(userId)
    .collection(COLLECTIONS.SAVES)
    .doc(getPostSaveId(communityId, postId))
    .set({
      type: 'post',
      communityId,
      postId,
      title: post.author?.displayName || 'Topluluk postu',
      description: post.content || '',
      authorId: post.userId || post.author?.uid || '',
      savedAt: firestore.FieldValue.serverTimestamp(),
    });
}

export async function removeSavedItem(userId, saveId) {
  return firestoreDb
    .collection(COLLECTIONS.USERS)
    .doc(userId)
    .collection(COLLECTIONS.SAVES)
    .doc(saveId)
    .delete();
}
