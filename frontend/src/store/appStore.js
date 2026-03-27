import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import studentProfileReducer from "./studentProfileSlice";
import internshipReducer from "./internshipSlice";
import dashboardReducer from "./dashboardSlice";

const appStore = configureStore({
  reducer: {
    user: userReducer,
    studentProfile: studentProfileReducer,
    internship: internshipReducer,
    dashboard: dashboardReducer,
  },
});

export default appStore;
