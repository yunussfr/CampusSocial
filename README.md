# CampusConnect

CampusConnect, kampüs içi sosyal etkileşimleri tek mobil uygulamada toplayan React Native tabanlı bir projedir. Uygulama; etkinlik oluşturma ve katılma, topluluk yönetimi, ikinci el market ilanları, gerçek zamanlı mesajlaşma, bildirimler, profil ve takip akışlarını Firebase altyapısı ile çalıştırır.

Proje teslim ve demo odaklı hazırlanmıştır: kullanıcı akışları Firebase Console üzerinden izlenebilir, realtime davranışlar iki kullanıcıyla gösterilebilir ve temel kalite kontrolleri terminalden çalıştırılabilir.

## Özellikler

- Firebase Auth ile kayıt, giriş, profil tamamlama ve oturum yönetimi
- Firestore realtime listener'ları ile etkinlik, topluluk, market, chat ve bildirim akışları
- Etkinlik oluşturma, etkinliğe katılma ve Hub üzerinden takip
- Topluluk oluşturma, özel topluluk katılım isteği, gönderi ve yorum akışı
- Market ilanı oluşturma, fotoğraf yükleme, kaydetme ve satıcıyla mesajlaşma
- Chat listesi, mesaj detayı, okunmamış mesaj sayacı ve kullanıcı bildirimleri
- Profil düzenleme, takipçi/takip edilen ekranı, tema ve bildirim ayarları
- Firebase Analytics eventleri, liste performans optimizasyonları ve hafif animasyonlar

## Teknoloji Yığını

- React Native 0.86
- React 19
- React Navigation
- Firebase Auth
- Cloud Firestore
- Firebase Storage
- Firebase Cloud Functions
- Firebase Cloud Messaging
- Firebase Analytics
- Jest ve React Test Renderer

## Kurulum

Gereksinimler:

- Node.js `>= 22.11.0`
- npm
- Android Studio veya Xcode geliştirme ortamı
- Firebase CLI
- Aktif bir Firebase projesi

Bağımlılıkları kur:

```sh
npm install
```

Metro server'ı başlat:

```sh
npm start
```

Android'de çalıştır:

```sh
npm run android
```

iOS için CocoaPods kurulumu yaptıktan sonra çalıştır:

```sh
cd ios
bundle install
bundle exec pod install
cd ..
npm run ios
```

## Firebase Kurulumu

Firebase Console'da şu servislerin aktif olması gerekir:

- Authentication
- Cloud Firestore
- Storage
- Cloud Functions
- Cloud Messaging
- Analytics

Kurulum notları:

- Firebase native config dosyaları projeye yerel olarak eklenmelidir.
- Android için `google-services.json`, iOS için `GoogleService-Info.plist` kullanılır.
- Bu config dosyaları Git'e eklenmemelidir.
- Firestore ve Storage security rules deploy edilmelidir.
- Cloud Functions deploy edilmeden sayaç, mesaj bildirimi ve bazı server-side işlemler tamamlanmış sayılmaz.

Firestore rules deploy:

```sh
firebase deploy --only firestore:rules
```

Functions deploy:

```sh
firebase deploy --only functions
```

Storage rules kullanılıyorsa:

```sh
firebase deploy --only storage
```

## Firestore Şeması

Ana koleksiyonlar:

- `users`: Kullanıcı profili, sayaçlar, FCM token, profil bilgileri
- `events`: Etkinlik bilgileri, konum, tarih, kapasite ve organizatör bilgisi
- `communities`: Topluluk bilgileri, gizlilik durumu, medya ve üyelik verileri
- `listings`: Market ilanları, ürün bilgileri, fiyat, fotoğraflar ve satıcı snapshot'ı
- `chats`: İki kullanıcı arasındaki konuşmalar, son mesaj ve okunmamış sayaçlar

Alt koleksiyonlar:

- `events/{eventId}/attendees`
- `events/{eventId}/comments`
- `communities/{communityId}/members`
- `communities/{communityId}/joinRequests`
- `communities/{communityId}/posts`
- `communities/{communityId}/posts/{postId}/comments`
- `chats/{chatId}/messages`
- `users/{userId}/notifications`
- `users/{userId}/savedEvents`
- `users/{userId}/savedListings`
- `users/{userId}/saves`
- `users/{userId}/follows`

Sayaç alanları client tarafından doğrudan güncellenmez. Katılımcı, üye, kayıt, takip ve benzeri sayaçlar Cloud Functions üzerinden güncellenir.

## Uygulama Mimarisi

Proje akışı şu sınırı korur:

```text
Screen -> Context action -> Service -> Firebase
```

Context katmanı:

- `AuthContext`: Auth state, profil, giriş/kayıt, profil güncelleme
- `EventContext`: Etkinlik listesi, seçim, oluşturma, katılma/ayrılma
- `CommunityContext`: Topluluk listesi, detay, üyelik, post ve katılım isteği
- `MarketContext`: İlan listesi, ilan oluşturma, kullanıcının ilanları
- `ChatContext`: Chat listesi, mesajlar, bildirimler, okunma işlemleri
- `SavedContext`: Kaydedilen etkinlik ve ilanlar
- `ThemeContext`: Light/dark tema
- `AnalyticsContext`: Analytics event ve screen tracking

Reducer kullanılan modüller:

- Events
- Communities
- Market

Bu yapı ekran dosyalarının Firebase detaylarıyla şişmesini engeller ve realtime listener yönetimini context/service katmanında tutar.

## Cloud Functions

Projede kullanılan Cloud Functions listesi:

- `onEventJoin`: Etkinliğe katılım sonrası attendee count günceller
- `onEventLeave`: Etkinlikten ayrılma sonrası attendee count düşürür
- `onCommunityJoin`: Topluluk üyelik sayısını günceller
- `onCommunityLeave`: Topluluktan ayrılma sonrası üyelik sayısını düşürür
- `onMessageSent`: Chat son mesajını, updatedAt alanını ve bildirim akışını günceller
- `onListingSave`: İlan kaydetme sayacını günceller
- `onCommunityJoinRequestCreated`: Özel topluluk katılım isteğinde topluluk sahibine bildirim oluşturur
- `onCommunityJoinRequestUpdated`: Katılım isteği onay/red sonucunu işler
- `onUserFollow`: Takip sayaçlarını ve takip bildirimini oluşturur
- `onUserUnfollow`: Takip sayaçlarını geri alır

## Kalite Kontrolleri

Lint:

```sh
npm run lint
```

Test:

```sh
npm test
```

Firestore rules için emulator kontrolü:

```sh
firebase emulators:start --only firestore
```

Temiz teslim öncesi önerilen kontrol sırası:

```sh
npm install
npm run lint
npm test
firebase deploy --only firestore:rules
firebase deploy --only functions
```

## Demo Senaryosu

Sunum için önerilen uçtan uca demo:

1. Yeni kullanıcı kaydı oluştur.
2. Profil tamamlama ekranında departman, sınıf, ilgi alanı ve bio bilgilerini gir.
3. Discover ekranından yeni etkinlik oluştur.
4. İkinci kullanıcıyla giriş yap ve etkinliğe katıl.
5. Hub ekranında katılınan etkinliğin göründüğünü göster.
6. Community ekranında topluluk oluştur.
7. Özel topluluğa başka kullanıcıdan katılım isteği gönder.
8. Bildirimler ekranında isteği onayla veya reddet.
9. Market ekranında yeni ilan oluştur.
10. Başka kullanıcıyla ilan sahibine mesaj gönder.
11. Messages ekranında realtime mesajlaşmayı göster.
12. Firebase Console'da Firestore yazma/okuma değişikliklerini canlı göster.

Bu demo; Auth, Firestore, Storage, Functions, Messaging ve realtime listener akışlarının birlikte çalıştığını gösterir.

## Proje Komutları

```sh
npm start
npm run android
npm run ios
npm run lint
npm test
npm run seed:firestore
```

## Teslim Notu

CampusConnect, Firebase Console'da izlenebilir gerçek okuma/yazma akışlarıyla demo edilecek şekilde hazırlanmıştır. Sunum sırasında "çalışıyor ama gösteremiyorum" durumunu önlemek için demo öncesi Firebase rules ve Functions deploy durumunun kontrol edilmesi gerekir.
