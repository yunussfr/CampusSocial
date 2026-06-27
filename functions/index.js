const admin = require('firebase-admin');
const {
  onDocumentCreated,
  onDocumentDeleted,
} = require('firebase-functions/v2/firestore');

admin.initializeApp();

const db = admin.firestore();
const fieldValue = admin.firestore.FieldValue;

function incrementBy(amount) {
  return fieldValue.increment(amount);
}

async function updateDocument(path, data) {
  return db.doc(path).set(data, { merge: true });
}

exports.onEventJoin = onDocumentCreated(
  'events/{eventId}/attendees/{userId}',
  async event => {
    const { eventId } = event.params;

    await updateDocument(`events/${eventId}`, {
      attendeeCount: incrementBy(1),
      updatedAt: fieldValue.serverTimestamp(),
    });
  },
);

exports.onEventLeave = onDocumentDeleted(
  'events/{eventId}/attendees/{userId}',
  async event => {
    const { eventId } = event.params;

    await updateDocument(`events/${eventId}`, {
      attendeeCount: incrementBy(-1),
      updatedAt: fieldValue.serverTimestamp(),
    });
  },
);

exports.onCommunityJoin = onDocumentCreated(
  'communities/{communityId}/members/{userId}',
  async event => {
    const { communityId } = event.params;

    await updateDocument(`communities/${communityId}`, {
      memberCount: incrementBy(1),
      updatedAt: fieldValue.serverTimestamp(),
    });
  },
);

exports.onCommunityLeave = onDocumentDeleted(
  'communities/{communityId}/members/{userId}',
  async event => {
    const { communityId } = event.params;

    await updateDocument(`communities/${communityId}`, {
      memberCount: incrementBy(-1),
      updatedAt: fieldValue.serverTimestamp(),
    });
  },
);

exports.onMessageSent = onDocumentCreated(
  'chats/{chatId}/messages/{messageId}',
  async event => {
    const { chatId } = event.params;
    const message = event.data.data();

    await updateDocument(`chats/${chatId}`, {
      lastMessage: {
        text: message.text || '',
        senderId: message.senderId,
        createdAt: message.createdAt || fieldValue.serverTimestamp(),
      },
      updatedAt: fieldValue.serverTimestamp(),
    });
  },
);

exports.onListingSave = onDocumentCreated(
  'users/{userId}/savedListings/{listingId}',
  async event => {
    const { listingId } = event.params;

    await updateDocument(`listings/${listingId}`, {
      savedCount: incrementBy(1),
      updatedAt: fieldValue.serverTimestamp(),
    });
  },
);

exports.onUserFollow = onDocumentCreated(
  'users/{userId}/follows/{targetId}',
  async event => {
    const { userId, targetId } = event.params;

    await Promise.all([
      updateDocument(`users/${userId}`, {
        followingCount: incrementBy(1),
        updatedAt: fieldValue.serverTimestamp(),
      }),
      updateDocument(`users/${targetId}`, {
        followersCount: incrementBy(1),
        updatedAt: fieldValue.serverTimestamp(),
      }),
    ]);
  },
);

exports.onUserUnfollow = onDocumentDeleted(
  'users/{userId}/follows/{targetId}',
  async event => {
    const { userId, targetId } = event.params;

    await Promise.all([
      updateDocument(`users/${userId}`, {
        followingCount: incrementBy(-1),
        updatedAt: fieldValue.serverTimestamp(),
      }),
      updateDocument(`users/${targetId}`, {
        followersCount: incrementBy(-1),
        updatedAt: fieldValue.serverTimestamp(),
      }),
    ]);
  },
);
