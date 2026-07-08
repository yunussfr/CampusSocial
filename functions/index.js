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
    const { eventId, userId } = event.params;

    await updateDocument(`events/${eventId}`, {
      attendeeCount: incrementBy(1),
      attendeeIds: fieldValue.arrayUnion(userId),
      updatedAt: fieldValue.serverTimestamp(),
    });
  },
);

exports.onEventLeave = onDocumentDeleted(
  'events/{eventId}/attendees/{userId}',
  async event => {
    const { eventId, userId } = event.params;

    await updateDocument(`events/${eventId}`, {
      attendeeCount: incrementBy(-1),
      attendeeIds: fieldValue.arrayRemove(userId),
      updatedAt: fieldValue.serverTimestamp(),
    });
  },
);

exports.onCommunityJoin = onDocumentCreated(
  'communities/{communityId}/members/{userId}',
  async event => {
    const { communityId, userId } = event.params;

    await updateDocument(`communities/${communityId}`, {
      memberCount: incrementBy(1),
      memberIds: fieldValue.arrayUnion(userId),
      updatedAt: fieldValue.serverTimestamp(),
    });
  },
);

exports.onCommunityLeave = onDocumentDeleted(
  'communities/{communityId}/members/{userId}',
  async event => {
    const { communityId, userId } = event.params;

    await updateDocument(`communities/${communityId}`, {
      memberCount: incrementBy(-1),
      memberIds: fieldValue.arrayRemove(userId),
      updatedAt: fieldValue.serverTimestamp(),
    });
  },
);

exports.onMessageSent = onDocumentCreated(
  'chats/{chatId}/messages/{messageId}',
  async event => {
    const { chatId } = event.params;
    const message = event.data.data();
    const chatRef = db.doc(`chats/${chatId}`);
    const chatSnapshot = await chatRef.get();
    const chat = chatSnapshot.exists ? chatSnapshot.data() : null;
    const recipientIds = (chat?.participants || []).filter(userId => {
      return userId !== message.senderId;
    });

    await chatRef.set({
      lastMessage: {
        text: message.text || '',
        senderId: message.senderId,
        createdAt: message.createdAt || fieldValue.serverTimestamp(),
      },
      updatedAt: fieldValue.serverTimestamp(),
    }, { merge: true });

    if (!recipientIds.length) {
      return;
    }

    const senderProfile =
      chat?.participantProfiles?.[message.senderId] || {};
    const senderName =
      senderProfile.displayName || 'CampusConnect';
    const notificationTitle = `${senderName} sana mesaj gönderdi`;
    const notificationBody = message.text || 'Yeni bir mesajın var.';

    await Promise.all(
      recipientIds.map(recipientId => {
        return db
          .collection('users')
          .doc(recipientId)
          .collection('notifications')
          .add({
            type: 'message',
            chatId,
            senderId: message.senderId,
            title: notificationTitle,
            message: notificationBody,
            read: false,
            createdAt: fieldValue.serverTimestamp(),
          });
      }),
    );

    const recipientSnapshots = await Promise.all(
      recipientIds.map(recipientId => {
        return db.collection('users').doc(recipientId).get();
      }),
    );
    const tokens = recipientSnapshots
      .map(snapshot => snapshot.data()?.fcmToken)
      .filter(Boolean);

    if (!tokens.length) {
      return;
    }

    await admin.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title: notificationTitle,
        body: notificationBody,
      },
      data: {
        type: 'message',
        chatId,
        senderId: message.senderId || '',
      },
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
