# CampusConnect Developer Rules

Bu dosya, CampusConnect projesini hangi sirayla ve hangi mantikla gelistirecegini tanimlar. Amac, once calisan temel sistemi kurmak, sonra mimariyi dogrulamak, en son performans ve detay iyilestirmelerine gecmektir.

Ana yaklasim:

1. Make it work: once calissin.
2. Make it right: sonra dogru mimariye ve kurallara otursun.
3. Make it fast: en son performans ve animasyonlar iyilestirilsin.

## Erken Faz UI Karari

Faz 0-10 arasinda hedef, Figma'ya birebir gorunum degil, calisan ve test edilebilir uygulama akisini kurmaktir.

- Auth, navigation, context, Firebase ve realtime veri akislari oturmadan UI pixel-perfect hale getirilmeye calisilmamalidir.
- Bu fazlarda ekranlar sade ama kullanilabilir olmalidir: form doldurulabilmeli, butonlara basilabilmeli, loading/error/empty state okunabilmelidir.
- Renk, spacing, typography, kart detaylari, ikonlar ve Figma'ya birebir uyum Faz 11'de topluca ele alinmalidir.
- Bir UI sorunu kullanici akisini engellemiyorsa tasarim borcu olarak not edilir ve sonraki fazlara devam edilir.
- Bir UI sorunu form doldurmayi, butona basmayi, kayit/giris yapmayi veya veri okumayi engelliyorsa ilgili fazda hemen duzeltilir.
- Sade/mock ekranlarla altyapi tamamlanabilir; Figma'ya yakin son gorsel kalite Faz 11'de yapilacaktir.
- Faz 11'e gecmeden once calisan akislarda gorunen mock tasarimlar tasarim borcu olarak kabul edilir, teknik borc olarak degil.

## Gelistirme Ortami Notlari

Emulator ve debug build yavasligi, ozellikle form yazarken gecikme, klavye onerileri, spellcheck alt cizgileri ve accessibility floating menu gibi davranislar uretim tasarimi olarak degerlendirilmemelidir.

- Text input alanlarinda email, sifre ve teknik alanlar icin `autoCorrect={false}` ve `spellCheck={false}` kullanilmalidir.
- Android emulator'da yazma gecikmesi olursa once emulator ayarlari, RAM/CPU kullanimi, Metro warning'leri ve debug overlay kontrol edilmelidir.
- Emulator kaynakli floating menu veya accessibility overlay uygulama UI'i sanilmamalidir; cihaz ayarlarindan kapatilmalidir.
- Performans kararlarini debug emulator goruntusune gore erken vermekten kacin; kritik akislari mumkunse fiziksel Android cihazda da test et.
- UI polish yapmadan once lint, test, auth akisi ve Firestore okuma/yazma davranisi dogrulanmalidir.

## Faz 0 - Proje Temeli

Hedef: Kod yazmaya baslamadan once klasor yapisi, dokumanlar ve temel kararlar net olsun.

Yapilacaklar:

- `src/` klasor yapisini koru.
- Ekranlari `src/screens/` altinda module gore ayir.
- Tekrar kullanilan UI parcalarini `src/components/` altina koy.
- Firebase islemlerini ekran dosyalarina yazma; `src/services/` altinda tut.
- Ortak state yonetimini `src/context/` ve `src/reducers/` ile yap.
- Firestore koleksiyon isimlerini `src/constants/collections.js` icinden kullan.
- Route isimlerini `src/constants/routes.js` icinden kullan.

Bu fazin cikti kontrolu:

- Proje lint hatasi vermemeli.
- Uygulama acilinca en az bir placeholder ekran gostermeli.
- Dosya yapisi modullere ayrilmis olmali.

## Faz 1 - Firebase Hazirligi

Hedef: Uygulamanin gercek Firebase altyapisini baglamak.

Yapilacaklar:

- Firebase projesinde Auth, Firestore, Storage, Functions, FCM ve Analytics servislerini aktif et.
- Firebase config dosyalarini projeye ekle ama Git'e commit etme.
- `.env.example` veya config dokumani hazirla.
- `src/services/firebase.js` icinde Firebase init yapisini kur.
- Firestore ana koleksiyonlarini plana gore hazirla:
  - `users`
  - `events`
  - `communities`
  - `listings`
  - `chats`
- Security rules taslagini Firebase Console veya Emulator tarafina tasimadan once tekrar kontrol et.
- Firestore rules ve Storage rules dosyalarini deploy et; Storage API aktif degilse bu eksigi Faz 5'te ilk upload akisindan once kapat.

Bu fazin cikti kontrolu:

- Firebase app initialize edilebilmeli.
- Auth ve Firestore servislerine koddan erisilebilmeli.
- Firestore rules deploy edilmis olmali; Storage rules deploy durumu not edilmis veya tamamlanmis olmali.
- Config dosyalari Git'e dusmemeli.

## Faz 2 - Auth ve Kullanici Akisi

Hedef: Uygulamaya giris cikis ve kullanici profil temeli calissin.

Yapilacaklar:

- `AuthContext` icine `onAuthStateChanged` listener ekle.
- Login ekranini Firebase email/password ile calistir.
- Register ekranini Firebase Auth + `users/{uid}` Firestore dokumani ile calistir.
- Forgot Password akisini ekle.
- Kayit sonrasi ProfileCompletion ekranina yonlendirme yap.
- `users/{uid}` icinde minimum profil alanlarini tut:
  - `displayName`
  - `email`
  - `department`
  - `year`
  - `interests`
  - `bio`
  - `photoURL`
  - `fcmToken`

Bu fazin cikti kontrolu:

- Yeni kullanici kaydolabilmeli.
- Kullanici giris yapabilmeli.
- Uygulama acilinca mevcut login durumu algilanmali.
- Profil tamamlanmadan ana uygulamaya gecilmemeli.

## Faz 3 - Context ve Reducer Mantigi

Hedef: Ekranlar Firebase'e dogrudan baglanmadan, context uzerinden veri alabilsin.

Yapilacaklar:

- `EventContext` icine etkinlik aksiyonlarini ekle.
- `CommunityContext` icine topluluk aksiyonlarini ekle.
- `MarketContext` icine ilan aksiyonlarini ekle.
- `ChatContext` icine chat ve mesaj aksiyonlarini ekle.
- `ThemeContext` icine dark/light tema kaliciligini ekle.
- `EventContext`, `CommunityContext`, `MarketContext` icin `useReducer` kullanmaya devam et.

Kural:

- Ekranlar Firebase service fonksiyonlarini direkt cagirmamali.
- Ekran -> Context action -> Service -> Firebase sirasi izlenmeli.

Bu fazin cikti kontrolu:

- Her ana modulun context'i calisir halde olmali.
- Loading, error ve data state'leri context icinde yonetilmeli.
- Reducer action isimleri anlasilir olmali.

## Faz 4 - Navigation

Hedef: Tum ekranlara gidilebilen bos ama calisan bir uygulama akisi kurmak.

Yapilacaklar:

- React Navigation paketlerini kur.
- Auth Stack kur.
- Main Tab Navigator kur.
- Her modul icin Stack yapisi kur:
  - Discover / Events
  - Communities
  - Market
  - Chat
  - Profile
- Modal veya stack ekranlarini ayir:
  - CreateEvent
  - CreateCommunity
  - CreateListing
  - EditProfile
  - Notifications
- Auth durumuna gore `AuthStack` veya `MainApp` goster.

Bu fazin cikti kontrolu:

- Tum placeholder ekranlara route ile ulasilabilmeli.
- Login olmayan kullanici ana uygulamayi gormemeli.
- Login olan kullanici Auth ekranlarinda kalmamali.

## Faz 5 - Events Modulu

Hedef: Ilk gercek Firestore realtime modulunu calistirmak.

Yapilacaklar:

- Discover ekraninda `events` koleksiyonunu `onSnapshot` ile dinle.
- Discover icindeki lokal event kartini `src/components/events/EventCard.js` dosyasina tasi.
- EventDetail ekranini yaz.
- CreateEvent ekranini 3 adimli form olarak yaz.
- Event cover image upload akisindan once Faz 1'den kalan Storage rules/API deploy borcunu kapat.
- Event cover image upload akisini Storage ile yap.
- Join/leave event islemlerini `events/{eventId}/attendees/{uid}` uzerinden yap.
- `attendeeCount` client tarafindan yazilmasin; Cloud Function ile artsin/azalsin.

Bu fazin cikti kontrolu:

- EventCard `src/components/events/EventCard.js` icinde tekrar kullanilabilir component olmali.
- Storage rules deploy edilmeden event cover upload tamamlanmis sayilmamali.
- Yeni etkinlik olusturulunca Discover ekraninda anlik gorunmeli.
- Katilma islemi Firestore'a yazmali.
- `attendeeCount` realtime guncellenmeli.

## Faz 6 - Cloud Functions Ilk Set

Hedef: Client'in yazmamasi gereken sayaç ve backend islemlerini Functions'a tasimak.

Yapilacaklar:

- `onEventJoin`
- `onEventLeave`
- `onCommunityJoin`
- `onCommunityLeave`
- `onMessageSent`
- `onListingSave`
- `onUserFollow`
- `onUserUnfollow`

Kural:

- Sayaç alanlari client tarafindan dogrudan update edilmez.
- Functions once emulator ile test edilir.
- Sonra Firebase'e deploy edilir.

Bu fazin cikti kontrolu:

- Event attendee count otomatik artip azalir.
- Community member count otomatik artip azalir.
- Mesaj gonderilince chat lastMessage ve updatedAt guncellenir.

## Faz 7 - Communities Modulu

Hedef: Topluluk listeleme, detay ve post akislarini calistirmak.

Yapilacaklar:

- CommunityList ekranini realtime Firestore ile yaz.
- CommunityCard componenti yaz.
- CommunityDetail ekranini yaz.
- Topluluga katil/cik akisini ekle.
- Community post olusturma akisini ekle.
- PostDetail ekranini yorum ve begeni mantigiyla hazirla.
- CreateCommunity ekraninda cover/icon upload akisini ekle.

Bu fazin cikti kontrolu:

- Yeni topluluk olusturulabilmeli.
- Katilma/cikma islemi realtime yansimali.
- Topluluk postlari anlik gorunmeli.

## Faz 8 - Market Modulu

Hedef: Ikinci el ilan akislarini calistirmak.

Yapilacaklar:

- MarketHome ekranini `listings` koleksiyonu ile yaz.
- ListingCard componenti yaz.
- ListingDetail ekranini yaz.
- CreateListing ekraninda coklu fotograf upload akisini ekle.
- MyListings ekranini yaz.
- Save listing akisini ekle.
- Market kaynakli chat baslatmada `relatedListingId` kullan.

Bu fazin cikti kontrolu:

- Yeni ilan olusturulunca MarketHome'da anlik gorunmeli.
- ListingDetail uzerinden saticiya mesaj atilabilmeli.
- Kaydedilen ilan state'i dogru gorunmeli.

## Faz 9 - Chat ve Notifications

Hedef: Gercek zamanli mesajlasma ve bildirim akisini kurmak.

Yapilacaklar:

- ChatList ekranini `chats` koleksiyonu ile yaz.
- ChatDetail ekranini `chats/{chatId}/messages` ile yaz.
- Mesaj gonderme akisini ekle.
- Unread badge mantigini ekle.
- Notifications ekranini `users/{uid}/notifications` ile yaz.
- FCM token alma/silme mantigini Settings ekranina bagla.

Kural:

- Mesajlar sadece `chats/{chatId}/messages` altinda tutulur.
- Listing mesajlari icin ayri mesaj koleksiyonu acilmaz.

Bu fazin cikti kontrolu:

- Iki kullanici arasinda mesaj realtime gorunmeli.
- ChatList son mesaji ve okunmamis durumunu gostermeli.
- Bildirimler kullanici bazli listelenmeli.

## Faz 10 - Profile ve Settings

Hedef: Kullanici profil, ayar ve hesap islemlerini tamamlamak.

Yapilacaklar:

- Profile ekraninda kullanici bilgilerini goster.
- Kullanici etkinlikleri, ilanlari ve kaydedilenleri listele.
- EditProfile ekraninda profil guncelleme yap.
- Avatar upload akisini Storage ile ekle.
- UserProfile ekraninda baska kullaniciyi goster.
- Follow/unfollow akisini ekle.
- Settings ekraninda tema, bildirim ve cikis islemlerini tamamla.

Bu fazin cikti kontrolu:

- Profil bilgileri Firestore'dan gelmeli.
- Profil duzenleme Firestore'a yazmali.
- Tema degisimi tum uygulamaya yansimali.

## Faz 11 - Figma Uyum ve UI Tamamlama

Hedef: Calisan ekranlari Figma tasarimina sadik hale getirmek.

Yapilacaklar:

- Faz 0-10 arasinda olusan mock/sade ekranlari Figma tasarimina gore yeniden duzenle.
- Her ekran icin Figma'daki layout'u uygula.
- Loading, empty, error ve normal state'leri ekle.
- Dark mode karsiliklarini tamamla.
- Kart, buton, input, modal ve liste componentlerini ortaklastir.
- Permission bazli UI davranislarini ekle.

Bu fazin cikti kontrolu:

- Mock tasarimdan kalan gecici ekran gorunumu kalmamali.

- Her ekran Figma'daki karsiligina benzemeli.
- Her ekranin bos ve hata durumu olmali.
- Dark mode bozuk gorunmemeli.

## Faz 12 - Analytics, Performance ve Animasyon

Hedef: Degerlendirmede istenen davranislari ve performansi tamamlamak.

Yapilacaklar:

- Firebase Analytics event'lerini ekle.
- Discover ve Market listelerinde FlatList optimizasyonlari yap.
- `onSnapshot` listener unsubscribe kontrollerini yap.
- Skeleton shimmer ekle.
- EventDetail ve ListingDetail hero fade-in ekle.
- CreateEvent ve CreateListing form step transition ekle.
- Yeni mesaj/bildirim icin tab badge pulse animasyonu ekle.

Bu fazin cikti kontrolu:

- Analytics event'leri Firebase Console'da gorunmeli.
- Liste ekranlari takilmadan calismali.
- Zorunlu animasyonlar calismali.

## Faz 13 - Test, Demo ve Teslim

Hedef: Sunumda calisan, anlatilabilir ve savunulabilir proje teslim etmek.

Yapilacaklar:

- Lint ve test komutlarini calistir.
- Firebase Emulator ile temel security rules testlerini yap.
- Iki cihaz veya iki kullanici ile realtime demo hazirla.
- README dosyasini guncelle:
  - kurulum
  - Firebase servisleri
  - Firestore semasi
  - Context + reducer akisi
  - Cloud Functions listesi
- Demo senaryosu hazirla:
  - kullanici kaydi
  - etkinlik olusturma
  - etkinlige katilma
  - ilan olusturma
  - mesajlasma
  - Firebase Console canli gosterim

Bu fazin cikti kontrolu:

- Uygulama temiz kurulumla calismali.
- Firebase Console'da yazma/okuma islemleri gosterilebilmeli.
- Sunumda "calisiyor ama gosteremiyorum" durumu olmamali.

## Genel Kod Kurallari

- Ekran dosyalari is mantigi ile sismemeli.
- Firebase islemleri sadece service katmaninda olmali.
- Context action'lari ekranlarin ana baglanti noktasi olmali.
- Reducer'lar pure olmali; Firebase veya async is yapmamali.
- Sayaçlar client tarafindan dogrudan update edilmemeli.
- Her realtime listener unsubscribe edilmeli.
- Yeni modul eklerken once route, sonra context action, sonra service, sonra ekran yazilmali.
- Once calisan sade akis kurulmalı; sonra tasarim ve optimizasyon eklenmeli.
