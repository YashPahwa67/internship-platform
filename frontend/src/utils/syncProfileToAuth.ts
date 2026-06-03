import type { AppDispatch } from '../app/store';
import { syncFromStudentProfile } from '../features/auth/authSlice';
import type { StudentProfile } from '../api/studentApi';

/** After profile save/upload, update global auth so navbar & dashboards refresh */
export function syncProfileToAuth(dispatch: AppDispatch, profile: StudentProfile | undefined) {
  if (!profile) return;
  dispatch(
    syncFromStudentProfile({
      fullName: profile.fullName,
      user: profile.user,
      profilePicture: profile.profilePicture?.url ? profile.profilePicture : null,
    })
  );
}
