import {LISTING_MAX_PHOTOS} from '../constants/listingOptions';
import {parseListingPrice} from './listingFormatters';

export function validateRequiredText(value, minLength, message) {
  return String(value || '').trim().length >= minLength ? null : message;
}

export function validatePrice(value) {
  if (String(value ?? '').trim() === '') {
    return 'Fiyat zorunludur.';
  }

  const price = parseListingPrice(value);
  if (!Number.isFinite(price)) {
    return 'Fiyat gecerli bir sayi olmalidir.';
  }

  if (price < 0) {
    return 'Fiyat negatif olamaz.';
  }

  return null;
}

export function validatePaymentMethods(methods) {
  return Array.isArray(methods) && methods.length > 0
    ? null
    : 'En az bir odeme yontemi secin.';
}

export function validateListingImages(assets) {
  return assets.length <= LISTING_MAX_PHOTOS
    ? null
    : `En fazla ${LISTING_MAX_PHOTOS} fotograf yukleyebilirsiniz.`;
}

export function validateListingForm(form, assets = []) {
  const errors = {};
  const titleError = validateRequiredText(form.title, 3, 'Baslik en az 3 karakter olmalidir.');
  const descriptionError = validateRequiredText(
    form.description,
    15,
    'Aciklama en az 15 karakter olmalidir.',
  );
  const priceError = validatePrice(form.price);
  const paymentError = validatePaymentMethods(form.paymentMethods);
  const imageError = validateListingImages(assets);

  if (titleError) errors.title = titleError;
  if (descriptionError) errors.description = descriptionError;
  if (priceError) errors.price = priceError;
  if (!form.category) errors.category = 'Kategori zorunludur.';
  if (!form.condition) errors.condition = 'Urun durumu zorunludur.';
  if (!form.city) errors.city = 'Sehir zorunludur.';
  if (!form.district) errors.district = 'Ilce zorunludur.';
  if (paymentError) errors.paymentMethods = paymentError;
  if (imageError) errors.images = imageError;

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
