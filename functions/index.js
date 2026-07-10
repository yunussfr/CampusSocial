const admin = require('firebase-admin');
const {
  onDocumentCreated,
  onDocumentDeleted,
  onDocumentUpdated,
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

function getDisplayName(profile, fallback = 'CampusConnect') {
  return profile?.displayName || profile?.name || fallback;
}

async function getUserProfile(userId) {
  const snapshot = await db.collection('users').doc(userId).get();

  return snapshot.exists ? snapshot.data() : null;
}

async function createNotification(userId, payload) {
  return db
    .collection('users')
    .doc(userId)
    .collection('notifications')
    .add({
      ...payload,
      read: false,
      createdAt: fieldValue.serverTimestamp(),
    });
}

async function sendPushToUsers(userIds, notification, data = {}) {
  const userSnapshots = await Promise.all(
    userIds.map(userId => db.collection('users').doc(userId).get()),
  );
  const tokens = userSnapshots
    .map(snapshot => snapshot.data()?.fcmToken)
    .filter(Boolean);

  if (!tokens.length) {
    return null;
  }

  return admin.messaging().sendEachForMulticast({
    tokens,
    notification,
    data,
  });
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

exports.onCommunityJoinRequestCreated = onDocumentCreated(
  'communities/{communityId}/joinRequests/{requesterId}',
  async event => {
    const { communityId, requesterId } = event.params;
    const requestData = event.data.data();
    const communitySnapshot = await db.doc(`communities/${communityId}`).get();

    if (!communitySnapshot.exists) {
      return;
    }

    const community = communitySnapshot.data();
    const ownerId = community.creatorId;

    if (!ownerId || ownerId === requesterId) {
      return;
    }

    const requesterProfile = await getUserProfile(requesterId);
    const requesterName =
      requestData.requesterName ||
      getDisplayName(requesterProfile, 'Bir kullanıcı');
    const communityName = community.name || 'topluluğun';
    const notificationTitle = 'Yeni topluluk katılım isteği';
    const notificationBody =
      `${requesterName}, ${communityName} topluluğuna katılmak istiyor.`;

    await db
      .collection('users')
      .doc(ownerId)
      .collection('notifications')
      .doc(`communityJoinRequest_${communityId}_${requesterId}`)
      .set({
        type: 'community_join_request',
        communityId,
        communityName,
        requesterId,
        requesterName,
        requesterPhotoURL:
          requestData.requesterPhotoURL || requesterProfile?.photoURL || '',
        requestStatus: 'pending',
        title: notificationTitle,
        message: notificationBody,
        read: false,
        createdAt: fieldValue.serverTimestamp(),
        updatedAt: fieldValue.serverTimestamp(),
      });

    await sendPushToUsers(
      [ownerId],
      {
        title: notificationTitle,
        body: notificationBody,
      },
      {
        type: 'community_join_request',
        communityId,
        requesterId,
      },
    );
  },
);

exports.onCommunityJoinRequestUpdated = onDocumentUpdated(
  'communities/{communityId}/joinRequests/{requesterId}',
  async event => {
    const { communityId, requesterId } = event.params;
    const before = event.data.before.data();
    const after = event.data.after.data();

    if (before.status === after.status) {
      return;
    }

    if (!['approved', 'rejected'].includes(after.status)) {
      return;
    }

    const communitySnapshot = await db.doc(`communities/${communityId}`).get();

    if (!communitySnapshot.exists) {
      return;
    }

    const community = communitySnapshot.data();
    const communityName = community.name || 'Topluluk';

    if (after.status === 'approved') {
      await db
        .doc(`communities/${communityId}/members/${requesterId}`)
        .set({
          userId: requesterId,
          role: 'member',
          joinedAt: fieldValue.serverTimestamp(),
        });
    }

    if (community.creatorId) {
      await db
        .collection('users')
        .doc(community.creatorId)
        .collection('notifications')
        .doc(`communityJoinRequest_${communityId}_${requesterId}`)
        .set(
          {
            requestStatus: after.status,
            updatedAt: fieldValue.serverTimestamp(),
          },
          { merge: true },
        );
    }

    const approved = after.status === 'approved';
    const notificationTitle = approved
      ? 'Katılım isteğin onaylandı'
      : 'Katılım isteğin reddedildi';
    const notificationBody = approved
      ? `${communityName} topluluğuna katıldın.`
      : `${communityName} topluluğuna katılım isteğin reddedildi.`;

    await createNotification(requesterId, {
      type: approved ? 'community_join_approved' : 'community_join_rejected',
      communityId,
      communityName,
      requestStatus: after.status,
      title: notificationTitle,
      message: notificationBody,
    });

    await sendPushToUsers(
      [requesterId],
      {
        title: notificationTitle,
        body: notificationBody,
      },
      {
        type: approved ? 'community_join_approved' : 'community_join_rejected',
        communityId,
      },
    );
  },
);

exports.onUserFollow = onDocumentCreated(
  'users/{userId}/follows/{targetId}',
  async event => {
    const { userId, targetId } = event.params;
    const followerProfile = await getUserProfile(userId);
    const followerName = getDisplayName(followerProfile, 'Bir kullanıcı');
    const notificationTitle = `${followerName} seni takip etti`;
    const notificationBody = 'Yeni bir takipçin var.';

    await Promise.all([
      updateDocument(`users/${userId}`, {
        followingCount: incrementBy(1),
        updatedAt: fieldValue.serverTimestamp(),
      }),
      updateDocument(`users/${targetId}`, {
        followersCount: incrementBy(1),
        updatedAt: fieldValue.serverTimestamp(),
      }),
      createNotification(targetId, {
        type: 'follow',
        followerId: userId,
        title: notificationTitle,
        message: notificationBody,
      }),
    ]);

    await sendPushToUsers(
      [targetId],
      {
        title: notificationTitle,
        body: notificationBody,
      },
      {
        type: 'follow',
        followerId: userId,
      },
    );
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
