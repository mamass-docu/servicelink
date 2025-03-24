import { configureStore } from "@reduxjs/toolkit";
import loadingReducer from "./loadingSlice";

const store = configureStore({
  reducer: {
    loading: loadingReducer,
  },
});

export default store;
