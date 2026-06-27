# CampusConnect Figma Screen Requirements

Bu dokuman Figma tasarimi icin ana kaynak olarak kullanilmalidir. Amaci, tasarim bittikten sonra ayni ekranlarin React Native ve Firebase ile dogrudan kodlanabilmesini saglamaktir.

Bu dokumanda yalnizca proje dokumaninda istenen ve mevcut Firestore veri modelinde karsiligi olan islevler yer alir. Veri modelinde karsiligi olmayan gereksiz ozellikler eklenmemistir.

## Temel Tasarim Mantigi

CampusConnect uygulamasi 5 ana tab uzerinden tasarlanmalidir:

- Discover
- Topluluk
- Market
- Mesajlar
- Profil

Auth ekranlari ayri Auth Stack icinde yer alir. Giris yapmamis kullanici ana uygulamayi gormemelidir.

Tasarimdaki her kart, filtre, sayac, badge ve aksiyon Firestore'daki gercek bir alana veya Cloud Functions tarafindan yonetilecek bir isleme karsilik gelmelidir.

## Ortak Ekran State'leri

Asagidaki state'ler ilgili ekranlarda Figma'da mutlaka temsil edilmelidir:

- Loading state
- Empty state
- Error state
- Normal data state
- Dark mode state
- Permission-based state

Permission-based state ornekleri:

- Event organizer kendi etkinliginde duzenleme/iptal aksiyonu gorur.
- Normal kullanici etkinlikte katil/ayril aksiyonu gorur.
- Listing seller kendi ilaninda duzenle/satildi yap aksiyonlarini gorur.
- Buyer listing detayinda saticiyla iletisime gec aksiyonu gorur.
- Private community uyesi olmayan kullanici post feed'i goremez.

## Veri Modelinden Gelen Ana Alanlar

### User

Kullanilacak alanlar:

- `displayName`
- `email`
- `photoURL`
- `department`
- `year`
- `bio`
- `interests`
- `followersCount`
- `followingCount`

Tasarimda kullanilacagi yerler:

- Profile
- EditProfile
- UserProfile
- Event organizer bilgisi
- Post sahibi bilgisi
- Listing seller bilgisi
- Chat kullanici bilgisi
- Notifications

### Event

Kullanilacak alanlar:

- `title`
- `description`
- `coverURL`
- `organizer`
- `category`
- `location`
- `startDate`
- `endDate`
- `capacity`
- `attendeeCount`
- `isOnline`
- `tags`
- `likeCount`
- `status`

Tasarimda kullanilacagi yerler:

- Discover
- EventCard
- EventDetail
- CreateEvent
- Profile event sekmeleri
- Notifications

### Community

Kullanilacak alanlar:

- `name`
- `description`
- `coverURL`
- `iconURL`
- `creatorId`
- `category`
- `memberCount`
- `isPrivate`
- `tags`
- `rules`

Tasarimda kullanilacagi yerler:

- CommunityList
- CommunityCard
- CommunityDetail
- CreateCommunity
- Post feed

### Listing

Kullanilacak alanlar:

- `title`
- `description`
- `price`
- `currency`
- `category`
- `condition`
- `imageURLs`
- `seller`
- `status`
- `viewCount`
- `savedCount`
- `tags`
- `createdAt`
- `updatedAt`

Tasarimda kullanilacagi yerler:

- MarketHome
- ListingCard
- ListingDetail
- CreateListing
- MyListings
- Profile listing sekmesi
- Chat baslatma

### Chat

Kullanilacak alanlar:

- `participants`
- `lastMessage`
- `relatedListingId`
- `updatedAt`

Message alanlari:

- `senderId`
- `text`
- `imageURL`
- `createdAt`
- `read`

Tasarimda kullanilacagi yerler:

- ChatList
- ChatDetail
- ListingDetail saticiyla iletisim akisi

## Auth Ekranlari

### 1. Login

Amac:

Kullanicinin uygulamaya email/sifre veya Google ile giris yapmasi.

Ekranda bulunmasi gerekenler:

- Email input
- Password input
- Login aksiyonu
- Google Sign-In aksiyonu
- Register ekranina gecis
- ForgotPassword ekranina gecis
- Form validation hata alanlari
- Auth loading state

Firebase karsiligi:

- Firebase Auth email/password login
- Google Sign-In
- `onAuthStateChanged`

Tasarimda bulunmamasi gerekenler:

- Telefonla giris
- Sosyal medya login secenekleri
- Veri modelinde olmayan ekstra profil secimleri

### 2. Register

Amac:

Yeni kullanici hesabi olusturmak.

Ekranda bulunmasi gerekenler:

- Display name input
- Email input
- Password input
- Confirm password input
- Register aksiyonu
- Google Sign-In aksiyonu
- Login ekranina gecis
- Form validation hata alanlari
- Email verification bilgilendirme state'i

Firebase karsiligi:

- Firebase Auth create user
- `users/{uid}` dokumani olusturma
- `user_registered` analytics event

Kayit sonrasi yonlendirme:

- ProfileCompletion ekranina gitmelidir.

### 3. ForgotPassword

Amac:

Kullanicinin sifre sifirlama maili almasi.

Ekranda bulunmasi gerekenler:

- Email input
- Send reset email aksiyonu
- Basarili mail gonderildi state'i
- Login ekranina geri donus

Firebase karsiligi:

- `sendPasswordResetEmail`

### 4. ProfileCompletion

Amac:

Kayit sonrasi kullanicinin kampus profili icin gerekli bilgileri tamamlamasi.

Ekranda bulunmasi gerekenler:

- Department secimi/input
- Year secimi/input
- Interests coklu secim
- Bio input
- Save/continue aksiyonu
- Zorunlu alan validation state'i

Firebase karsiligi:

- `users/{uid}.department`
- `users/{uid}.year`
- `users/{uid}.interests`
- `users/{uid}.bio`

Tasarim gerekcesi:

Bu bilgiler etkinlik onerileri, topluluk eslesmesi ve profil ekranlari icin kullanilir.

## Main Navigation

Ana uygulama 5 tabdan olusmalidir:

- Discover
- Topluluk
- Market
- Mesajlar
- Profil

Tab badge gerektiren yerler:

- Mesajlar: unread mesaj sayisi
- Profil veya Notifications girisi: unread notification sayisi

## Discover Modulu

### 5. Discover

Amac:

Kampus etkinliklerini kesfetmek, filtrelemek, aramak, begenmek ve kaydetmek.

Ekranda bulunmasi gereken ana bolumler:

- Search input
- Kategori filtresi
- Tarih filtresi
- One cikan etkinlikler horizontal alan
- Etkinlik listesi
- Pull-to-refresh state'i
- Infinite scroll loading state'i
- Empty state
- Skeleton loading state

Kategori filtreleri:

- Konser
- Seminer
- Spor
- Sosyal
- Akademik

Tarih filtreleri:

- Bugun
- Bu hafta
- Bu ay

EventCard icinde bulunmasi gerekenler:

- Cover image
- Title
- Category
- Start date/time
- Location veya online bilgisi
- Organizer mini bilgisi
- Attendee count / capacity
- Like count
- Save state
- Status badge gerekiyorsa active/cancelled/completed
- Detail ekranina gecis

Firebase karsiligi:

- `events`
- `events.category`
- `events.startDate`
- `events.status`
- `events.attendeeCount`
- `events.capacity`
- `events.likeCount`
- `events.tags`

Aksiyonlar:

- Event detail ac
- Like event
- Save event
- Search
- Category filter
- Date filter
- Load more
- Refresh

Cloud Functions etkisi:

- Like count client tarafindan dogrudan yazilmaz.
- Like aksiyonu callable function ile yonetilir.

Analytics:

- `event_viewed`
- `event_liked`

Tasarimda bulunmamasi gerekenler:

- Veri modelinde olmayan konum haritasi
- Bilet satin alma
- QR kod check-in

### 6. EventDetail

Amac:

Etkinlik detaylarini gostermek, katilim, yorum ve organizer profiline gecisi saglamak.

Ekranda bulunmasi gerekenler:

- Hero cover image
- Title
- Description
- Category
- Date/time
- Location veya online bilgisi
- Capacity
- Attendee count
- Like count
- Tags
- Organizer bilgi alani
- Attendees listesi veya katilimci preview
- Comments bolumu
- Join/Leave aksiyonu
- Waitlist state'i
- Save aksiyonu
- Like aksiyonu

Role bazli durumlar:

- Organizer kullanici: edit/cancel aksiyonu gormeli.
- Normal kullanici: join/leave aksiyonu gormeli.
- Kapasite doluysa: waitlist durumu gorunmeli.
- Cancelled event: join aksiyonu pasif olmali.

Firebase karsiligi:

- `events/{eventId}`
- `events/{eventId}/attendees`
- `events/{eventId}/comments`

Aksiyonlar:

- Join event
- Leave event
- Add comment
- Like event
- Save event
- Organizer profile ac
- UserProfile ac

Cloud Functions etkisi:

- Join sadece attendee dokumani olusturur.
- `attendeeCount` Cloud Function ile artar.
- Leave attendee dokumanini siler.
- `attendeeCount` Cloud Function ile azalir.

Animasyon gereksinimi:

- Hero fade-in

Analytics:

- `event_viewed`
- `event_joined`
- `event_liked`

### 7. CreateEvent

Amac:

Kullanicinin 3 adimli form ile etkinlik olusturmasi.

Ekran yapisi:

- Step indicator/progress
- Step 1: temel bilgiler
- Step 2: tarih/lokasyon/tags
- Step 3: cover upload/preview

Step 1 alanlari:

- Title
- Description
- Category
- Capacity
- Online/yuz yuze secimi

Step 2 alanlari:

- Start date/time
- End date/time
- Location
- Tags

Step 3 alanlari:

- Cover image upload
- Image preview
- Upload progress
- Create event aksiyonu

Validation:

- Title bos olamaz.
- Description bos olamaz.
- Category secilmeli.
- Capacity number olmali.
- Start date end date'den once olmali.
- Yuz yuze etkinlikte location zorunlu olmali.
- Cover image secilmeli.

Firebase karsiligi:

- Storage: `events/{eventId}/cover.jpg`
- Firestore: `events/{eventId}`

Olusturma sonrasi:

- Discover ekraninda etkinlik realtime gorunmelidir.

Animasyon gereksinimi:

- Form adim gecisi slide/spring

Analytics:

- `event_created`

## Topluluk Modulu

### 8. CommunityList

Amac:

Topluluklari kesfetmek ve kullanicinin katildigi topluluklari gormek.

Ekranda bulunmasi gerekenler:

- Search input
- "Katildigim Topluluklar" sekmesi
- "Kesfet" sekmesi
- Category filter
- Member count'a gore siralama/filter state
- Community list
- Empty state
- Loading state

CommunityCard icinde bulunmasi gerekenler:

- Icon image
- Cover veya compact visual
- Name
- Description kisa hali
- Category
- Member count
- Private badge
- Tags
- Join veya Open aksiyonu

Firebase karsiligi:

- `communities`
- `communities/{communityId}/members`

Aksiyonlar:

- Community detail ac
- Join community
- CreateCommunity modal ac
- Category filter
- Search

Cloud Functions etkisi:

- Join sonrasi `memberCount` Cloud Function ile artar.

Analytics:

- `community_joined`

### 9. CommunityDetail

Amac:

Topluluk bilgilerini, kurallari, uyelik durumunu ve post feed'i gostermek.

Ekranda bulunmasi gerekenler:

- Cover image
- Icon
- Name
- Description
- Category
- Member count
- Tags
- Rules alani
- Join/Leave veya joined state
- Post feed
- Create post alani
- Member list girisi/modal

Private community durumlari:

- Uye olmayan kullanici post feed'i gorememeli.
- Uye olmayan kullanici join aksiyonunu gormeli.
- Uye kullanici postlari gorebilmeli.

Admin/moderator durumlari:

- Uye yonetimi aksiyonlari gorunmeli.
- Moderator atama/uye cikarma icin UI state'i ayrilmali.

PostCard icinde bulunmasi gerekenler:

- User avatar
- Display name
- Created date
- Content
- Image preview varsa gosterim
- Like count
- Comment count
- Like aksiyonu
- Comment/detail aksiyonu

Firebase karsiligi:

- `communities/{communityId}`
- `communities/{communityId}/members`
- `communities/{communityId}/posts`

Aksiyonlar:

- Join community
- Leave community
- Create post
- Like post
- Open PostDetail
- Open member list

Cloud Functions etkisi:

- `memberCount` Cloud Function ile yonetilir.
- `likeCount` callable function ile yonetilir.

Analytics:

- `post_created`
- `post_liked`

### 10. PostDetail

Amac:

Bir community postunun detayini ve yorumlarini gostermek.

Ekranda bulunmasi gerekenler:

- Post sahibi bilgisi
- Post content
- ImageURLs varsa galeri/preview
- Like count
- Comment count
- Comments list
- Add comment input
- Like aksiyonu

Firebase karsiligi:

- `communities/{communityId}/posts/{postId}`
- `communities/{communityId}/posts/{postId}/comments`

Aksiyonlar:

- Add comment
- Like/unlike post
- UserProfile ac

Analytics:

- `comment_added`
- `post_liked`

### 11. CreateCommunity

Amac:

Yeni topluluk olusturmak.

Ekranda bulunmasi gerekenler:

- Name input
- Description input
- Category secimi
- Tags input/secimi
- Rules input/listesi
- Private/public secimi
- Cover image upload
- Icon image upload
- Create community aksiyonu

Firebase karsiligi:

- Storage:
  - `communities/{communityId}/cover.jpg`
  - `communities/{communityId}/icon.jpg`
- Firestore:
  - `communities/{communityId}`
  - `communities/{communityId}/members/{creatorId}`

Olusturma sonrasi:

- Creator admin olmalidir.
- CommunityList icinde realtime gorunmelidir.

## Market Modulu

### 12. MarketHome

Amac:

Ikinci el ilanlari listelemek, aramak ve filtrelemek.

Ekranda bulunmasi gerekenler:

- Search input
- Category filter
- Price range filter
- Condition filter
- Status filter
- Masonry/grid listing listesi
- Empty state
- Loading/skeleton state
- Pull-to-refresh
- CreateListing aksiyonu

Kategori filtreleri:

- Kitap
- Elektronik
- Giyim
- Mobilya
- Diger

Condition filtreleri:

- new
- like-new
- good
- fair

Status filtreleri:

- active
- sold
- reserved

ListingCard icinde bulunmasi gerekenler:

- Ana urun gorseli
- Title
- Price + currency
- Category
- Condition
- Seller mini bilgisi
- Status badge
- Saved state
- Detail ekranina gecis

Firebase karsiligi:

- `listings`
- `listings.category`
- `listings.price`
- `listings.condition`
- `listings.status`
- `listings.savedCount`

Aksiyonlar:

- Listing detail ac
- Save listing
- Category filter
- Price filter
- Condition filter
- Status filter
- Search
- CreateListing ac

Analytics:

- `listing_saved`

### 13. ListingDetail

Amac:

Ilan detaylarini gostermek ve saticiyla chat baslatmak.

Ekranda bulunmasi gerekenler:

- Image gallery, max 5 fotograf
- Title
- Description
- Price + currency
- Category
- Condition
- Status
- View count
- Saved count
- Tags
- Seller info
- Contact seller aksiyonu
- Save listing aksiyonu
- Similar listings alani

Seller view:

- Edit listing aksiyonu
- Mark as sold aksiyonu
- Delete listing aksiyonu gerekiyorsa sadece seller'a gorunmeli

Buyer view:

- Contact seller aksiyonu
- Save listing aksiyonu

Status durumlari:

- Active: contact seller aktif.
- Sold: sold badge gorunur, contact seller pasif olabilir.
- Reserved: reserved badge gorunur.

Firebase karsiligi:

- `listings/{listingId}`
- `chats`
- `chats/{chatId}/messages`

Aksiyonlar:

- Contact seller
- Save listing
- Mark as sold
- Edit listing
- Open seller profile
- Open similar listing

Cloud Functions etkisi:

- `viewCount` callable function ile artar.
- Contact seller mevcut chat'i acar veya yeni chat olusturur.
- Chat dokumaninda `relatedListingId` bulunur.

Analytics:

- `listing_viewed`
- `listing_saved`
- `listing_sold`

### 14. CreateListing

Amac:

Yeni market ilani olusturmak veya mevcut ilani duzenlemek.

Ekranda bulunmasi gerekenler:

- Title input
- Description input
- Price input
- Category secimi
- Condition secimi
- Tags input/secimi
- Multi-image picker, max 5
- Image preview listesi
- Image reorder state'i
- Upload progress
- Create/update listing aksiyonu

Validation:

- Title bos olamaz.
- Description bos olamaz.
- Price number ve 0'dan buyuk olmali.
- Category secilmeli.
- Condition secilmeli.
- En az 1 fotograf olmali.
- En fazla 5 fotograf olmali.

Firebase karsiligi:

- Storage: `listings/{listingId}/{index}.jpg`
- Firestore: `listings/{listingId}`

Animasyon gereksinimi:

- Form adim gecisi varsa slide/spring

Analytics:

- `listing_created`

### 15. MyListings

Amac:

Kullanicinin kendi ilanlarini yonetmesi.

Ekranda bulunmasi gerekenler:

- User listings listesi
- Status filter: active/sold/reserved
- ListingCard veya compact row
- Edit aksiyonu
- Mark as sold aksiyonu
- Delete veya archive aksiyonu
- Empty state

Firebase karsiligi:

- `listings`
- `sellerId == currentUserId`

Tasarim notu:

- Bu ekranda seller aksiyonlari gorunur.
- MarketHome genel alici deneyiminden ayrilmalidir.

## Mesajlar Modulu

### 16. ChatList

Amac:

Kullanicinin aktif sohbetlerini listelemek.

Ekranda bulunmasi gerekenler:

- Chat list
- Last message preview
- Other participant bilgisi
- Related listing bilgisi varsa mini referans
- Updated time
- Unread badge
- Empty state
- Loading state

ChatItem icinde bulunmasi gerekenler:

- Avatar
- Display name
- Last message text
- Last message time
- Unread badge
- Related listing title veya mini image varsa gosterim

Firebase karsiligi:

- `chats`
- `participants`
- `lastMessage`
- `relatedListingId`
- `updatedAt`

Aksiyonlar:

- ChatDetail ac

Cloud Functions etkisi:

- `lastMessage` Cloud Function tarafindan guncellenir.

### 17. ChatDetail

Amac:

Iki kullanici arasinda realtime mesajlasma saglamak.

Ekranda bulunmasi gerekenler:

- Header'da diger kullanici bilgisi
- Related listing varsa listing referans alani
- Message list
- Incoming message bubble
- Outgoing message bubble
- Message input
- Send message aksiyonu
- Optional image send aksiyonu
- Read/sent state
- Empty conversation state

Firebase karsiligi:

- `chats/{chatId}`
- `chats/{chatId}/messages`

Aksiyonlar:

- Send text message
- Send image message opsiyonel
- Mark as read
- Open related listing
- Open participant profile

Cloud Functions etkisi:

- Mesaj olusturulunca `onMessageSent` lastMessage gunceller.
- Aliciya FCM gider.

Analytics:

- `message_sent`

Animasyon onerisi:

- Yeni mesaj bubble slide-in

## Profil Modulu

### 18. Profile

Amac:

Giris yapan kullanicinin profilini, etkinliklerini, ilanlarini ve sosyal bilgilerini gostermek.

Ekranda bulunmasi gerekenler:

- Avatar
- Display name
- Department
- Year
- Bio
- Interests
- Followers count
- Following count
- Edit profile aksiyonu
- Settings aksiyonu
- Notifications girisi veya badge
- Tabs/sections:
  - Olusturulan etkinlikler
  - Katildigi etkinlikler
  - Ilanlari
  - Kaydedilenler gerekiyorsa saved events/listings

Firebase karsiligi:

- `users/{uid}`
- `events.organizerId`
- `events/{eventId}/attendees/{uid}`
- `listings.sellerId`
- `users/{uid}/savedEvents`
- `users/{uid}/savedListings`

Aksiyonlar:

- EditProfile ac
- Settings ac
- Notifications ac
- EventDetail ac
- ListingDetail ac

### 19. EditProfile

Amac:

Kullanicinin profil bilgilerini guncellemesi.

Ekranda bulunmasi gerekenler:

- Avatar upload
- Display name input
- Department input/secimi
- Year input/secimi
- Bio input
- Interests coklu secim
- Save aksiyonu
- Upload progress

Firebase karsiligi:

- Storage: `users/{uid}/avatar.jpg`
- Firestore: `users/{uid}`

Security etkisi:

- Kullanici sadece kendi profilini guncelleyebilir.

### 20. UserProfile

Amac:

Baska bir kullanicinin profilini gostermek.

Ekranda bulunmasi gerekenler:

- Avatar
- Display name
- Department
- Year
- Bio
- Interests
- Followers count
- Following count
- Follow/unfollow aksiyonu
- Kullaniciya ait public etkinlikler
- Kullaniciya ait active ilanlar

Firebase karsiligi:

- `users/{targetUserId}`
- `users/{currentUid}/follows/{targetUserId}`
- `events.organizerId`
- `listings.sellerId`

Cloud Functions etkisi:

- Follow/unfollow sayaclari Cloud Functions ile guncellenir.

Analytics:

- `user_followed`

### 21. Settings

Amac:

Tema, bildirim tercihleri, cikis ve hesap islemlerini yonetmek.

Ekranda bulunmasi gerekenler:

- Theme toggle: light/dark
- Event notification preference
- Message notification preference
- Community notification preference
- FCM notifications on/off
- Logout aksiyonu
- Delete account aksiyonu

Firebase karsiligi:

- `users/{uid}` notification preference alanlari eklenebilir
- `users/{uid}.fcmToken`
- Firebase Auth signOut
- Account cleanup Cloud Function

Tasarim etkisi:

- Delete account icin confirmation state gerekir.
- Logout sonrasi Login ekranina navigation reset gerekir.

### 22. Notifications

Amac:

Kullanicinin sistem bildirimlerini gormesi.

Ekranda bulunmasi gerekenler:

- Notification list
- Read/unread visual state
- Notification type bilgisi
- Notification text
- CreatedAt
- Related content acma aksiyonu
- Mark as read aksiyonu
- Empty state

Notification tipleri:

- event_joined
- event_reminder
- post_liked
- message_received
- user_followed
- community_joined

Firebase karsiligi:

- `users/{uid}/notifications`

Analytics:

- `notification_opened`

## Figma'da Mutlaka Hazirlanacak Frame Listesi

Minimum ana frame'ler:

- Login
- Register
- ForgotPassword
- ProfileCompletion
- Discover
- Discover Loading
- Discover Empty
- EventDetail
- CreateEvent Step 1
- CreateEvent Step 2
- CreateEvent Step 3
- CommunityList
- CommunityDetail Member View
- CommunityDetail Non-Member Private View
- PostDetail
- CreateCommunity
- MarketHome
- MarketHome Filtered Empty
- ListingDetail Buyer View
- ListingDetail Seller View
- CreateListing
- MyListings
- ChatList
- ChatList Empty
- ChatDetail
- Profile
- EditProfile
- UserProfile
- Settings
- Notifications
- Notifications Empty

Dark mode icin en az su ekranlarin varyanti hazirlanmali:

- Discover
- EventDetail
- CommunityDetail
- MarketHome
- ListingDetail
- ChatDetail
- Profile
- Settings

## Zorunlu Animasyonlarin Tasarim Karsiligi

Figma'da animasyonun kodu degil, hangi ekranda hangi akis oldugu gosterilmelidir.

### Skeleton shimmer

Ekranlar:

- Discover
- MarketHome

Gosterilecek state:

- Kartlar henuz yuklenmeden skeleton card dizilimi

### Hero fade-in

Ekranlar:

- EventDetail
- ListingDetail

Gosterilecek state:

- Hero image alaninin acilis animasyonu icin baslangic/final frame

### Form step transition

Ekranlar:

- CreateEvent
- CreateListing

Gosterilecek state:

- Step 1, Step 2, Step 3 frame'leri
- Progress indicator

### Tab badge pulse

Ekranlar:

- Main tab navigation
- ChatList
- Notifications

Gosterilecek state:

- Yeni mesaj veya bildirim geldiginde badge aktif hali

## Analytics Event Karsiliklari

Tasarimda aksiyon olarak bulunmasi gereken analytics olaylari:

Etkinlik:

- `event_created`
- `event_joined`
- `event_viewed`
- `event_liked`

Topluluk:

- `community_joined`
- `post_created`
- `post_liked`
- `comment_added`

Market:

- `listing_created`
- `listing_viewed`
- `listing_saved`
- `listing_sold`

Sosyal ve Auth:

- `user_registered`
- `user_followed`
- `message_sent`
- `notification_opened`

## Tasarimda Filtrelerin Veri Karsiligi

### Discover

Filtreler:

- Category -> `events.category`
- Date range -> `events.startDate`
- Search -> `events.title` veya `titleLowercase`

Siralamalar:

- Ana akis -> `startDate asc`
- One cikanlar -> `likeCount desc`

### Community

Filtreler:

- Category -> `communities.category`
- Joined communities -> `communities/{communityId}/members/{uid}`
- Private/public state -> `communities.isPrivate`

Siralamalar:

- Populer -> `memberCount desc`
- Yeni -> `createdAt desc`

### Market

Filtreler:

- Category -> `listings.category`
- Price range -> `listings.price`
- Condition -> `listings.condition`
- Status -> `listings.status`
- Search -> `listings.title` veya `titleLowercase`

Siralamalar:

- Yeni ilanlar -> `createdAt desc`
- Fiyat -> `price asc/desc`

### Chat

Filtre yok.

Siralamalar:

- ChatList -> `updatedAt desc`
- Messages -> `createdAt asc`

## Tasarimda Eklenmemesi Gereken Islevler

Asagidaki islevler mevcut dokuman ve veri modelinde gerekli degildir; Figma'ya eklenmemelidir:

- Realtime Database'e ozel ekran veya ayar
- Harita uzerinden etkinlik arama
- Bilet satin alma
- Odeme sistemi
- QR check-in
- Grup chat
- Sesli/goruntulu arama
- Admin paneli
- Tam metin arama servisi
- Story/reels benzeri sosyal medya akislar
- Veri modelinde olmayan rozet/puan sistemi

## Kodlamaya Gecerken Kontrol Listesi

Figma bittiginde her ekran icin su sorularin cevabi evet olmalidir:

- Bu ekrandaki her veri Firestore alanindan geliyor mu?
- Bu ekrandaki her filtre Firestore query ile yapilabilir mi?
- Bu ekrandaki her sayac Cloud Functions planina uygun mu?
- Bu ekrandaki her aksiyon Context fonksiyonu olarak karsilanabilir mi?
- Loading, empty ve error state tasarlandi mi?
- Dark mode varyanti kritik ekranlarda var mi?
- Seller/buyer, organizer/normal user, member/non-member farklari tasarlandi mi?
- Bildirim ve mesaj badge state'leri tasarlandi mi?

Bu kontrol gecilmeden React Native kodlamaya baslanmamalidir.
