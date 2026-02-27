/**
 * Frontend Cache Utility
 * Caches API responses in localStorage with TTL (Time To Live)
 * Implements stale-while-revalidate pattern for faster UX
 */

const CACHE_PREFIX = 'sw_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  forceRefresh?: boolean; // Skip cache and fetch fresh
}

/**
 * Check if we're in a browser environment
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Get item from cache
 */
export function getFromCache<T>(key: string): { data: T; isStale: boolean } | null {
  if (!isBrowser) return null;
  
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (!cached) return null;
    
    const entry: CacheEntry<T> = JSON.parse(cached);
    const now = Date.now();
    const isStale = now - entry.timestamp > entry.ttl;
    
    return { data: entry.data, isStale };
  } catch (error) {
    console.warn('Cache read error:', error);
    return null;
  }
}

/**
 * Set item in cache
 */
export function setInCache<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
  if (!isBrowser) return;
  
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch (error) {
    console.warn('Cache write error:', error);
    // If localStorage is full, clear old cache entries
    clearOldCache();
  }
}

/**
 * Remove item from cache
 */
export function removeFromCache(key: string): void {
  if (!isBrowser) return;
  localStorage.removeItem(CACHE_PREFIX + key);
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): void {
  if (!isBrowser) return;
  
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

/**
 * Clear old/expired cache entries
 */
export function clearOldCache(): void {
  if (!isBrowser) return;
  
  const now = Date.now();
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const entry = JSON.parse(cached);
          // Remove if older than 1 hour regardless of TTL
          if (now - entry.timestamp > 60 * 60 * 1000) {
            keysToRemove.push(key);
          }
        }
      } catch {
        keysToRemove.push(key);
      }
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

/**
 * Cached fetch wrapper with stale-while-revalidate pattern
 * Returns cached data immediately (if available) while fetching fresh data in background
 */
export async function cachedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const { ttl = DEFAULT_TTL, forceRefresh = false } = options;
  
  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cached = getFromCache<T>(key);
    if (cached && !cached.isStale) {
      // Fresh cache - return immediately
      return cached.data;
    }
    
    if (cached && cached.isStale) {
      // Stale cache - return immediately but refresh in background
      fetchFn()
        .then(data => setInCache(key, data, ttl))
        .catch(console.error);
      return cached.data;
    }
  }
  
  // No cache or force refresh - fetch and cache
  const data = await fetchFn();
  setInCache(key, data, ttl);
  return data;
}

/**
 * Cache TTL presets
 */
export const CACHE_TTL = {
  SHORT: 10 * 1000,          // 10 seconds - for frequently changing data
  MEDIUM: 30 * 1000,         // 30 seconds - default for most data
  LONG: 60 * 1000,           // 1 minute - for semi-static data
  VERY_LONG: 2 * 60 * 1000,  // 2 minutes - for rarely changing data
} as const;
