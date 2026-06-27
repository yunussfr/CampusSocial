import firestore from '@react-native-firebase/firestore';
import { firebaseAuth, firestoreDb } from './firebase';
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

export async function sendPasswordReset(email) {
  return firebaseAuth.sendPasswordResetEmail(email.trim());
}

export async function signOutUser() {
  return firebaseAuth.signOut();
}
