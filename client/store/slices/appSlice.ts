import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  theme: 'light' | 'dark';
}

const initialState: AppState = {
  theme: 'light',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    clearAll: (state) => {
      state.theme = 'light';
    },
  },
});

export const { setTheme, toggleTheme, clearAll } = appSlice.actions;
export default appSlice.reducer;