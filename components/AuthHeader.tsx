'use client';

import { useAuth } from '@/contexts/AuthContext';
import UserMenu from './UserMenu';

export default function AuthHeader() {
  const { user, isLoading, signInWithGoogle } = useAuth();

  // Loading state - show minimal skeleton
  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-oat-milk animate-pulse" />
      </div>
    );
  }

  // Authenticated - show user menu
  if (user) {
    return <UserMenu />;
  }

  // Anonymous - show sign-in button
  return (
    <button
      onClick={signInWithGoogle}
      className="px-4 py-2 text-sm font-medium text-coffee bg-white border border-latte rounded-lg hover:bg-cream hover:border-cappuccino transition-colors"
    >
      Вход с Google
    </button>
  );
}
