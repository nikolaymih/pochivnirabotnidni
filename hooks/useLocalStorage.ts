import { useState, useEffect, Dispatch, SetStateAction } from 'react';

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
  // Lazy initialization - only runs once on mount
  const [storedValue, setStoredValue] = useState<T>(() => {
    // SSR guard: localStorage only exists in browser
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage whenever state changes
  useEffect(() => {
    // SSR guard: skip during server-side rendering
    if (typeof window === 'undefined') return;

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
