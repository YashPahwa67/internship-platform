import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
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
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  !!state.auth.accessToken;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
