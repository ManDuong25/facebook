import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import postReducer from "../features/postSlice";
import authReducer from "../features/authSlice"; // Thêm authReducer

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    post: postReducer,
    auth: authReducer, // Thêm auth reducer vào store
  },
});

export default store;