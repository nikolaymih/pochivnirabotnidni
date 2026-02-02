/**
 * Avatar Utilities
 *
 * Generates initials and deterministic colors for user avatars.
 * Based on Google's avatar generation pattern.
 */

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

const AVATAR_COLORS = [
  '#EF4444', // red
  '#F59E0B', // amber
  '#10B981', // emerald
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
];

export function getAvatarColor(userId: string): string {
  const hash = hashString(userId);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function getInitials(fullName: string | null, email: string): string {
  if (fullName) {
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      // First letter of first word + first letter of last word
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    // Single word - first letter only
    return parts[0][0].toUpperCase();
  }
  // Fallback to email
  return email[0].toUpperCase();
}
