import { configureStore } from '@reduxjs/toolkit';
import auth from '../features/auth/state/authSlice.js';
import activity from '../features/activity/state/activitySlice.js';
import connection from '../features/connection/state/connectionSlice.js';

export const store = configureStore({ reducer: { auth, activity, connection } });
