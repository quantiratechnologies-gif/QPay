import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';

export const SUPPORTED_COUNTRY_CALLING_CODES = [
  '966', // Saudi Arabia
  '971', // United Arab Emirates
  '91',  // India
  '974', // Qatar
  '965', // Kuwait
  '973', // Bahrain
  '968', // Oman
  '20',  // Egypt
  '962', // Jordan
  '1',   // US / Canada
  '44',  // United Kingdom
];

export interface PhoneValidationResult {
  isValid: boolean;
  e164?: string;
  countryCode?: CountryCode;
  callingCode?: string;
  nationalNumber?: string;
  error?: string;
}

/**
 * Validates international phone input and formats to canonical E.164
 */
export function validateAndFormatPhone(rawPhone: string, defaultCountry?: CountryCode): PhoneValidationResult {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return { isValid: false, error: 'Phone number is required' };
  }

  const cleaned = rawPhone.trim();
  const phoneNumber = parsePhoneNumberFromString(cleaned, defaultCountry || 'SA');

  if (!phoneNumber || !phoneNumber.isValid()) {
    return { isValid: false, error: 'Invalid international phone number format' };
  }

  const callingCode = phoneNumber.countryCallingCode;
  if (!SUPPORTED_COUNTRY_CALLING_CODES.includes(callingCode)) {
    return {
      isValid: false,
      error: `Country code +${callingCode} is currently not supported for OTP delivery`,
    };
  }

  return {
    isValid: true,
    e164: phoneNumber.format('E.164'),
    countryCode: phoneNumber.country,
    callingCode,
    nationalNumber: phoneNumber.nationalNumber,
  };
}

/**
 * MSG91 API v5 expects MSISDN without the leading '+' (e.g. 966501234567 or 919876543210)
 */
export function toMsg91Msisdn(e164: string): string {
  return e164.startsWith('+') ? e164.slice(1) : e164;
}

/**
 * Masks phone number for safe compliance logging (e.g. +966****4567)
 */
export function maskPhone(e164: string): string {
  if (e164.length <= 6) return '****';
  const prefix = e164.slice(0, 4);
  const suffix = e164.slice(-4);
  return `${prefix}****${suffix}`;
}
