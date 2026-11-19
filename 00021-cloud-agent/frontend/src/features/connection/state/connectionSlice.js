import { createSlice } from '@reduxjs/toolkit';
import { sessionCleared } from '../../auth/state/authSlice.js';

const initialState = { status: 'idle', error: null };
const slice = createSlice({
  name: 'connection', initialState,
  reducers: {
    connectionLoading(state) { state.status = 'loading'; state.error = null; },
    connectionFailed(state, { payload }) { state.status = 'error'; state.error = payload; },
  },
  extraReducers: builder => builder.addCase(sessionCleared, () => initialState),
});

export const { connectionLoading, connectionFailed } = slice.actions;
export default slice.reducer;
