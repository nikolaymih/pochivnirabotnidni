'use client';

import { useAuth } from '@/contexts/AuthContext';
import UserMenu from './UserMenu';

export default function AuthHeader() {
  const { user, isLoading, signInWithGoogle } = useAuth();

  // Loading state - show minimal skeleton
  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
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
      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
    >
      Вход с Google
    </button>
  );
}
