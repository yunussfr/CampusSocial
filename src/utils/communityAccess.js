import {getCommunityMemberIds} from './communityFormatters';

export function isCommunityPrivate(community) {
  if (!community) {
    return false;
  }

  if (community.privacy === 'private') {
    return true;
  }

  if (community.privacy === 'public') {
    return false;
  }

  return community.isPrivate === true;
}

export function isCommunityMember(community, user, joinedCommunityIds = []) {
  const userId = user?.uid || user?.id;

  if (!userId || !community?.id) {
    return false;
  }

  return (
    community.creatorId === userId ||
    joinedCommunityIds.includes(community.id) ||
    getCommunityMemberIds(community).includes(userId)
  );
}

export function canViewCommunityPosts(community, isMember) {
  return !isCommunityPrivate(community) || isMember;
}

export function canCreateCommunityPost(community, isMember) {
  return isCommunityPrivate(community) && isMember;
}

export function canOpenCommunityPostDetail(community, isMember) {
  return !isCommunityPrivate(community) || isMember;
}

export function getCommunityAccessMessage(community, isMember) {
  if (isCommunityPrivate(community)) {
    if (isMember) {
      return {
        tone: 'privateMember',
        title: 'Bu özel bir topluluktur',
        description:
          'Üye olduğunuz için gönderileri paylaşabilir, yorum yapabilir ve detaylara erişebilirsiniz.',
      };
    }

    return {
      tone: 'locked',
      title: 'Bu özel bir topluluktur',
      description:
        'Gönderileri görmek ve paylaşım yapmak için katılım isteği göndermelisin.',
    };
  }

  return {
    tone: 'public',
    title: 'Bu topluluk herkese açık',
    description:
      'Gönderileri görebilirsiniz. Paylaşım yapmak için topluluk ayarları gereklidir.',
  };
}
