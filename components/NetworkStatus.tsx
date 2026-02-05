'use client';

import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useNetworkState } from '@/lib/offline/network';

/**
 * Network status detector with toast notifications
 *
 * Shows toast on offline/online transitions only (not on initial load).
 * This is a side-effect-only component (renders null).
 */
export default function NetworkStatus() {
  const { isOnline, isVerified } = useNetworkState();
  const prevIsOnline = useRef<boolean | null>(null);

  useEffect(() => {
    // Skip if not verified yet (avoid toast on page load)
    if (!isVerified) return;

    // Skip if this is the first verification (initial page load)
    if (prevIsOnline.current === null) {
      prevIsOnline.current = isOnline;
      return;
    }

    // Detect state transitions
    const wasOnline = prevIsOnline.current;
    const nowOffline = wasOnline && !isOnline;
    const nowOnline = !wasOnline && isOnline;

    if (nowOffline) {
      toast('Няма интернет връзка. Работите офлайн.', {
        icon: '📡',
        duration: 4000,
      });
    } else if (nowOnline) {
      toast.success('Връзката е възстановена', {
        duration: 2000,
      });
    }

    // Update ref for next comparison
    prevIsOnline.current = isOnline;
  }, [isOnline, isVerified]);

  return null;
}
