import { toArabicNumerals } from './i18n';

export const formatCurrency = (amount: number, language: string = 'English'): string => {
  const isAr = language === 'العربية';
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  if (isAr) {
    return `${toArabicNumerals(formatted)} ر.س`;
  }
  return `SAR ${formatted}`;
};

export const generateUTR = (): string => {
  return 'SARIE' + Math.floor(100000000000 + Math.random() * 900000000000).toString();
};

export const generateTxnId = (): string => {
  return 'SAR' + Math.floor(10000000000 + Math.random() * 90000000000).toString();
};

export const formatDate = (date: Date, language: string = 'English'): string => {
  const isAr = language === 'العربية';
  if (isAr) {
    return new Intl.DateTimeFormat('ar-SA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

/**
 * Formats a Saudi IBAN with clean 4-character blocks and strictly allows only [A-Z0-9].
 * Strips all spaces, dashes, punctuation, and special characters.
 * Example output: "SA03 8000 0000 6080 1012 3456"
 */
export const formatSaudiIban = (input: string): string => {
  if (!input) return '';

  // Strip all non-alphanumeric characters and force uppercase
  let clean = input.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  // If user typed digits only without SA prefix, automatically prepend SA
  if (clean.length > 0 && /^\d/.test(clean)) {
    clean = 'SA' + clean;
  }

  // Max length for Saudi IBAN is 24 alphanumeric characters
  const trimmed = clean.slice(0, 24);

  // Group into blocks of 4 characters with a single space
  return trimmed.replace(/(.{4})/g, '$1 ').trim();
};

/**
 * Extracts raw 24-character alphanumeric IBAN string without any spaces or symbols.
 */
export const cleanSaudiIban = (input: string): string => {
  return input.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 24);
};

/**
 * Formats a Saudi mobile number into standard readable format: "050 123 4567" or "+966 50 123 4567"
 */
export const formatSaudiMobile = (input: string): string => {
  if (!input) return '';
  let digits = input.replace(/\D/g, '');

  // Strip leading international code if entered
  if (digits.startsWith('009665')) {
    digits = '05' + digits.substring(6);
  } else if (digits.startsWith('9665')) {
    digits = '05' + digits.substring(4);
  } else if (digits.startsWith('5')) {
    digits = '05' + digits.substring(1);
  }

  // Max 10 digits: 05XXXXXXXX
  const local = digits.slice(0, 10);

  if (local.length <= 3) return local;
  if (local.length <= 6) return `${local.slice(0, 3)} ${local.slice(3)}`;
  return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
};

/**
 * Strips all non-digit characters and limits length.
 */
export const sanitizeDigits = (input: string, maxLength: number = 10): string => {
  return input.replace(/\D/g, '').slice(0, maxLength);
};

