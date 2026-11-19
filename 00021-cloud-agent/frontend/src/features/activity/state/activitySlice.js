import { createSlice } from '@reduxjs/toolkit';
import { sessionCleared } from '../../auth/state/authSlice.js';

const initialState = { events: [], status: 'idle', error: null };
const slice = createSlice({
  name: 'activity', initialState,
  reducers: {
    activityLoading(state) { state.status = 'loading'; state.error = null; },
    activityReceived(state, { payload }) { state.events = payload.events; state.status = 'ready'; },
    activityFailed(state, { payload }) { state.error = payload; state.status = 'error'; },
  },
  extraReducers: builder => builder.addCase(sessionCleared, () => initialState),
});

export const { activityLoading, activityReceived, activityFailed } = slice.actions;
export default slice.reducer;
