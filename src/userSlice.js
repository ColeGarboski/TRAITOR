import { createSlice } from '@reduxjs/toolkit';

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    userId: null,
    role: null,
  },
  reducers: {
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    setUserRole: (state, action) => { 
      state.role = action.payload;
    },
  },
});

export const { setUserId, setUserRole } = authSlice.actions;

export const selectUserId = (state) => state.auth.userId;

export const selectUserRole = (state) => state.auth.role;

export default authSlice.reducer;
