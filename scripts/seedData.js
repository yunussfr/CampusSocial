const now = new Date();
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

const users = {
  user_deniz: {
    uid: 'user_deniz',
    displayName: 'Deniz Yilmaz',
    email: 'deniz.yilmaz@campus.test',
    photoURL: '',
    department: 'Muhendislik Fakultesi',
    year: 3,
    bio: 'Yazilim, topluluk etkinlikleri ve kampus projeleriyle ilgileniyorum.',
    interests: ['Yazilim', 'Gonulluluk', 'Kariyer'],
    followersCount: 1,
    followingCount: 1,
    createdAt: now,
    updatedAt: now,
  },
  user_eda: {
    uid: 'user_eda',
    displayName: 'Eda Kaya',
    email: 'eda.kaya@campus.test',
    photoURL: '',
    department: 'Isletme Fakultesi',
    year: 2,
    bio: 'Etkinlik organizasyonu ve girisimcilik topluluklarinda aktifim.',
    interests: ['Girisimcilik', 'Etkinlik', 'Tasarim'],
    followersCount: 1,
    followingCount: 1,
    createdAt: now,
    updatedAt: now,
  },
  user_mert: {
    uid: 'user_mert',
    displayName: 'Mert Demir',
    email: 'mert.demir@campus.test',
    photoURL: '',
    department: 'Iktisadi ve Idari Bilimler',
    year: 4,
    bio: 'Kampus marketinde ders kitaplari ve ekipman ilanlari paylasiyorum.',
    interests: ['Market', 'Finans', 'Spor'],
    followersCount: 0,
    followingCount: 0,
    createdAt: now,
    updatedAt: now,
  },
};

const events = {
  event_yazilim_atolyesi: {
    title: 'React Native Atolyesi',
    description: 'Mobil uygulama gelistirme temelleri ve CampusConnect ornekleri.',
    coverURL: '',
    organizerId: 'user_deniz',
    organizer: {
      uid: 'user_deniz',
      displayName: users.user_deniz.displayName,
      photoURL: users.user_deniz.photoURL,
    },
    category: 'Teknoloji',
    location: 'Muhendislik B Blok Lab 3',
    startDate: tomorrow,
    endDate: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000),
    capacity: 40,
    attendeeCount: 1,
    isOnline: false,
    tags: ['react-native', 'mobil', 'atolye'],
    likeCount: 3,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  },
  event_kariyer_bulusmasi: {
    title: 'Kariyer Bulusmasi',
    description: 'Mezunlarla CV, staj ve mulakat deneyimi paylasimi.',
    coverURL: '',
    organizerId: 'user_eda',
    organizer: {
      uid: 'user_eda',
      displayName: users.user_eda.displayName,
      photoURL: users.user_eda.photoURL,
    },
    category: 'Kariyer',
    location: 'Konferans Salonu',
    startDate: nextWeek,
    endDate: new Date(nextWeek.getTime() + 3 * 60 * 60 * 1000),
    capacity: 120,
    attendeeCount: 0,
    isOnline: false,
    tags: ['kariyer', 'mezun', 'staj'],
    likeCount: 1,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  },
};

const communities = {
  community_yazilim: {
    name: 'Yazilim Toplulugu',
    description: 'Mobil, web ve yapay zeka projeleri ureten ogrenci toplulugu.',
    coverURL: '',
    iconURL: '',
    creatorId: 'user_deniz',
    category: 'Teknoloji',
    memberCount: 2,
    isPrivate: false,
    tags: ['yazilim', 'proje', 'hackathon'],
    rules: ['Saygili iletisim kur.', 'Kaynak paylasirken aciklama ekle.'],
    createdAt: now,
    updatedAt: now,
  },
  community_girisimcilik: {
    name: 'Girisimcilik Kulubu',
    description: 'Fikir, ekip ve demo gunu duyurulari icin private alan.',
    coverURL: '',
    iconURL: '',
    creatorId: 'user_eda',
    category: 'Girisimcilik',
    memberCount: 1,
    isPrivate: true,
    tags: ['startup', 'pitch', 'demo'],
    rules: ['Private icerigi disari tasima.', 'Geri bildirimleri yapici ver.'],
    createdAt: now,
    updatedAt: now,
  },
};

const listings = {
  listing_algoritma_kitabi: {
    title: 'Algoritma Ders Kitabi',
    description: 'Temiz kullanilmis, not alinmamis algoritma kitabi.',
    price: 250,
    currency: 'TRY',
    category: 'Kitap',
    condition: 'good',
    imageURLs: [],
    sellerId: 'user_mert',
    seller: {
      uid: 'user_mert',
      displayName: users.user_mert.displayName,
      photoURL: users.user_mert.photoURL,
    },
    status: 'active',
    viewCount: 5,
    savedCount: 1,
    tags: ['algoritma', 'kitap', 'ders'],
    createdAt: now,
    updatedAt: now,
  },
  listing_hesap_makinesi: {
    title: 'Bilimsel Hesap Makinesi',
    description: 'Sinavlara uygun, calisir durumda.',
    price: 180,
    currency: 'TRY',
    category: 'Elektronik',
    condition: 'used',
    imageURLs: [],
    sellerId: 'user_eda',
    seller: {
      uid: 'user_eda',
      displayName: users.user_eda.displayName,
      photoURL: users.user_eda.photoURL,
    },
    status: 'reserved',
    viewCount: 3,
    savedCount: 0,
    tags: ['hesap-makinesi', 'sinav'],
    createdAt: now,
    updatedAt: now,
  },
};

const chats = {
  chat_deniz_mert_listing: {
    participants: ['user_deniz', 'user_mert'],
    participantProfiles: {
      user_deniz: {
        displayName: users.user_deniz.displayName,
        photoURL: users.user_deniz.photoURL,
      },
      user_mert: {
        displayName: users.user_mert.displayName,
        photoURL: users.user_mert.photoURL,
      },
    },
    relatedListingId: 'listing_algoritma_kitabi',
    lastMessage: {
      text: 'Kitap hala satilik mi?',
      senderId: 'user_deniz',
      createdAt: now,
    },
    unreadBy: ['user_mert'],
    createdAt: now,
    updatedAt: now,
  },
};

const subcollections = [
  {
    path: ['events', 'event_yazilim_atolyesi', 'attendees', 'user_eda'],
    data: {
      userId: 'user_eda',
      joinedAt: now,
      status: 'confirmed',
    },
  },
  {
    path: ['communities', 'community_yazilim', 'members', 'user_deniz'],
    data: {
      userId: 'user_deniz',
      role: 'admin',
      joinedAt: now,
    },
  },
  {
    path: ['communities', 'community_yazilim', 'members', 'user_eda'],
    data: {
      userId: 'user_eda',
      role: 'member',
      joinedAt: now,
    },
  },
  {
    path: ['communities', 'community_yazilim', 'posts', 'post_tanisma'],
    data: {
      userId: 'user_deniz',
      author: {
        uid: 'user_deniz',
        displayName: users.user_deniz.displayName,
        photoURL: users.user_deniz.photoURL,
      },
      content: 'Bu hafta React Native calisma grubu kuruyoruz.',
      imageURLs: [],
      likeCount: 0,
      commentCount: 1,
      createdAt: now,
      updatedAt: now,
    },
  },
  {
    path: ['communities', 'community_yazilim', 'posts', 'post_tanisma', 'comments', 'comment_eda'],
    data: {
      userId: 'user_eda',
      text: 'Ben de katilmak isterim.',
      createdAt: now,
      updatedAt: now,
    },
  },
  {
    path: ['chats', 'chat_deniz_mert_listing', 'messages', 'message_1'],
    data: {
      senderId: 'user_deniz',
      text: 'Kitap hala satilik mi?',
      read: false,
      createdAt: now,
    },
  },
  {
    path: ['users', 'user_deniz', 'savedListings', 'listing_algoritma_kitabi'],
    data: {
      listingId: 'listing_algoritma_kitabi',
      savedAt: now,
    },
  },
  {
    path: ['users', 'user_deniz', 'notifications', 'notif_event'],
    data: {
      type: 'event',
      title: 'Etkinlik hatirlatmasi',
      body: 'React Native Atolyesi yarin basliyor.',
      relatedId: 'event_yazilim_atolyesi',
      read: false,
      createdAt: now,
    },
  },
];

module.exports = {
  rootCollections: {
    users,
    events,
    communities,
    listings,
    chats,
  },
  subcollections,
};
