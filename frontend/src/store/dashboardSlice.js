import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/api";

/*
 🔥 FETCH DASHBOARD (ROLE FROM BACKEND)
*/
export const fetchDashboard = createAsyncThunk(
  "dashboard/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/dashboard", {
        withCredentials: true,
      });

      // ✅ Safe access
      return res?.data?.data || null;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load dashboard";

      return rejectWithValue(message);
    }
  }
);

/*
 🔥 SLICE
*/
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    data: null,
    loading: false,
    error: null,
    lastFetched: null, // ✅ useful for caching / refresh logic
  },

  reducers: {
    clearDashboard: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
      state.lastFetched = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ⏳ LOADING
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // ✅ SUCCESS
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.lastFetched = Date.now();
      })

      // ❌ ERROR
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export const { clearDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;