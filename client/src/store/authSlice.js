import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {},
  isAuthenticated: false,
  isVerified: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },

    logout(state, action) {
      state.user = null;
      state.isAuthenticated = false;
    },

    verifyUser(state) {
      state.isVerified = true;
    },
  },
});

export const { login, logout, verifyUser } = authSlice.actions;
export default authSlice.reducer;
