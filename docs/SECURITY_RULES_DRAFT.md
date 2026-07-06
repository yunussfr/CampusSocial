# CampusConnect Security Rules Draft

Bu dokuman Firestore ve Storage security rules icin tasarim oncesi karar taslagidir. Kod yazim asamasinda `firestore.rules` ve `storage.rules` dosyalarina uygulanacaktir.

## Genel Prensipler

- Giris yapmamis kullanici sadece public okuma yapabilir.
- Kullanici sadece kendi profil dokumanini guncelleyebilir.
- Counter alanlari client tarafindan dogrudan yazilamaz.
- Event guncelleme sadece organizer tarafindan yapilabilir.
- Listing guncelleme ve silme sadece seller tarafindan yapilabilir.
- Chat verisini sadece `participants` icindeki kullanicilar okuyabilir/yazabilir.
- Private community icerigi sadece community uyesi tarafindan okunabilir.
- Storage upload sadece ilgili sahibi veya yetkili kullanici tarafindan yapilabilir.

## Counter Alanlari

Asagidaki alanlar client tarafindan dogrudan degistirilmemelidir:

- `events.attendeeCount`
- `events.likeCount`
- `communities.memberCount`
- `communities.posts.likeCount`
- `communities.posts.commentCount`
- `listings.viewCount`
- `listings.savedCount`
- `users.followersCount`
- `users.followingCount`

Bu alanlar Cloud Functions tarafindan transaction veya atomic increment ile guncellenmelidir.

## users

Path:

```txt
users/{userId}
```

Okuma:

- Giris yapmis kullanicilar public profil alanlarini okuyabilir.

Olusturma:

- Sadece kullanicinin kendisi `request.auth.uid == userId` ise olusturabilir.

Guncelleme:

- Sadece kullanicinin kendisi guncelleyebilir.
- `followersCount` ve `followingCount` client tarafindan degistirilemez.
- `email`, `uid`, `createdAt` gibi kimlik alanlari client tarafindan keyfi degistirilmemelidir.

Silme:

- Normal client silmesi kapali tutulmali.
- Hesap silme Cloud Function ile yapilmali.

Tasarim etkisi:

- EditProfile sadece kendi profilinde gorunur.
- Follow butonu baska kullanici profilinde gorunur.

## users/{userId}/follows

Path:

```txt
users/{userId}/follows/{targetId}
```

Okuma:

- Giris yapmis kullanicilar takip bilgisini okuyabilir.

Olusturma/silme:

- Sadece `request.auth.uid == userId` ise yapilabilir.
- `targetId` bos veya kendisi olmamalidir.

Backend etkisi:

- `onUserFollow` followers/following sayaclarini gunceller.

## users/{userId}/notifications

Path:

```txt
users/{userId}/notifications/{notifId}
```

Okuma:

- Sadece ilgili kullanici okuyabilir.

Olusturma:

- Client dogrudan notification olusturmamalidir.
- Notification olusturma Cloud Functions tarafindan yapilmalidir.

Guncelleme:

- Kullanici sadece `read` alanini guncelleyebilir.

Tasarim etkisi:

- Notifications ekrani sadece giris yapan kullanicinin bildirimlerini gosterir.

## events

Path:

```txt
events/{eventId}
```

Okuma:

- `status == active` olan etkinlikler giris yapmis kullanicilar tarafindan okunabilir.
- Gerekirse public okuma da acilabilir, ancak odev icin authenticated okuma daha kontrolludur.

Olusturma:

- Giris yapmis kullanicilar etkinlik olusturabilir.
- `organizerId == request.auth.uid` olmak zorundadir.
- Ilk olusturmada `attendeeCount == 0`, `likeCount == 0`, `status == active` olmali.

Guncelleme:

- Sadece organizer guncelleyebilir.
- Organizer bile `attendeeCount` ve `likeCount` alanlarini degistiremez.

Silme:

- Tercihen fiziksel silme yerine `status: cancelled` kullanilmali.
- Silme gerekiyorsa sadece organizer yapabilir.

Tasarim etkisi:

- Edit/Cancel butonlari sadece organizer'a gorunur.
- Join butonu organizer olmayan kullanicilara gorunebilir.

## events/{eventId}/attendees

Path:

```txt
events/{eventId}/attendees/{userId}
```

Okuma:

- Giris yapmis kullanicilar katilimci listesini okuyabilir.

Olusturma:

- Sadece `request.auth.uid == userId` ise olusturabilir.
- Alanlar sadece `joinedAt` ve `status` olmali.
- `status` sadece `confirmed` veya `waitlist` olabilir.

Silme:

- Sadece ilgili kullanici kendi katilimini silebilir.

Backend etkisi:

- `onEventJoin` attendeeCount +1 yapar.
- `onEventLeave` attendeeCount -1 yapar.

## events/{eventId}/comments

Path:

```txt
events/{eventId}/comments/{commentId}
```

Okuma:

- Giris yapmis kullanicilar okuyabilir.

Olusturma:

- Giris yapmis kullanicilar yorum yapabilir.
- `userId == request.auth.uid` olmali.

Guncelleme/silme:

- Sadece yorum sahibi yapabilir.

## communities

Path:

```txt
communities/{communityId}
```

Okuma:

- Public community dokumanlari giris yapmis kullanicilar tarafindan okunabilir.
- Private community icin temel kart bilgisi okunabilir, post icerigi sadece uye tarafindan okunur.

Olusturma:

- Giris yapmis kullanicilar community olusturabilir.
- `creatorId == request.auth.uid` olmali.
- Ilk `memberCount` degeri 1 olmali veya Cloud Function ile ayarlanmalidir.

Guncelleme:

- Creator veya admin/moderator yetkili olmali.
- `memberCount` client tarafindan degistirilemez.

Tasarim etkisi:

- Private badge gerekir.
- Admin aksiyonlari sadece yetkiliye gorunur.

## communities/{communityId}/members

Path:

```txt
communities/{communityId}/members/{userId}
```

Okuma:

- Community uyeleri okuyabilir.

Olusturma:

- Kullanici kendi uyeligini olusturabilir.
- Role normal kullanici icin `member` olmali.
- `admin` veya `moderator` client tarafindan keyfi atanamaz.

Silme:

- Kullanici kendi uyeliginden ayrilabilir.
- Admin/moderator uye cikarabilir.

Backend etkisi:

- `onCommunityJoin` memberCount +1 yapar.

## communities/{communityId}/posts

Path:

```txt
communities/{communityId}/posts/{postId}
```

Okuma:

- Public community postlari giris yapmis kullanicilar tarafindan okunabilir.
- Private community postlari sadece uyeler tarafindan okunabilir.

Olusturma:

- Sadece community uyeleri post olusturabilir.
- `userId == request.auth.uid` olmali.

Guncelleme/silme:

- Post sahibi veya admin/moderator yapabilir.
- `likeCount` ve `commentCount` client tarafindan degistirilemez.

## listings

Path:

```txt
listings/{listingId}
```

Okuma:

- Giris yapmis kullanicilar ilanlari okuyabilir.

Olusturma:

- Giris yapmis kullanicilar ilan olusturabilir.
- `sellerId == request.auth.uid` olmali.
- Ilk `viewCount == 0`, `savedCount == 0`, `status == active` olmali.
- `imageURLs` en fazla 5 elemanli olmali.

Guncelleme:

- Sadece seller yapabilir.
- `viewCount` ve `savedCount` client tarafindan degistirilemez.

Silme:

- Sadece seller yapabilir.
- Tercihen silmek yerine `status: sold` veya `reserved` kullanilabilir.

Tasarim etkisi:

- Seller kendi ilaninda Edit, Delete, Mark as Sold butonlarini gorur.
- Buyer sadece Contact Seller ve Save aksiyonlarini gorur.

## chats

Path:

```txt
chats/{chatId}
```

Okuma:

- Sadece `participants` array'i icinde olan kullanicilar okuyabilir.

Olusturma:

- Giris yapmis kullanici chat olusturabilir.
- `participants` iki kisiden olusmali.
- `request.auth.uid` participants icinde olmali.
- `relatedListingId` opsiyoneldir ama market kaynakli sohbetlerde yazilmalidir.

Guncelleme:

- Participants icindeki kullanicilar yazabilir.
- `lastMessage` normalde Cloud Function tarafindan guncellenmelidir.

Silme:

- Client tarafindan kapali tutulmasi daha guvenlidir.

## chats/{chatId}/messages

Path:

```txt
chats/{chatId}/messages/{messageId}
```

Okuma:

- Sadece chat participants okuyabilir.

Olusturma:

- Sadece chat participants mesaj gonderebilir.
- `senderId == request.auth.uid` olmali.

Guncelleme:

- Alici sadece `read` alanini guncelleyebilir.

Backend etkisi:

- `onMessageSent` chat `lastMessage` ve `updatedAt` alanlarini gunceller.
- Aliciya FCM bildirimi gonderir.

## Storage Rules Taslagi

### User Avatar

Path:

```txt
users/{userId}/avatar.jpg
```

Kural:

- Sadece ilgili kullanici upload/update yapabilir.
- Giris yapmis kullanicilar okuyabilir.

### Event Cover

Path:

```txt
events/{eventId}/cover.jpg
```

Kural:

- Sadece event organizer upload/update yapabilir.
- Giris yapmis kullanicilar okuyabilir.

### Community Media

Path:

```txt
communities/{communityId}/cover.jpg
communities/{communityId}/icon.jpg
communities/{communityId}/posts/{postId}/{imageIndex}.jpg
```

Kural:

- Cover/icon sadece creator veya admin/moderator tarafindan yazilabilir.
- Post image sadece post sahibi tarafindan yuklenebilir.

### Listing Images

Path:

```txt
listings/{listingId}/{imageIndex}.jpg
```

Kural:

- Sadece listing seller upload/update yapabilir.
- En fazla 5 gorsel kullanilmalidir.

### Chat Images

Path:

```txt
chats/{chatId}/messages/{messageId}.jpg
```

Kural:

- Sadece chat participants upload/read yapabilir.

## Figma Icin Permission Bazli UI Notlari

- Organizer event detayda Edit/Cancel gorur; normal kullanici Join/Leave gorur.
- Seller listing detayda Edit/Mark as Sold gorur; buyer Contact Seller gorur.
- Private community kartinda lock/private badge olmali.
- Admin/moderator icin member management aksiyonlari ayrilmali.
- Notifications ekraninda read/unread ayrimi tasarlanmali.
- Chat listesinde unread badge ve lastMessage alani olmali.
