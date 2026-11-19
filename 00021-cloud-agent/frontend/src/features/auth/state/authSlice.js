import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: 'initializing', user: null, accessToken: null, error: null, githubAppSlug: 'exlantern',
};

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionReceived(state, { payload }) {
      state.status = 'authenticated';
      state.accessToken = payload.accessToken;
      state.user = payload.user;
      state.githubAppSlug = payload.githubAppSlug;
      state.error = null;
    },
    profileReceived(state, { payload }) {
      state.user = payload.user;
      state.githubAppSlug = payload.githubAppSlug;
    },
    sessionCleared: () => ({ ...initialState, status: 'anonymous' }),
    sessionFailed(state, { payload }) {
      state.status = 'error';
      state.error = payload;
    },
  },
});

export const { sessionReceived, profileReceived, sessionCleared, sessionFailed } = slice.actions;
export default slice.reducer;
