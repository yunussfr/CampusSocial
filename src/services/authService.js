import firestore from '@react-native-firebase/firestore';
import { firebaseAuth, firebaseMessaging, firestoreDb } from './firebase';
import { COLLECTIONS } from '../constants/collections';

function mapUser(firebaseUser) {
  if (!firebaseUser) {
    return null;
  }

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
  };
}

export function subscribeToAuthState(onUserChanged, onError) {
  return firebaseAuth.onAuthStateChanged(
    firebaseUser => {
      onUserChanged(mapUser(firebaseUser));
    },
    error => {
      if (onError) {
        onError(error);
      }
    },
  );
}

export async function getUserProfile(uid) {
  const profileDoc = await firestoreDb.collection(COLLECTIONS.USERS).doc(uid).get();

  if (!profileDoc.exists) {
    return null;
  }

  return {
    id: profileDoc.id,
    ...profileDoc.data(),
  };
}

export async function signInWithEmail(email, password) {
  const credential = await firebaseAuth.signInWithEmailAndPassword(
    email.trim(),
    password,
  );

  return mapUser(credential.user);
}

export async function registerWithEmail({ email, password, profile }) {
  const credential = await firebaseAuth.createUserWithEmailAndPassword(
    email.trim(),
    password,
  );

  const user = mapUser(credential.user);
  const now = firestore.FieldValue.serverTimestamp();

  await firestoreDb
    .collection(COLLECTIONS.USERS)
    .doc(user.uid)
    .set({
      uid: user.uid,
      email: user.email,
      displayName: profile?.displayName || '',
      department: profile?.department || '',
      year: profile?.year || null,
      interests: profile?.interests || [],
      bio: profile?.bio || '',
      photoURL: profile?.photoURL || '',
      fcmToken: profile?.fcmToken || null,
      profileCompleted: Boolean(profile?.department && profile?.year),
      followersCount: 0,
      followingCount: 0,
      createdAt: now,
      updatedAt: now,
    });

  return user;
}

export async function completeUserProfile(uid, profile) {
  const now = firestore.FieldValue.serverTimestamp();

  await firestoreDb
    .collection(COLLECTIONS.USERS)
    .doc(uid)
    .set(
      {
        displayName: profile.displayName.trim(),
        department: profile.department.trim(),
        year: Number(profile.year),
        interests: profile.interests,
        bio: profile.bio.trim(),
        photoURL: profile.photoURL || '',
        fcmToken: profile.fcmToken || null,
        profileCompleted: true,
        updatedAt: now,
      },
      { merge: true },
    );

  const currentUser = firebaseAuth.currentUser;

  if (currentUser?.updateProfile) {
    await currentUser.updateProfile({
      displayName: profile.displayName.trim(),
      photoURL: profile.photoURL || undefined,
    });
  }

  return getUserProfile(uid);
}

export async function updateUserProfile(uid, profile) {
  const nextProfile = {
    displayName: profile.displayName.trim(),
    department: profile.department.trim(),
    year: Number(profile.year),
    interests: profile.interests || [],
    bio: profile.bio.trim(),
    photoURL: profile.photoURL || '',
    ...(profile.profileTheme ? { profileTheme: profile.profileTheme } : {}),
    updatedAt: firestore.FieldValue.serverTimestamp(),
  };

  await firestoreDb
    .collection(COLLECTIONS.USERS)
    .doc(uid)
    .set(nextProfile, { merge: true });

  const currentUser = firebaseAuth.currentUser;

  if (currentUser?.updateProfile) {
    await currentUser.updateProfile({
      displayName: nextProfile.displayName,
      photoURL: nextProfile.photoURL || undefined,
    });
  }

  return getUserProfile(uid);
}

export async function deleteCurrentUserAccount(uid) {
  const currentUser = firebaseAuth.currentUser;

  if (!currentUser) {
    throw new Error('Oturum bulunamadı.');
  }

  const userRef = firestoreDb.collection(COLLECTIONS.USERS).doc(uid);

  await userRef.set(
    {
      accountStatus: 'deleting',
      fcmToken: null,
      deletedAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  try {
    return await currentUser.delete();
  } catch (deleteError) {
    await userRef.set(
      {
        accountStatus: firestore.FieldValue.delete(),
        deletedAt: firestore.FieldValue.delete(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    throw deleteError;
  }
}

export async function followUser(currentUserId, targetUserId) {
  const now = firestore.FieldValue.serverTimestamp();

  return firestoreDb
    .collection(COLLECTIONS.USERS)
    .doc(currentUserId)
    .collection(COLLECTIONS.FOLLOWS)
    .doc(targetUserId)
    .set({
      targetUserId,
      followedAt: now,
    });
}

export async function unfollowUser(currentUserId, targetUserId) {
  return firestoreDb
    .collection(COLLECTIONS.USERS)
    .doc(currentUserId)
    .collection(COLLECTIONS.FOLLOWS)
    .doc(targetUserId)
    .delete();
}

async function getUserProfilesByIds(userIds) {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));

  const profileDocs = await Promise.all(
    uniqueIds.map(userId =>
      firestoreDb.collection(COLLECTIONS.USERS).doc(userId).get(),
    ),
  );

  return profileDocs
    .filter(profileDoc => profileDoc.exists)
    .map(profileDoc => ({
      id: profileDoc.id,
      ...profileDoc.data(),
    }));
}

export function subscribeToFollowing(userId, onChanged, onError) {
  return firestoreDb
    .collection(COLLECTIONS.USERS)
    .doc(userId)
    .collection(COLLECTIONS.FOLLOWS)
    .orderBy('followedAt', 'desc')
    .onSnapshot(async snapshot => {
      try {
        const userIds = snapshot.docs.map(
          followDoc => followDoc.data()?.targetUserId || followDoc.id,
        );

        const profiles = await getUserProfilesByIds(userIds);
        const profileById = new Map(
          profiles.map(profile => [profile.uid || profile.id, profile]),
        );

        onChanged(userIds.map(id => profileById.get(id)).filter(Boolean));
      } catch (error) {
        onError?.(error);
      }
    }, onError);
}

export function subscribeToFollowers(userId, onChanged, onError) {
  return firestoreDb
    .collectionGroup(COLLECTIONS.FOLLOWS)
    .where('targetUserId', '==', userId)
    .orderBy('followedAt', 'desc')
    .onSnapshot(async snapshot => {
      try {
        const userIds = snapshot.docs
          .map(followDoc => followDoc.ref.parent.parent?.id)
          .filter(Boolean);

        const profiles = await getUserProfilesByIds(userIds);
        const profileById = new Map(
          profiles.map(profile => [profile.uid || profile.id, profile]),
        );

        onChanged(userIds.map(id => profileById.get(id)).filter(Boolean));
      } catch (error) {
        onError?.(error);
      }
    }, onError);
}

export async function setUserFcmToken(uid, fcmToken) {
  return firestoreDb.collection(COLLECTIONS.USERS).doc(uid).set(
    {
      fcmToken,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

export async function requestAndSaveFcmToken(uid) {
  if (firebaseMessaging.requestPermission) {
    const permissionStatus = await firebaseMessaging.requestPermission();

    if (
      permissionStatus === firebaseMessaging.AuthorizationStatus?.DENIED ||
      permissionStatus === -1
    ) {
      throw new Error('Bildirim izni verilmedi.');
    }
  }

  const token = firebaseMessaging.getToken
    ? await firebaseMessaging.getToken()
    : null;

  if (!token) {
    throw new Error('Bildirim tokeni alınamadı.');
  }

  await setUserFcmToken(uid, token);

  return token;
}

export async function sendPasswordReset(email) {
  return firebaseAuth.sendPasswordResetEmail(email.trim());
}

export async function signOutUser() {
  return firebaseAuth.signOut();
}
