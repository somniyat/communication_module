import { createSlice } from '@reduxjs/toolkit';
import { getToken, clearToken } from '../../../shared/lib/storage';
import { login, register, fetchMe } from './auth.thunks';

const initialState = {
  user: null,
  token: getToken() || null,
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      clearToken();
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => {
      state.status = 'loading';
      state.error = null;
    };
    const handleAuthFulfilled = (state, action) => {
      state.status = 'succeeded';
      state.user = action.payload.user;
      state.token = action.payload.token;
    };
    const handleRejected = (state, action) => {
      state.status = 'failed';
      state.error = action.payload || action.error.message;
    };

    builder
      .addCase(login.pending, handlePending)
      .addCase(login.fulfilled, handleAuthFulfilled)
      .addCase(login.rejected, handleRejected)
      .addCase(register.pending, handlePending)
      .addCase(register.fulfilled, handleAuthFulfilled)
      .addCase(register.rejected, handleRejected)
      .addCase(fetchMe.pending, handlePending)
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.status = 'failed';
        state.user = null;
        state.token = null;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
