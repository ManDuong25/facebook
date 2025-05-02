import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import postReducer from "../features/postSlice";
import authReducer from "../features/authSlice";
import adminReducer from "../features/adminSlice";
import chatbotReducer from "../features/chatbotSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    post: postReducer,
    auth: authReducer,
    admin: adminReducer,
    chatbot: chatbotReducer,
  },
});

export default store;