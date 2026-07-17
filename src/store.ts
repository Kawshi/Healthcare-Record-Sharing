import { configureStore } from '@reduxjs/toolkit';
import snackbarReducer from './features/snackbarSlice';
import authReducer from './features/authSlice';

export const store = configureStore({
  reducer: {
    snackbar: snackbarReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
