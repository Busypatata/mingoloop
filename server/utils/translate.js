// Translation via the MyMemory API (https://mymemory.translated.net).
// Free, no API key needed. Anonymous use is limited to ~5,000 characters/day
// per IP; setting MYMEMORY_EMAIL in server/.env raises that to ~50,000.

const ENDPOINT = 'https://api.mymemory.translated.net/get';
const MAX_CHUNK_BYTES = 450; // MyMemory rejects queries over 500 bytes
const REQUEST_TIMEOUT_MS = 8000;
const CACHE_LIMIT = 500;

// Language names used by the app (see src/utils/languages.ts) -> MyMemory codes.
// Onboarding accepts free text, so lookups are case-insensitive and unknown
// names simply fall back to the caller's default.
const CODE_BY_NAME = {
  english: 'en',
  spanish: 'es',
  french: 'fr',
  german: 'de',
  italian: 'it',
  portuguese: 'pt',
  dutch: 'nl',
  swedish: 'sv',
  norwegian: 'no',
  danish: 'da',
  polish: 'pl',
  russian: 'ru',
  ukrainian: 'uk',
  greek: 'el',
  turkish: 'tr',
  hebrew: 'he',
  arabic: 'ar',
  hindi: 'hi',
  bengali: 'bn',
  urdu: 'ur',
  punjabi: 'pa',
  tamil: 'ta',
  telugu: 'te',
  thai: 'th',
  vietnamese: 'vi',
  indonesian: 'id',
  malay: 'ms',
  japanese: 'ja',
  korean: 'ko',
  'mandarin chinese': 'zh-CN',
  mandarin: 'zh-CN',
  chinese: 'zh-CN',
  cantonese: 'zh-TW',
  filipino: 'tl',
  tagalog: 'tl',
  swahili: 'sw',
};

export const DEFAULT_TARGET_LANGUAGE = 'English';

export function languageCode(name) {
  if (!name) return null;
  return CODE_BY_NAME[String(name).trim().toLowerCase()] || null;
}

function baseLanguage(code) {
  return String(code || '').toLowerCase().split(/[-_]/)[0];
}

class TranslateError extends Error {
  constructor(kind) {
    super(kind);
    this.kind = kind; // 'QUOTA' | 'UNAVAILABLE'
  }
}

const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'" };

function decodeEntities(text) {
  return text
    .replace(/&(amp|lt|gt|quot|apos|#39);/g, (m) => ENTITIES[m] ?? m)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}

// Splits `str` into [head, rest] where head fits in `maxBytes` of UTF-8,
// preferring to break at a space.
function takeBytes(str, maxBytes) {
  let bytes = 0;
  let end = 0;
  for (const ch of str) {
    const size = Buffer.byteLength(ch);
    if (bytes + size > maxBytes) break;
    bytes += size;
    end += ch.length;
  }
  if (end >= str.length) return [str, ''];
  const space = str.lastIndexOf(' ', end);
  if (space > end / 2) end = space;
  return [str.slice(0, end), str.slice(end)];
}

export function splitIntoChunks(text) {
  const pieces = text.match(/[^.!?。！？\n]+[.!?。！？]*\s*/g) || [text];
  const chunks = [];
  let current = '';

  for (const piece of pieces) {
    let rest = piece;
    while (Buffer.byteLength(rest) > MAX_CHUNK_BYTES) {
      if (current) {
        chunks.push(current);
        current = '';
      }
      const [head, tail] = takeBytes(rest, MAX_CHUNK_BYTES);
      chunks.push(head);
      rest = tail;
    }
    if (Buffer.byteLength(current + rest) > MAX_CHUNK_BYTES) {
      chunks.push(current);
      current = rest;
    } else {
      current += rest;
    }
  }
  if (current) chunks.push(current);

  return chunks.map((c) => c.trim()).filter(Boolean);
}

async function translateChunk(text, targetCode) {
  const params = new URLSearchParams({ q: text, langpair: `autodetect|${targetCode}` });
  if (process.env.MYMEMORY_EMAIL) params.set('de', process.env.MYMEMORY_EMAIL);

  let response;
  try {
    response = await fetch(`${ENDPOINT}?${params}`, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch {
    throw new TranslateError('UNAVAILABLE');
  }

  if (response.status === 429) {
    console.error('[translate] MyMemory HTTP 429');
    throw new TranslateError('QUOTA');
  }
  if (!response.ok) {
    console.error('[translate] MyMemory HTTP', response.status);
    throw new TranslateError('UNAVAILABLE');
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new TranslateError('UNAVAILABLE');
  }

  // Source and target resolved to the same language — nothing to translate.
  if (/DISTINCT LANGUAGES/i.test(String(data.responseDetails || ''))) {
    return { text, detected: targetCode };
  }
  if (data.quotaFinished || Number(data.responseStatus) === 429) {
    console.error('[translate] MyMemory quota:', JSON.stringify(data).slice(0, 300));
    throw new TranslateError('QUOTA');
  }
  if (Number(data.responseStatus) !== 200) {
    console.error('[translate] MyMemory error:', JSON.stringify(data).slice(0, 300));
    throw new TranslateError('UNAVAILABLE');
  }

  const translated = data.responseData?.translatedText;
  if (!translated) throw new TranslateError('UNAVAILABLE');
  if (/^MYMEMORY WARNING/i.test(translated)) {
    console.error('[translate] MyMemory warning:', translated.slice(0, 200));
    throw new TranslateError('QUOTA');
  }

  return { text: decodeEntities(translated), detected: data.responseData?.detectedLanguage };
}

// Backup used when MyMemory refuses (quota / outage). Google's public web
// endpoint, no API key needed.
async function translateChunkFallback(text, targetCode) {
  const params = new URLSearchParams({ client: 'gtx', sl: 'auto', tl: targetCode, dt: 't', q: text });
  let response;
  try {
    response = await fetch(`https://translate.googleapis.com/translate_a/single?${params}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    console.error('[translate] fallback request failed:', err.message);
    throw new TranslateError('UNAVAILABLE');
  }
  if (response.status === 429) throw new TranslateError('QUOTA');
  if (!response.ok) {
    console.error('[translate] fallback HTTP', response.status);
    throw new TranslateError('UNAVAILABLE');
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new TranslateError('UNAVAILABLE');
  }
  const translated = Array.isArray(data?.[0]) ? data[0].map((part) => part?.[0] || '').join('') : '';
  if (!translated) throw new TranslateError('UNAVAILABLE');
  return { text: translated, detected: typeof data[2] === 'string' ? data[2] : undefined };
}

async function translateWithFallback(chunk, targetCode) {
  try {
    return await translateChunk(chunk, targetCode);
  } catch (error) {
    if (!(error instanceof TranslateError)) throw error;
    try {
      return await translateChunkFallback(chunk, targetCode);
    } catch {
      throw error; // report the original MyMemory problem
    }
  }
}

const cache = new Map();

// Returns { text, sameLanguage }. `cacheKey` lets the same message be
// translated repeatedly without spending more of the free quota.
export async function translateText(text, targetCode, cacheKey) {
  if (cacheKey && cache.has(cacheKey)) return cache.get(cacheKey);

  const chunks = splitIntoChunks(text);
  const results = [];
  for (const chunk of chunks) {
    results.push(await translateWithFallback(chunk, targetCode));
  }

  const sameLanguage =
    results.length > 0 && !!results[0].detected && baseLanguage(results[0].detected) === baseLanguage(targetCode);

  const result = { text: results.map((r) => r.text).join(' '), sameLanguage };

  if (cacheKey) {
    if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value);
    cache.set(cacheKey, result);
  }
  return result;
}

export { TranslateError };
