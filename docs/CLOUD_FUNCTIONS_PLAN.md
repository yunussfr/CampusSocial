# CampusConnect Cloud Functions Plan

Bu dokuman Cloud Functions tarafinda yazilacak backend islemlerinin sozlesmesini tanimlar. Figma ve frontend tasarimi bu davranislara gore yapilmalidir.

## Genel Yaklasim

Client uygulama kullanici aksiyonunu baslatir, ancak kritik sayaclar ve bildirimler Cloud Functions tarafindan guncellenir.

Client'in dogrudan yazmamasi gereken alanlar:

- `attendeeCount`
- `memberCount`
- `likeCount`
- `commentCount`
- `viewCount`
- `savedCount`
- `followersCount`
- `followingCount`
- `lastMessage`

## 1. onEventJoin

Trigger:

```txt
events/{eventId}/attendees/{userId} onCreate
```

Ne yapar:

- `events/{eventId}.attendeeCount` degerini transaction ile +1 yapar.
- Event kapasitesi doluysa status mantigina gore `waitlist` kullanilmasini destekler.
- Organizer icin notification olusturur.
- Organizer'in `fcmToken` alani varsa FCM bildirimi gonderir.

UI etkisi:

- EventDetail'da Join butonu loading state alir.
- Discover ve EventDetail'daki attendee count realtime guncellenir.
- Organizer Notifications ekraninda yeni bildirim gorur.

Analytics:

- `event_joined`

## 2. onEventLeave

Trigger:

```txt
events/{eventId}/attendees/{userId} onDelete
```

Ne yapar:

- `events/{eventId}.attendeeCount` degerini transaction ile -1 yapar.
- Degerin 0 altina dusmesini engeller.

UI etkisi:

- Leave sonrasi EventDetail ve Discover count guncellenir.

## 3. onCommunityJoin

Trigger:

```txt
communities/{communityId}/members/{userId} onCreate
```

Ne yapar:

- `communities/{communityId}.memberCount` degerini +1 yapar.
- Community creator/admin icin notification olusturabilir.

UI etkisi:

- CommunityList ve CommunityDetail member count realtime guncellenir.
- Private community icin uye olduktan sonra post feed gorunur.

Analytics:

- `community_joined`

## 4. onCommunityLeave

Trigger:

```txt
communities/{communityId}/members/{userId} onDelete
```

Ne yapar:

- `communities/{communityId}.memberCount` degerini -1 yapar.
- Degerin 0 altina dusmesini engeller.

UI etkisi:

- Community card ve detail count guncellenir.

Not:

- Dokumanda zorunlu listede acikca yok, fakat `onCommunityJoin` varsa veri tutarliligi icin leave fonksiyonu da planlanmalidir.

## 5. onPostLike

Tip:

```txt
HTTPS Callable Function
```

Input:

```js
{
  communityId: string,
  postId: string,
  action: "like" | "unlike"
}
```

Ne yapar:

- Kullanicinin community uyesi olup olmadigini kontrol eder.
- Like durumunu transaction ile yazar veya siler.
- `posts/{postId}.likeCount` degerini +1/-1 yapar.
- Post sahibine notification olusturur.
- Post sahibine FCM gonderebilir.

UI etkisi:

- PostCard kalp animasyonu.
- Like count realtime guncelleme.
- Notifications ekraninda post liked bildirimi.

Analytics:

- `post_liked`

## 6. onEventLike

Tip:

```txt
HTTPS Callable Function
```

Input:

```js
{
  eventId: string,
  action: "like" | "unlike"
}
```

Ne yapar:

- Event like durumunu kullanici bazli saklar.
- `events/{eventId}.likeCount` degerini transaction ile gunceller.
- Organizer'a notification olusturabilir.

UI etkisi:

- Discover ve EventDetail like count guncellenir.
- Like button animasyonu.

Analytics:

- `event_liked`

Not:

- Dokumanda Discover bolumunde event begenisi isteniyor, Cloud Functions tablosunda genel `onPostLike` adi geciyor. Tasarim ve kod kalitesi icin event like ve post like fonksiyonlarini ayirmak daha temizdir.

## 7. onMessageSent

Trigger:

```txt
chats/{chatId}/messages/{messageId} onCreate
```

Ne yapar:

- `chats/{chatId}.lastMessage` alanini gunceller.
- `chats/{chatId}.updatedAt` alanini gunceller.
- Alici kullaniciyi bulur.
- Alicinin `fcmToken` alani varsa FCM bildirimi gonderir.
- Alici icin notification olusturabilir.

UI etkisi:

- ChatList son mesaj preview guncellenir.
- Chat tab unread badge tetiklenir.
- ChatDetail mesajlari realtime gorur.

Analytics:

- `message_sent`

## 8. onListingView

Tip:

```txt
HTTPS Callable Function
```

Input:

```js
{
  listingId: string
}
```

Ne yapar:

- Kullanici seller degilse `listings/{listingId}.viewCount` degerini +1 yapar.
- Ayni kullanicinin cok kisa surede tekrar view yazmasini engellemek icin istege bagli view log tutabilir.

UI etkisi:

- ListingDetail acilinca view count artar.
- Market analytics icin veri olusur.

Analytics:

- `listing_viewed`

## 9. onListingSave

Tip:

```txt
HTTPS Callable Function veya Firestore trigger
```

Onerilen veri:

```txt
users/{uid}/savedListings/{listingId}
```

Ne yapar:

- Save/unsave durumunu yonetir.
- `listings/{listingId}.savedCount` degerini +1/-1 yapar.

UI etkisi:

- Market card save icon state.
- Profile veya Market saved listings sekmesi.

Analytics:

- `listing_saved`

Not:

- Dokumanda savedListings Context icinde geciyor, sayac guvenligi icin bu fonksiyon planlanmalidir.

## 10. sendEventReminder

Trigger:

```txt
Scheduled Function / Cron
```

Ne yapar:

- Baslangicina 1 saat kalan active eventleri bulur.
- `attendees` alt koleksiyonundaki confirmed katilimcilari listeler.
- Her kullanicinin `fcmToken` alanina bildirim gonderir.
- Tekrar gonderimi engellemek icin event veya reminder log kullanir.

UI etkisi:

- Notifications ekraninda reminder bildirimi.
- Settings icinde event notification toggle.

Analytics:

- `notification_opened` client tarafinda loglanir.

## 11. onUserFollow

Trigger:

```txt
users/{userId}/follows/{targetId} onCreate
```

Ne yapar:

- `users/{userId}.followingCount` degerini +1 yapar.
- `users/{targetId}.followersCount` degerini +1 yapar.
- Target kullaniciya notification olusturur.
- Target kullaniciya FCM gonderebilir.

UI etkisi:

- Profile ve UserProfile takipci/takip sayilari guncellenir.
- Follow button state degisir.

Analytics:

- `user_followed`

## 12. onUserUnfollow

Trigger:

```txt
users/{userId}/follows/{targetId} onDelete
```

Ne yapar:

- `followingCount` ve `followersCount` degerlerini -1 yapar.
- Degerlerin 0 altina dusmesini engeller.

UI etkisi:

- Profile count realtime guncellenir.

Not:

- Dokumanda sadece follow trigger zorunlu geciyor, fakat unfollow olmadan sayaclar dogru kalmaz.

## 13. onAccountDeleteCleanup

Tip:

```txt
HTTPS Callable Function
```

Ne yapar:

- Kullanici hesap silme istegi verdiginde ilgili Firestore verilerini temizler veya anonimlestirir.
- Auth `deleteUser` akisiyle beraber kullanilir.

UI etkisi:

- Settings > Delete Account confirmation flow.

Not:

- Dokumanda hesap silmede verinin Cloud Function ile temizlenecegi belirtiliyor.

## FCM Kullanilacak Bildirim Tipleri

```txt
event_joined
event_reminder
post_liked
message_received
user_followed
community_joined
```

Notification dokuman yapisi:

```js
{
  type: string,
  text: string,
  read: boolean,
  createdAt: Timestamp,
  relatedId: string
}
```

## Frontend Service Etkisi

Cloud Functions kullanilacak client fonksiyonlari:

- `joinEvent()` sadece attendee dokumani olusturur.
- `leaveEvent()` sadece attendee dokumanini siler.
- `likeEvent()` callable function cagirir.
- `likePost()` callable function cagirir.
- `openChat()` chat dokumani olusturur veya mevcut chat'i acar.
- `sendMessage()` sadece message dokumani olusturur.
- `trackListingView()` callable function cagirir.
- `followUser()` follow dokumani olusturur.

## Figma Icin Gerekli State'ler

- Join loading
- Join success
- Capacity full / waitlist
- Like selected/unselected
- Notification unread/read
- Message sending
- Message failed
- Listing seller view
- Listing buyer view
- Private community locked
- Community member view
- Community non-member view
