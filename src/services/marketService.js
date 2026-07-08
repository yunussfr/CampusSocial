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
    .where('status', 'in', ['active', 'reserved', 'sold'])
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
    categoryLabel: input.categoryLabel || input.category.trim(),
    subCategory: input.subCategory || '',
    condition: input.condition || 'used',
    conditionLabel: input.conditionLabel || input.condition || 'used',
    imageURLs: input.imageURLs || [],
    sellerId: seller.uid,
    seller: {
      uid: seller.uid,
      displayName: seller.displayName || '',
      photoURL: seller.photoURL || '',
      department: seller.department || '',
      campusName: seller.campusName || '',
    },
    brand: input.brand || '',
    model: input.model || '',
    color: input.color || '',
    material: input.material || '',
    dimensions: input.dimensions || '',
    usageDuration: input.usageDuration || '',
    warranty: input.warranty || 'unknown',
    warrantyLabel: input.warrantyLabel || '',
    invoice: input.invoice || 'unknown',
    invoiceLabel: input.invoiceLabel || '',
    originalBox: input.originalBox || 'unknown',
    originalBoxLabel: input.originalBoxLabel || '',
    city: input.city || '',
    district: input.district || '',
    neighborhood: input.neighborhood || '',
    location: input.location || null,
    deliveryPreference: input.deliveryPreference || '',
    deliveryPreferenceLabel: input.deliveryPreferenceLabel || '',
    shippingPayer: input.shippingPayer || '',
    shippingPayerLabel: input.shippingPayerLabel || '',
    paymentMethods: input.paymentMethods || [],
    paymentMethodLabels: input.paymentMethodLabels || [],
    sellerType: input.sellerType || 'individual',
    sellerTypeLabel: input.sellerTypeLabel || '',
    status: input.status || 'active',
    statusLabel: input.statusLabel || '',
    negotiable: Boolean(input.negotiable),
    isFree: Boolean(input.isFree),
    viewCount: Number(input.viewCount || 0),
    savedCount: Number(input.savedCount || 0),
    tags: input.tags || [],
    createdAt: now,
    updatedAt: now,
  });

  return listingRef.id;
}

export function subscribeToUserListings({ userId, onData, onError }) {
  return firestoreDb
    .collection(COLLECTIONS.LISTINGS)
    .where('sellerId', '==', userId)
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

export function subscribeToSavedListingIds({ userId, onData, onError }) {
  return firestoreDb
    .collection(COLLECTIONS.USERS)
    .doc(userId)
    .collection(COLLECTIONS.SAVED_LISTINGS)
    .onSnapshot(
      snapshot => onData(snapshot.docs.map(doc => doc.id)),
      error => {
        if (onError) {
          onError(error);
        }
      },
    );
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

export async function removeSavedListing(userId, listingId) {
  return firestoreDb
    .collection(COLLECTIONS.USERS)
    .doc(userId)
    .collection(COLLECTIONS.SAVED_LISTINGS)
    .doc(listingId)
    .delete();
}

export async function updateListingImages(listingId, imageURLs) {
  return firestoreDb.collection(COLLECTIONS.LISTINGS).doc(listingId).set(
    {
      imageURLs,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}
