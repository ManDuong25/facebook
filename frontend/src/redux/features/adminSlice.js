import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  adminUser: null,
  isAdminAuthenticated: false,
  dashboardStats: null,
  loading: false,
  error: null
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setAdminUser: (state, action) => {
      state.adminUser = action.payload;
      state.isAdminAuthenticated = true;
    },
    setDashboardStats: (state, action) => {
      state.dashboardStats = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    adminLogout: (state) => {
      state.adminUser = null;
      state.isAdminAuthenticated = false;
      state.dashboardStats = null;
      localStorage.removeItem('adminUser');
    }
  }
});

export const {
  setAdminUser,
  setDashboardStats,
  setLoading,
  setError,
  adminLogout
} = adminSlice.actions;

export default adminSlice.reducer;
