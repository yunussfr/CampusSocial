# CampusConnect Composite Index Plan

Bu dokuman Firestore sorgulari icin beklenen composite index ihtiyacini listeler. Kod yazilirken Firebase Console hata verdiginde ilgili index linki uzerinden olusturulabilir; fakat tasarim oncesi hangi filtrelerin desteklenecegi burada netlestirilmelidir.

## Genel Notlar

- Firestore `where` + `orderBy` kombinasyonlarinda composite index isteyebilir.
- Array filtreleri icin `array-contains` veya `array-contains-any` kullanilir.
- Arama icin Firestore basit prefix search yapabilir, fakat tam metin arama icin ileride Algolia gibi servis gerekir.
- MVP'de filtreleri abartmadan, dokumandaki zorunlu filtrelere odaklanmak daha dogrudur.

## Events

### Discover - Active Events by Date

Kullanim:

```txt
Discover ana akis
```

Query:

```txt
events
where status == "active"
orderBy startDate asc
limit 10
```

Index:

```txt
events: status ASC, startDate ASC
```

Figma etkisi:

- Discover listesi
- Infinite scroll
- Skeleton loading

### Discover - Category Filter

Kullanim:

```txt
Kategori: Konser, Seminer, Spor, Sosyal, Akademik
```

Query:

```txt
events
where status == "active"
where category == selectedCategory
orderBy startDate asc
```

Index:

```txt
events: status ASC, category ASC, startDate ASC
```

Figma etkisi:

- Category segmented control veya horizontal chips
- Empty state: bu kategoride etkinlik yok

### Discover - Date Filter

Kullanim:

```txt
Bugun / Bu hafta / Bu ay
```

Query:

```txt
events
where status == "active"
where startDate >= rangeStart
where startDate <= rangeEnd
orderBy startDate asc
```

Index:

```txt
events: status ASC, startDate ASC
```

Figma etkisi:

- Date filter chips
- Empty state

### Featured Events

Kullanim:

```txt
One cikan etkinlikler horizontal scroll
```

Query:

```txt
events
where status == "active"
orderBy likeCount desc
limit 5
```

Index:

```txt
events: status ASC, likeCount DESC
```

Figma etkisi:

- Horizontal featured event cards

### Profile - Created Events

Kullanim:

```txt
Profile > Olusturulan etkinlikler
```

Query:

```txt
events
where organizerId == currentUserId
orderBy createdAt desc
```

Index:

```txt
events: organizerId ASC, createdAt DESC
```

Figma etkisi:

- Profile tab listesi

## Communities

### Community Explore

Kullanim:

```txt
CommunityList > Kesfet
```

Query:

```txt
communities
orderBy createdAt desc
limit 10
```

Index:

```txt
Tek alan index yeterli olabilir.
```

Figma etkisi:

- Community cards

### Community Category Filter

Kullanim:

```txt
Kategori filtreleme
```

Query:

```txt
communities
where category == selectedCategory
orderBy memberCount desc
```

Index:

```txt
communities: category ASC, memberCount DESC
```

Figma etkisi:

- Category filter
- Popular communities ordering

### Community Privacy Filter

Kullanim:

```txt
Public/private ayrimi veya private badge
```

Query:

```txt
communities
where isPrivate == false
orderBy createdAt desc
```

Index:

```txt
communities: isPrivate ASC, createdAt DESC
```

Figma etkisi:

- Lock icon/private badge

### Community Posts

Kullanim:

```txt
CommunityDetail post feed
```

Query:

```txt
communities/{communityId}/posts
orderBy createdAt desc
limit 10
```

Index:

```txt
Subcollection single-field order index yeterli olabilir.
```

Figma etkisi:

- Post feed
- Pull-to-refresh
- Empty state

## Listings

### Market Active Listings

Kullanim:

```txt
MarketHome ana liste
```

Query:

```txt
listings
where status == "active"
orderBy createdAt desc
limit 10
```

Index:

```txt
listings: status ASC, createdAt DESC
```

Figma etkisi:

- Masonry grid
- Sold badge tasarimi active disi status icin

### Market Category Filter

Kullanim:

```txt
Kitap, Elektronik, Giyim, Mobilya, Diger
```

Query:

```txt
listings
where status == "active"
where category == selectedCategory
orderBy createdAt desc
```

Index:

```txt
listings: status ASC, category ASC, createdAt DESC
```

Figma etkisi:

- Category chips
- Empty category state

### Market Price Filter

Kullanim:

```txt
Fiyat araligi filtresi
```

Query:

```txt
listings
where status == "active"
where price >= minPrice
where price <= maxPrice
orderBy price asc
```

Index:

```txt
listings: status ASC, price ASC
```

Figma etkisi:

- Price range inputs veya slider

### Market Category + Price

Kullanim:

```txt
Kategori ve fiyat birlikte filtreleme
```

Query:

```txt
listings
where status == "active"
where category == selectedCategory
where price >= minPrice
where price <= maxPrice
orderBy price asc
```

Index:

```txt
listings: status ASC, category ASC, price ASC
```

Figma etkisi:

- Filter panel
- Apply filters button

### Similar Listings

Kullanim:

```txt
ListingDetail > Benzer ilanlar
```

Query:

```txt
listings
where status == "active"
where category == currentListing.category
orderBy createdAt desc
limit 6
```

Index:

```txt
listings: status ASC, category ASC, createdAt DESC
```

Figma etkisi:

- Detail sayfasi altinda horizontal listing cards

### My Listings

Kullanim:

```txt
Profile veya MyListings
```

Query:

```txt
listings
where sellerId == currentUserId
orderBy createdAt desc
```

Index:

```txt
listings: sellerId ASC, createdAt DESC
```

Figma etkisi:

- Seller controls
- Sold/reserved/active status tabs

## Chats

### Chat List

Kullanim:

```txt
ChatList
```

Query:

```txt
chats
where participants array-contains currentUserId
orderBy updatedAt desc
```

Index:

```txt
chats: participants ARRAY_CONTAINS, updatedAt DESC
```

Figma etkisi:

- Last message preview
- Unread badge
- Empty chat state

### Chat Messages

Kullanim:

```txt
ChatDetail
```

Query:

```txt
chats/{chatId}/messages
orderBy createdAt asc
```

Index:

```txt
Subcollection single-field order index yeterli olabilir.
```

Figma etkisi:

- Message bubbles
- Sending/read state

## Notifications

### User Notifications

Kullanim:

```txt
Notifications screen
```

Query:

```txt
users/{uid}/notifications
orderBy createdAt desc
```

Index:

```txt
Subcollection single-field order index yeterli olabilir.
```

Figma etkisi:

- Read/unread state
- Notification empty state

### Unread Notifications

Kullanim:

```txt
Tab badge ve Notifications filter
```

Query:

```txt
users/{uid}/notifications
where read == false
orderBy createdAt desc
```

Index:

```txt
notifications subcollection: read ASC, createdAt DESC
```

Figma etkisi:

- Badge count
- Read/unread visual ayrim

## Saved Data

Onerilen path'ler:

```txt
users/{uid}/savedEvents/{eventId}
users/{uid}/savedListings/{listingId}
```

### Saved Events

Query:

```txt
users/{uid}/savedEvents
orderBy createdAt desc
```

Index:

```txt
Subcollection single-field order index yeterli olabilir.
```

### Saved Listings

Query:

```txt
users/{uid}/savedListings
orderBy createdAt desc
```

Index:

```txt
Subcollection single-field order index yeterli olabilir.
```

## Search Notu

Firestore prefix search icin basit yaklasim:

```txt
where title >= q
where title <= q + "\uf8ff"
```

Bu yontem sadece baslik prefix aramasi icin uygundur. Buyuk/kucuk harf farkini azaltmak icin dokumanlara `titleLowercase` gibi alanlar eklemek daha sagliklidir.

Tasarim etkisi:

- Search input
- Clear search button
- Search empty state

## Ilk Asamada Olusturulmasi En Kritik Index'ler

MVP ve erken gelistirme icin once su index'ler yeterlidir:

```txt
events: status ASC, startDate ASC
events: status ASC, category ASC, startDate ASC
events: organizerId ASC, createdAt DESC

listings: status ASC, createdAt DESC
listings: status ASC, category ASC, createdAt DESC
listings: sellerId ASC, createdAt DESC

communities: category ASC, memberCount DESC

chats: participants ARRAY_CONTAINS, updatedAt DESC
```

Kod calismaya basladiginda Firebase Console eksik index linki verirse bu plana uygun sekilde eklenmelidir.
