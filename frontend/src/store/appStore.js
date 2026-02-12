import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import studentProfileReducer from "./studentProfileSlice";
import internshipReducer from "./internshipSlice";

const appStore = configureStore({
  reducer: {
    user: userReducer,
    studentProfile: studentProfileReducer,
    internship: internshipReducer,
  },
});

export default appStore;
