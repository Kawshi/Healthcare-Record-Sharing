import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type SnackbarSeverity = 'success' | 'error' | 'info';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
}

const initialState: SnackbarState = { open: false, message: '', severity: 'info' };

const slice = createSlice({
  name: 'snackbar',
  initialState,
  reducers: {
    showSnackbar: (state: SnackbarState, action: PayloadAction<{ message: string; severity?: SnackbarSeverity }>) => {
      state.open = true;
      state.message = action.payload.message;
      state.severity = action.payload.severity ?? 'info';
    },
    hideSnackbar: (state: SnackbarState) => { state.open = false; },
  },
});

export const { showSnackbar, hideSnackbar } = slice.actions;
export default slice.reducer;
