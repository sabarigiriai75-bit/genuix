// ──────────────────────────────────────────────────────────────
// Gold Rates Service — powered by GoldAPI.io
// Uses the direct per-gram prices returned by the API.
// Caches responses for 6 hours (free plan: 100 req/month).
// ──────────────────────────────────────────────────────────────

export interface CountryConfig {
  name: string;
  flag: string;
  currency: string;
  locale: string;
  /** Fallback per-gram rates when API is unreachable */
  fallback: { "24K": number; "22K": number; "18K": number; "14K": number };
}

export const COUNTRIES: CountryConfig[] = [
  {
    name: "India",
    flag: "🇮🇳",
    currency: "INR",
    locale: "en-IN",
    fallback: { "24K": 7850, "22K": 7195, "18K": 5887, "14K": 4580 },
  },
  {
    name: "United States",
    flag: "🇺🇸",
    currency: "USD",
    locale: "en-US",
    fallback: { "24K": 94, "22K": 86, "18K": 71, "14K": 55 },
  },
  {
    name: "United Kingdom",
    flag: "🇬🇧",
    currency: "GBP",
    locale: "en-GB",
    fallback: { "24K": 74, "22K": 68, "18K": 56, "14K": 43 },
  },
  {
    name: "United Arab Emirates",
    flag: "🇦🇪",
    currency: "AED",
    locale: "ar-AE",
    fallback: { "24K": 345, "22K": 316, "18K": 259, "14K": 202 },
  },
  {
    name: "Saudi Arabia",
    flag: "🇸🇦",
    currency: "SAR",
    locale: "ar-SA",
    fallback: { "24K": 353, "22K": 323, "18K": 265, "14K": 207 },
  },
  {
    name: "Singapore",
    flag: "🇸🇬",
    currency: "SGD",
    locale: "en-SG",
    fallback: { "24K": 127, "22K": 116, "18K": 95, "14K": 74 },
  },
  {
    name: "Australia",
    flag: "🇦🇺",
    currency: "AUD",
    locale: "en-AU",
    fallback: { "24K": 141, "22K": 129, "18K": 106, "14K": 83 },
  },
  {
    name: "Canada",
    flag: "🇨🇦",
    currency: "CAD",
    locale: "en-CA",
    fallback: { "24K": 129, "22K": 118, "18K": 97, "14K": 75 },
  },
  {
    name: "Japan",
    flag: "🇯🇵",
    currency: "JPY",
    locale: "ja-JP",
    fallback: { "24K": 14500, "22K": 13287, "18K": 10875, "14K": 8483 },
  },
  {
    name: "Switzerland",
    flag: "🇨🇭",
    currency: "CHF",
    locale: "de-CH",
    fallback: { "24K": 84, "22K": 77, "18K": 63, "14K": 49 },
  },
];

// ──────────────────────── Types ────────────────────────

export interface GoldRatesResponse {
  country: string;
  currency: string;
  rates: {
    "24K": number;
    "22K": number;
    "18K": number;
    "14K": number;
  };
  updatedAt: string;
  source: string;
}

// ──────────────────── In-memory cache ──────────────────

interface CacheEntry {
  data: GoldRatesResponse;
  timestamp: number;
}

const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours
const ratesCache = new Map<string, CacheEntry>();

// ──────────────────── Helpers ──────────────────────────

export function getCountryConfig(name: string): CountryConfig {
  return COUNTRIES.find((c) => c.name === name) ?? COUNTRIES[0];
}

export function formatGoldRate(value: number, countryName: string): string {
  const config = getCountryConfig(countryName);
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
    maximumFractionDigits: config.currency === "JPY" || config.currency === "KRW" ? 0 : 2,
  }).format(value);
}

// ──────────────── GoldAPI fetcher (server-side) ────────

export async function fetchGoldApiRates(currency: string): Promise<{
  price_gram_24k: number;
  price_gram_22k: number;
  price_gram_18k: number;
  price_gram_14k: number;
  timestamp: number;
}> {
  const apiKey = process.env.GOLD_API_KEY;
  if (!apiKey) throw new Error("GOLD_API_KEY is not set");

  const baseUrl = process.env.GOLD_API_URL ?? "https://www.goldapi.io/api/XAU";
  // baseUrl may end with /XAU/USD etc — strip any trailing currency
  const cleanBase = baseUrl.replace(/\/XAU\/[A-Z]{3}\s*$/i, "").replace(/\/+$/, "");
  const url = `${cleanBase}/XAU/${currency}`;

  const res = await fetch(url, {
    headers: {
      "x-access-token": apiKey.trim(),
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GoldAPI ${res.status}: ${text}`);
  }

  const data = await res.json();

  if (data.error) {
    throw new Error(`GoldAPI error: ${data.error}`);
  }

  return {
    price_gram_24k: data.price_gram_24k,
    price_gram_22k: data.price_gram_22k,
    price_gram_18k: data.price_gram_18k,
    price_gram_14k: data.price_gram_14k,
    timestamp: data.timestamp ?? Math.floor(Date.now() / 1000),
  };
}

// ──────────── Main entry: get rates for a country ─────

export async function getGoldRatesForCountry(
  countryName: string
): Promise<GoldRatesResponse> {
  const config = getCountryConfig(countryName);
  const cacheKey = config.currency;

  // Check cache first
  const cached = ratesCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
    return cached.data;
  }

  try {
    const api = await fetchGoldApiRates(config.currency);

    const result: GoldRatesResponse = {
      country: config.name,
      currency: config.currency,
      rates: {
        "24K": api.price_gram_24k,
        "22K": api.price_gram_22k,
        "18K": api.price_gram_18k,
        "14K": api.price_gram_14k,
      },
      updatedAt: new Date(api.timestamp * 1000).toISOString(),
      source: "goldapi.io",
    };

    // Store in cache
    ratesCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (err) {
    console.error(`GoldAPI fetch failed for ${config.currency}:`, err);

    // Return cached even if stale
    if (cached) {
      return cached.data;
    }

    // Return static fallback
    return {
      country: config.name,
      currency: config.currency,
      rates: config.fallback,
      updatedAt: new Date().toISOString(),
      source: "fallback",
    };
  }
}
