import { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';

/**
 * SSR-safe localStorage hook with error handling
 *
 * Synchronizes React state with browser localStorage.
 * Handles Next.js SSR, QuotaExceededError, and SecurityError gracefully.
 *
 * @param key - localStorage key
 * @param initialValue - fallback value if no stored data exists
 * @returns tuple of [storedValue, setValue] like useState
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  // Start with initial value for SSR, will be updated after hydration
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const isInitialized = useRef(false);
  const writeSuppressed = useRef(true);

  // Read from localStorage after mount (client-side only)
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  // Update localStorage whenever state changes (skip mount render)
  // On mount, both effects run in the same cycle: read sets isInitialized=true
  // but storedValue is still DEFAULT (setState is async). Without writeSuppressed,
  // the write effect would overwrite localStorage with DEFAULT_VACATION_DATA.
  useEffect(() => {
    if (writeSuppressed.current) {
      writeSuppressed.current = false;
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      // Handle QuotaExceededError (code 22) or SecurityError (private browsing)
      if (
        error instanceof DOMException &&
        (error.name === 'QuotaExceededError' ||
         error.code === 22 ||
         error.code === 1014) // Firefox NS_ERROR_DOM_QUOTA_REACHED
      ) {
        console.warn(`localStorage quota exceeded or unavailable for key "${key}" - using in-memory fallback`);
      } else {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
