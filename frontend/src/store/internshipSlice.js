import { createSlice } from "@reduxjs/toolkit";

const internshipSlice = createSlice({
  name: "internships",
  initialState: {
    list: [],
    applicants: {}, // store per internshipId
    loading: false,
    error: null,
  },
  reducers: {
    setInternships: (state, action) => {
      state.list = action.payload;
      state.error = null;
    },
    updateInternshipInState: (state, action) => {
      const updated = action.payload;
      const index = state.list.findIndex(
        (item) => item._id === updated._id
      );
      if (index !== -1) {
        state.list[index] = updated;
      }
    },
    setApplicants: (state, action) => {
      const { internshipId, applicants } = action.payload;
      state.applicants[internshipId] = applicants;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setInternships,
  updateInternshipInState,
  setApplicants,
  setLoading,
  setError,
} = internshipSlice.actions;

export default internshipSlice.reducer;
