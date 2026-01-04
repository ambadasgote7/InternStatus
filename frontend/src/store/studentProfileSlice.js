import { createSlice } from "@reduxjs/toolkit";

const studentProfileSlice = createSlice({
  name: "studentProfile",
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    setStudentProfile: (state, action) => {
      state.data = action.payload;
      state.error = null;
    },
    clearStudentProfile: (state) => {
      state.data = null;
      state.error = null;
    },
    setProfileLoading: (state, action) => {
      state.loading = action.payload;
    },
    setProfileError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setStudentProfile,
  clearStudentProfile,
  setProfileLoading,
  setProfileError,
} = studentProfileSlice.actions;

export default studentProfileSlice.reducer;
