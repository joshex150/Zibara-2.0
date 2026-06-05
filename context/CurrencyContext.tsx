'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { countryToCurrency, COUNTRY_COOKIE } from '@/lib/geo-currency';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Rate relative to base currency (USD)
}

interface CurrencyContextType {
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  currencies: Currency[];
  getCurrency: (code: string) => Currency | undefined;
  convertPrice: (price: number, fromCurrency?: string) => number;
  formatPrice: (price: number, fromCurrency?: string) => string;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);
// Stores the currency the visitor *manually* picked. A manual choice always
// wins over geo auto-selection, so it's only written when the user changes it.
const CURRENCY_STORAGE_KEY = 'zibara_currency';
const LEGACY_CURRENCY_STORAGE_KEY = `cro${'chella_currency'}`;

/** Read a cookie value on the client (used for the geo country the edge set). */
function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)')
  );
  return match ? decodeURIComponent(match[1]) : null;
}

const defaultCurrencies: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', rate: 1500 },
];

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [selectedCurrency, setSelectedCurrencyState] = useState<string>('USD');
  const [currencies, setCurrencies] = useState<Currency[]>([]); // Start empty, will be populated from DB
  const [, setIsLoading] = useState(true);

  // Fetch currency rates from API first, then load saved preference
  const refreshRates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/currency/rates');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.rates && data.rates.length > 0) {
          // Only use currencies from database (admin-declared currencies)
          setCurrencies(data.rates);

          const currencyCodes: string[] = data.rates.map((c: Currency) => c.code);

          // 1. A manual choice (from a previous visit) always wins.
          const manualCurrency =
            localStorage.getItem(CURRENCY_STORAGE_KEY) ||
            localStorage.getItem(LEGACY_CURRENCY_STORAGE_KEY);

          if (manualCurrency && currencyCodes.includes(manualCurrency)) {
            setSelectedCurrencyState(manualCurrency);
            localStorage.setItem(CURRENCY_STORAGE_KEY, manualCurrency);
            localStorage.removeItem(LEGACY_CURRENCY_STORAGE_KEY);
          } else {
            // 2. Auto-select from the visitor's country (detected server-side
            //    from their IP — no permission prompt). Not persisted, so it
            //    stays "automatic" and can update if their location changes.
            const geoCurrency = countryToCurrency(readCookie(COUNTRY_COOKIE));

            const resolved =
              geoCurrency && currencyCodes.includes(geoCurrency)
                ? geoCurrency
                : // 3. Fall back to the first available currency / USD.
                  currencyCodes[0] || 'USD';

            setSelectedCurrencyState(resolved);
          }
        } else {
          // No currencies in DB - use defaults as fallback
          setCurrencies(defaultCurrencies);
        }
      } else {
        // API error - use defaults as fallback
        setCurrencies(defaultCurrencies);
      }
    } catch (error) {
      console.error('Error fetching currency rates:', error);
      // API error - use defaults as fallback
      setCurrencies(defaultCurrencies);
    } finally {
      setIsLoading(false);
    }
  };

  // Load rates on mount
  useEffect(() => {
    refreshRates();
  }, []);

  const setSelectedCurrency = (currency: string) => {
    // Validate currency exists in available currencies from DB
    const currencyCodes = currencies.map(c => c.code);
    if (currencyCodes.includes(currency)) {
      setSelectedCurrencyState(currency);
      // This is an explicit user choice — persist it so it sticks across visits
      // and takes priority over geo auto-selection.
      localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
      localStorage.removeItem(LEGACY_CURRENCY_STORAGE_KEY);
    } else {
      console.warn(`Currency ${currency} not found in available currencies`);
    }
  };

  const getCurrency = (code: string): Currency | undefined => {
    return currencies.find(c => c.code === code);
  };

  const convertPrice = (price: number, fromCurrency: string = 'USD'): number => {
    const from = getCurrency(fromCurrency);
    const to = getCurrency(selectedCurrency);
    
    if (!from || !to) return price;
    
    // Convert from base currency (USD) to target currency
    // If fromCurrency is USD, multiply by target rate
    // If fromCurrency is not USD, first convert to USD, then to target
    if (fromCurrency === 'USD') {
      return price * to.rate;
    } else {
      // Convert to USD first, then to target
      const priceInUSD = price / from.rate;
      return priceInUSD * to.rate;
    }
  };

  const formatPrice = (price: number, fromCurrency: string = 'USD'): string => {
    const convertedPrice = convertPrice(price, fromCurrency);
    const currency = getCurrency(selectedCurrency);
    
    if (!currency) return `$${convertedPrice.toFixed(2)}`;
    
    // Format based on currency
    if (currency.code === 'NGN') {
      return `₦${convertedPrice.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    } else if (currency.code === 'USD') {
      return `$${convertedPrice.toFixed(2)}`;
    } else {
      return `${currency.symbol}${convertedPrice.toFixed(2)}`;
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        setSelectedCurrency,
        currencies,
        getCurrency,
        convertPrice,
        formatPrice,
        refreshRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
