import { configureStore } from '@reduxjs/toolkit';
import dataReducer from './dataSlice';
import authReducer from './userSlice'; 

export const store = configureStore({
  reducer: {
    data: dataReducer,
    auth: authReducer,
  },
});
