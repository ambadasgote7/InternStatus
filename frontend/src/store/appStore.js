import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import studentProfileReducer from "./studentProfileSlice";

const appStore = configureStore({
  reducer: {
    user: userReducer,
    studentProfile: studentProfileReducer,
  },
});

export default appStore;
