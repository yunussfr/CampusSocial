import { firebaseStorage } from './firebase';

function normalizeUri(uri) {
  return uri?.replace('file://', '');
}

async function uploadFile({ localUri, path, contentType }) {
  const reference = firebaseStorage.ref(path);

  await reference.putFile(normalizeUri(localUri), {
    contentType: contentType || 'image/jpeg',
  });

  return reference.getDownloadURL();
}

export async function uploadEventCover(eventId, asset) {
  return uploadFile({
    localUri: asset.uri,
    path: `events/${eventId}/cover.jpg`,
    contentType: asset.type,
  });
}

export async function uploadCommunityCover(communityId, asset) {
  return uploadFile({
    localUri: asset.uri,
    path: `communities/${communityId}/cover.jpg`,
    contentType: asset.type,
  });
}

export async function uploadCommunityIcon(communityId, asset) {
  return uploadFile({
    localUri: asset.uri,
    path: `communities/${communityId}/icon.jpg`,
    contentType: asset.type,
  });
}

export async function uploadListingImages(listingId, assets) {
  const uploadTasks = assets.map((asset, index) =>
    uploadFile({
      localUri: asset.uri,
      path: `listings/${listingId}/${index}.jpg`,
      contentType: asset.type,
    }),
  );

  return Promise.all(uploadTasks);
}

export async function uploadUserAvatar(userId, asset) {
  return uploadFile({
    localUri: asset.uri,
    path: `users/${userId}/avatar.jpg`,
    contentType: asset.type,
  });
}
