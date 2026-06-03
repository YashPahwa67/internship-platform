import { useAppSelector } from '../app/hooks';
import { selectUser } from '../features/auth/authSlice';
import { useGetProfileQuery } from '../api/studentApi';
import type { StudentProfile } from '../api/studentApi';

export function getDisplayName(
  user: { firstName?: string; lastName?: string; displayName?: string; email?: string } | null | undefined,
  profile?: Pick<StudentProfile, 'fullName'> | null
) {
  return (
    profile?.fullName?.trim() ||
    user?.displayName?.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
    user?.email?.split('@')[0] ||
    'User'
  );
}

export function getInitials(displayName: string) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return displayName.slice(0, 2).toUpperCase() || '?';
}

/** Auth user + live student profile for name & avatar across the app */
export function useDisplayUser() {
  const user = useAppSelector(selectUser);
  const isStudent = user?.role === 'student';

  const { data: profileResponse } = useGetProfileQuery(undefined, {
    skip: !isStudent,
  });

  const profile = profileResponse?.data;
  const displayName = getDisplayName(user, profile);
  const firstName = displayName.split(/\s+/)[0] || user?.firstName || '';
  const avatarUrl = profile?.profilePicture?.url || user?.profilePictureUrl;
  const initials = getInitials(displayName);

  return {
    user,
    profile,
    displayName,
    firstName,
    avatarUrl,
    initials,
  };
}
