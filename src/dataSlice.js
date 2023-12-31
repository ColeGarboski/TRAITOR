import { createSlice } from '@reduxjs/toolkit';

export const dataSlice = createSlice({
  name: 'data',
  initialState: {
    value: null
  },
  reducers: {
    setData: (state, action) => {
      state.value = action.payload;
    }
  }
});

export const { setData } = dataSlice.actions;
export const selectData = (state) => state.data.value;
export default dataSlice.reducer;
