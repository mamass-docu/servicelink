import { createSlice } from "@reduxjs/toolkit";

const loadingSlice = createSlice({
  name: "loading",
  initialState: { value: false, specific: false },
  reducers: {
    openLoading: (state) => {
      state.value = true;
    },
    closeLoading: (state) => {
      state.value = false;
    },
    openSpecificLoading: (state) => {
      state.specific = true;
    },
    closeSpecificLoading: (state) => {
      state.specific = false;
    },
  },
});

export const { openLoading, closeLoading, openSpecificLoading, closeSpecificLoading } = loadingSlice.actions;
export default loadingSlice.reducer;
