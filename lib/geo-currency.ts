/**
 * Maps an ISO 3166-1 alpha-2 country code to its primary ISO 4217 currency code.
 *
 * This is used to auto-select a storefront currency from the visitor's country
 * (detected server-side from their IP — see middleware.ts). The resolved currency
 * is only applied if the admin has it active in the database; otherwise the
 * storefront falls back to the first available currency / USD.
 */
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  // North America
  US: 'USD', CA: 'CAD', MX: 'MXN',
  // Eurozone
  AT: 'EUR', BE: 'EUR', CY: 'EUR', EE: 'EUR', FI: 'EUR', FR: 'EUR', DE: 'EUR',
  GR: 'EUR', IE: 'EUR', IT: 'EUR', LV: 'EUR', LT: 'EUR', LU: 'EUR', MT: 'EUR',
  NL: 'EUR', PT: 'EUR', SK: 'EUR', SI: 'EUR', ES: 'EUR', AD: 'EUR', MC: 'EUR',
  SM: 'EUR', VA: 'EUR', ME: 'EUR', XK: 'EUR',
  // Rest of Europe
  GB: 'GBP', CH: 'CHF', NO: 'NOK', SE: 'SEK', DK: 'DKK', IS: 'ISK', PL: 'PLN',
  CZ: 'CZK', HU: 'HUF', RO: 'RON', BG: 'BGN', HR: 'EUR', RS: 'RSD', UA: 'UAH',
  RU: 'RUB', BY: 'BYN', TR: 'TRY', AL: 'ALL', MK: 'MKD', MD: 'MDL', GE: 'GEL',
  // Africa
  NG: 'NGN', GH: 'GHS', KE: 'KES', ZA: 'ZAR', EG: 'EGP', MA: 'MAD', DZ: 'DZD',
  TN: 'TND', UG: 'UGX', TZ: 'TZS', RW: 'RWF', ET: 'ETB', CM: 'XAF', CI: 'XOF',
  SN: 'XOF', ML: 'XOF', BF: 'XOF', BJ: 'XOF', TG: 'XOF', NE: 'XOF', GA: 'XAF',
  CD: 'CDF', AO: 'AOA', MZ: 'MZN', ZM: 'ZMW', ZW: 'ZWL', BW: 'BWP', NA: 'NAD',
  MU: 'MUR', LY: 'LYD', SD: 'SDG',
  // Middle East
  AE: 'AED', SA: 'SAR', QA: 'QAR', KW: 'KWD', BH: 'BHD', OM: 'OMR', JO: 'JOD',
  LB: 'LBP', IL: 'ILS', IQ: 'IQD', IR: 'IRR', YE: 'YER',
  // Asia
  CN: 'CNY', JP: 'JPY', KR: 'KRW', IN: 'INR', PK: 'PKR', BD: 'BDT', LK: 'LKR',
  NP: 'NPR', ID: 'IDR', MY: 'MYR', SG: 'SGD', TH: 'THB', VN: 'VND', PH: 'PHP',
  HK: 'HKD', TW: 'TWD', MO: 'MOP', KH: 'KHR', MM: 'MMK', KZ: 'KZT', UZ: 'UZS',
  AF: 'AFN', MN: 'MNT', BN: 'BND',
  // Oceania
  AU: 'AUD', NZ: 'NZD', FJ: 'FJD', PG: 'PGK',
  // Latin America & Caribbean
  BR: 'BRL', AR: 'ARS', CL: 'CLP', CO: 'COP', PE: 'PEN', VE: 'VES', UY: 'UYU',
  PY: 'PYG', BO: 'BOB', EC: 'USD', CR: 'CRC', PA: 'USD', GT: 'GTQ', HN: 'HNL',
  NI: 'NIO', DO: 'DOP', JM: 'JMD', TT: 'TTD', CU: 'CUP',
};

/**
 * Resolve a country code to its currency code. Accepts any casing.
 * Returns null when the country is unknown.
 */
export function countryToCurrency(country?: string | null): string | null {
  if (!country) return null;
  const code = country.trim().toUpperCase();
  if (code.length !== 2) return null;
  return COUNTRY_TO_CURRENCY[code] ?? null;
}

/** Name of the cookie the middleware writes the detected country code into. */
export const COUNTRY_COOKIE = 'zibara_country';
