import {parseListingPrice} from './listingFormatters';
import {
  LISTING_BOOLEAN_OPTIONS,
  LISTING_DELIVERY_OPTIONS,
  LISTING_PAYMENT_OPTIONS,
  LISTING_SELLER_TYPES,
  LISTING_SHIPPING_PAYER_OPTIONS,
  LISTING_STATUS_OPTIONS,
} from '../constants/listingOptions';
import {
  MARKET_CATEGORIES,
  MARKET_CONDITIONS,
} from './marketCategories';

function getLabel(options, key, fallback = '') {
  return options.find(item => item.key === key || item.firestoreValue === key)?.label || fallback;
}

export function buildListingTags(form) {
  return [
    form.category,
    form.subCategory,
    form.brand,
    form.model,
    form.color,
    form.material,
    ...(String(form.tags || '').split(',').map(tag => tag.trim())),
  ]
    .filter(Boolean)
    .map(tag => tag.toLocaleLowerCase('tr-TR'));
}

export function buildListingLocation(form) {
  return {
    city: form.city.trim(),
    district: form.district.trim(),
    neighborhood: form.neighborhood.trim(),
  };
}

export function buildSellerSnapshot(user, profile) {
  return {
    uid: user.uid,
    displayName: profile?.displayName || user?.displayName || '',
    photoURL: profile?.photoURL || user?.photoURL || '',
    department: profile?.department || '',
    campusName: profile?.campusName || profile?.university || '',
  };
}

export function buildListingPayload(form, imageURLs = []) {
  const price = parseListingPrice(form.price);
  const category = MARKET_CATEGORIES.find(item => item.firestoreValue === form.category);
  const condition = MARKET_CONDITIONS.find(item => item.firestoreValue === form.condition);

  return {
    title: form.title.trim(),
    description: form.description.trim(),
    price,
    currency: form.currency,
    category: form.category,
    categoryLabel: category?.label || form.category,
    subCategory: form.subCategory.trim(),
    condition: form.condition,
    conditionLabel: condition?.label || form.condition,
    imageURLs,
    tags: buildListingTags(form),
    brand: form.brand.trim(),
    model: form.model.trim(),
    color: form.color.trim(),
    material: form.material.trim(),
    dimensions: form.dimensions.trim(),
    usageDuration: form.usageDuration.trim(),
    warranty: form.warranty,
    warrantyLabel: getLabel(LISTING_BOOLEAN_OPTIONS, form.warranty, 'Belirtilmedi'),
    invoice: form.invoice,
    invoiceLabel: getLabel(LISTING_BOOLEAN_OPTIONS, form.invoice, 'Belirtilmedi'),
    originalBox: form.originalBox,
    originalBoxLabel: getLabel(LISTING_BOOLEAN_OPTIONS, form.originalBox, 'Belirtilmedi'),
    city: form.city.trim(),
    district: form.district.trim(),
    neighborhood: form.neighborhood.trim(),
    location: buildListingLocation(form),
    deliveryPreference: form.deliveryPreference,
    deliveryPreferenceLabel: getLabel(LISTING_DELIVERY_OPTIONS, form.deliveryPreference),
    shippingPayer: form.shippingPayer,
    shippingPayerLabel: getLabel(LISTING_SHIPPING_PAYER_OPTIONS, form.shippingPayer),
    paymentMethods: form.paymentMethods,
    paymentMethodLabels: form.paymentMethods.map(key =>
      getLabel(LISTING_PAYMENT_OPTIONS, key, key),
    ),
    sellerType: form.sellerType,
    sellerTypeLabel: getLabel(LISTING_SELLER_TYPES, form.sellerType),
    status: form.status,
    statusLabel: getLabel(LISTING_STATUS_OPTIONS, form.status, 'Aktif'),
    negotiable: Boolean(form.negotiable),
    isFree: price === 0,
    viewCount: 0,
    savedCount: 0,
  };
}
