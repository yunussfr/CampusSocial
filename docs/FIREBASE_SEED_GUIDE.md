# Firebase Seed Guide

Bu dokuman, CampusConnect icin Firestore'a ilk demo verilerini kontrollu sekilde basma planidir. Gercek yazma islemine gecmeden once `.env` ve Firebase SDK kurulumu tamamlanmalidir.

## Neden simdi yazmiyoruz?

- Projede Firebase SDK henuz `package.json` icinde yok.
- `src/services/firebase.js` su an placeholder durumunda.
- `docs/SECURITY_RULES_DRAFT.md` dosyasi seed verisinin sahiplik ve permission alanlarini belirlemek icin referans alinmalidir.
- Gercek Firebase config degerleri `.env` icinde senin tarafindan doldurulmali ve Git'e eklenmemeli.

## Seed verisi icin ana koleksiyonlar

Koleksiyon adlari `src/constants/collections.js` ile ayni kalmalidir:

- `users`
- `events`
- `communities`
- `listings`
- `chats`

Alt koleksiyonlar:

- `events/{eventId}/attendees`
- `communities/{communityId}/members`
- `communities/{communityId}/posts`
- `communities/{communityId}/posts/{postId}/comments`
- `chats/{chatId}/messages`
- `users/{uid}/notifications`
- `users/{uid}/savedEvents`
- `users/{uid}/savedListings`
- `users/{uid}/follows`

## Ilk demo veri seti

Baslangic icin kucuk ama ekranlari test ettiren veri yeterlidir:

- 3 kullanici: ogrenci, etkinlik organizatoru, market saticisi
- 4 etkinlik: farkli kategori, tarih, kapasite ve `status`
- 3 topluluk: herkese acik ve private ornek
- 5 market ilani: farkli kategori, fiyat, durum ve seller
- 2 chat: biri normal mesajlasma, biri `relatedListingId` ile market ilani baglantili
- Her ana modul icin en az bir notification ornegi

## Yazma stratejisi

Gercek Firebase'e demo veri basmak icin iki guvenli yol var:

1. Admin seed script
   - Node script Firebase Admin SDK ile calisir.
   - Service account JSON gerekir.
   - Security rules'i bypass eder, bu yuzden yalnizca development/demo projesinde kullanilmalidir.
   - Toplu veri basmak icin en pratik yoldur.

2. Uygulama icinden client seed
   - Normal Firebase client SDK ile calisir.
   - Security rules ile birebir test eder.
   - Auth kullanicisi ve izinler hazir olmadan daha zahmetlidir.

Bu proje icin onerilen yol: Once Admin seed script ile demo veriyi basmak, sonra uygulama ekranlarini normal client SDK ile okumak/yazmak.

## Devam etmeden once gereken bilgiler

Senden gerekenler:

- Firebase Console'dan web app config degerleri
- Auth, Firestore, Storage, Functions, Cloud Messaging ve Analytics servislerinin aktif oldugu proje
- Demo veriyi gercek proje mi yoksa development/test Firebase projesine mi basacagimiz
- Admin seed icin Firebase Console'dan indirilen service account JSON dosyasinin yerel yolu

## Sonraki teknik adim

Sen `.env` dosyasini doldurup devam et dediginde:

1. Firebase paket secimini yapariz.
2. `src/services/firebase.js` init dosyasini gercek config ile baglariz.
3. Service account JSON dosyasini `secrets/firebase-service-account.local.json` olarak kaydedersin.
4. Once dry-run/validate modu, sonra gercek yazma modu calistirilir.

## Komutlar

Dry-run:

```sh
npm run seed:firestore
```

Gercek yazma:

```sh
npm run seed:firestore -- --write
```

Root koleksiyonlari once temizleyip tekrar yazma:

```sh
npm run seed:firestore -- --write --clear
```
