import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  profilePictureUrl?: string;
  company?: { name: string; approvalStatus: string };
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
}

const loadToken = () => localStorage.getItem('accessToken');
const loadUser = () => {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
};

const initialState: AuthState = {
  user: loadUser(),
  accessToken: loadToken(),
};

function persistUser(user: AuthUser | null) {
  if (user) localStorage.setItem('user', JSON.stringify(user));
  else localStorage.removeItem('user');
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthUser; accessToken: string }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      localStorage.setItem('accessToken', action.payload.accessToken);
      persistUser(state.user);
    },
    patchUser: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (!state.user) return;
      state.user = { ...state.user, ...action.payload };
      persistUser(state.user);
    },
    syncFromStudentProfile: (
      state,
      action: PayloadAction<{
        fullName?: string;
        user?: { firstName?: string; lastName?: string };
        profilePicture?: { url?: string } | null;
      }>
    ) => {
      if (!state.user) return;
      const { fullName, user: u, profilePicture } = action.payload;
      if (fullName) {
        state.user.displayName = fullName;
        const parts = fullName.trim().split(/\s+/);
        state.user.firstName = parts[0] || state.user.firstName;
        state.user.lastName = parts.slice(1).join(' ') || '';
      }
      if (u?.firstName !== undefined) state.user.firstName = u.firstName;
      if (u?.lastName !== undefined) state.user.lastName = u.lastName;
      if (profilePicture?.url) state.user.profilePictureUrl = profilePicture.url;
      else if (profilePicture === null) state.user.profilePictureUrl = undefined;
      persistUser(state.user);
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      localStorage.removeItem('accessToken');
      persistUser(null);
    },
  },
});

export const { setCredentials, patchUser, syncFromStudentProfile, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  !!state.auth.accessToken;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
