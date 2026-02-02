'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getInitials, getAvatarColor } from '@/lib/avatar/initials';

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  if (!user) return null;

  const fullName = user.user_metadata?.full_name || null;
  const email = user.email || '';
  const avatarUrl = user.user_metadata?.avatar_url;
  const displayName = fullName || email;
  const initials = getInitials(fullName, email);
  const avatarColor = getAvatarColor(user.id);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
            style={{ backgroundColor: avatarColor }}
          >
            {initials}
          </div>
        )}
        <span className="text-sm font-medium text-gray-700 hidden sm:inline">
          {displayName}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Изход
          </button>
        </div>
      )}
    </div>
  );
}
