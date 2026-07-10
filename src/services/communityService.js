import firestore from '@react-native-firebase/firestore';
import { COLLECTIONS } from '../constants/collections';
import { firestoreDb } from './firebase';

function mapDoc(doc) {
  return {
    id: doc.id,
    ...doc.data(),
  };
}

export function subscribeToCommunities({ onData, onError }) {
  return firestoreDb
    .collection(COLLECTIONS.COMMUNITIES)
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

export async function createCommunity(input, creator) {
  const now = firestore.FieldValue.serverTimestamp();
  const communityRef = firestoreDb.collection(COLLECTIONS.COMMUNITIES).doc();

  await communityRef.set({
    name: input.name.trim(),
    description: input.description.trim(),
    coverURL: input.coverURL || '',
    iconURL: input.iconURL || '',
    creatorId: creator.uid,
    category: input.category.trim(),
    memberCount: 0,
    isPrivate: Boolean(input.isPrivate),
    privacy: input.privacy || (input.isPrivate ? 'private' : 'public'),
    tags: input.tags || [],
    rules: input.rules || [],
    createdAt: now,
    updatedAt: now,
  });

  await communityRef.collection(COLLECTIONS.MEMBERS).doc(creator.uid).set({
    userId: creator.uid,
    role: 'admin',
    joinedAt: now,
  });

  return communityRef.id;
}

export async function updateCommunityMedia(communityId, media) {
  return firestoreDb.collection(COLLECTIONS.COMMUNITIES).doc(communityId).update({
    ...media,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

export async function joinCommunity(communityId, userId) {
  const communitySnapshot = await firestoreDb
    .collection(COLLECTIONS.COMMUNITIES)
    .doc(communityId)
    .get();

  const community = communitySnapshot.data();

  if (
    community?.creatorId !== userId &&
    (community?.isPrivate === true || community?.privacy === 'private')
  ) {
    throw new Error('Kapalı topluluklar için katılım isteği gerekir.');
  }

  return firestoreDb
    .collection(COLLECTIONS.COMMUNITIES)
    .doc(communityId)
    .collection(COLLECTIONS.MEMBERS)
    .doc(userId)
    .set({
      userId,
      role: 'member',
      joinedAt: firestore.FieldValue.serverTimestamp(),
    });
}

export async function requestCommunityJoin(communityId, requester) {
  const now = firestore.FieldValue.serverTimestamp();

  return firestoreDb
    .collection(COLLECTIONS.COMMUNITIES)
    .doc(communityId)
    .collection(COLLECTIONS.JOIN_REQUESTS)
    .doc(requester.uid)
    .set({
      communityId,
      requesterId: requester.uid,
      requesterName: requester.displayName || '',
      requesterPhotoURL: requester.photoURL || '',
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    });
}

export function subscribeToCommunityJoinRequest({
  communityId,
  userId,
  onData,
  onError,
}) {
  return firestoreDb
    .collection(COLLECTIONS.COMMUNITIES)
    .doc(communityId)
    .collection(COLLECTIONS.JOIN_REQUESTS)
    .doc(userId)
    .onSnapshot(
      doc => {
        onData(doc.exists ? mapDoc(doc) : null);
      },
      error => {
        if (onError) {
          onError(error);
        }
      },
    );
}

export async function updateCommunityJoinRequestStatus({
  communityId,
  requesterId,
  reviewerId,
  status,
}) {
  return firestoreDb
    .collection(COLLECTIONS.COMMUNITIES)
    .doc(communityId)
    .collection(COLLECTIONS.JOIN_REQUESTS)
    .doc(requesterId)
    .set(
      {
        status,
        reviewedAt: firestore.FieldValue.serverTimestamp(),
        reviewedBy: reviewerId,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      },
      {merge: true},
    );
}

export async function leaveCommunity(communityId, userId) {
  return firestoreDb
    .collection(COLLECTIONS.COMMUNITIES)
    .doc(communityId)
    .collection(COLLECTIONS.MEMBERS)
    .doc(userId)
    .delete();
}

export function subscribeToCommunityPosts({ communityId, onData, onError }) {
  return firestoreDb
    .collection(COLLECTIONS.COMMUNITIES)
    .doc(communityId)
    .collection(COLLECTIONS.POSTS)
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

export async function createCommunityPost(communityId, input, author) {
  return firestoreDb
    .collection(COLLECTIONS.COMMUNITIES)
    .doc(communityId)
    .collection(COLLECTIONS.POSTS)
    .add({
      userId: author.uid,
      author: {
        uid: author.uid,
        displayName: author.displayName || '',
        photoURL: author.photoURL || '',
      },
      content: input.content.trim(),
      imageURLs: input.imageURLs || [],
      likeCount: 0,
      commentCount: 0,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
}
