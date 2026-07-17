import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type UserRole = 'patient' | 'doctor' | 'hospital' | 'lab' | 'pharmacy' | 'insurer' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  account: string; // XRPL account address
}

interface AuthState {
  isAuthenticated: boolean;
  user?: AuthUser;
  expiresAt?: number; // epoch ms
  loading: boolean;
  error?: string;
  lastWallet?: 'gemwallet' | 'xumm' | 'manual';
}

const initialState: AuthState = {
  isAuthenticated: false,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (
      state,
      action: PayloadAction<{ user: AuthUser; expiresAt?: number }>
    ) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.expiresAt = action.payload.expiresAt;
      state.loading = false;
      state.error = undefined;
    },
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.user = undefined;
      state.expiresAt = undefined;
      state.loading = false;
      state.error = undefined;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string | undefined>) => {
      state.error = action.payload;
    },
    setLastWallet: (state, action: PayloadAction<AuthState['lastWallet']>) => {
      state.lastWallet = action.payload ?? undefined;
    },
    setUser: (state, action: PayloadAction<AuthUser | undefined>) => {
      state.user = action.payload;
    },
    setExpiry: (state, action: PayloadAction<number | undefined>) => {
      state.expiresAt = action.payload;
    },
  },
});

export const { setAuth, clearAuth, setAuthLoading, setAuthError, setLastWallet, setUser, setExpiry } = authSlice.actions;
export default authSlice.reducer;
