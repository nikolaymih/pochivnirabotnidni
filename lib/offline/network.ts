'use client';

import { useState, useEffect, useRef } from 'react';

export interface NetworkState {
  isOnline: boolean;
  isVerified: boolean;
}

/**
 * Network state detection hook with verification
 *
 * Uses navigator.onLine for initial state and offline detection (reliable).
 * Verifies online state with actual HTTP request to prevent false positives.
 */
export function useNetworkState(): NetworkState {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isVerified, setIsVerified] = useState(false);
  const isMounted = useRef(true);

  /**
   * Verify actual connectivity with HEAD request to health endpoint
   */
  const verifyConnection = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch('/api/health', {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store',
      });

      clearTimeout(timeoutId);

      if (isMounted.current) {
        setIsOnline(response.ok);
        setIsVerified(true);
      }
    } catch (error) {
      // Network error or timeout - definitely offline
      if (isMounted.current) {
        setIsOnline(false);
        setIsVerified(true);
      }
    }
  };

  useEffect(() => {
    // Initial verification on mount
    verifyConnection();

    const handleOffline = () => {
      // Offline is reliable per research - set immediately
      if (isMounted.current) {
        setIsOnline(false);
        setIsVerified(true);
      }
    };

    const handleOnline = () => {
      // Online may be false positive - verify before updating
      setIsVerified(false); // Reset verification state
      verifyConnection();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      isMounted.current = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, isVerified };
}
