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

    updateUser(state, action) {
      if (action.payload.username)
        state.user.username = action.payload.username;
      if (action.payload.avatar) state.user.avatar = action.payload.avatar;
    },
  },
});

export const { login, logout, verifyUser, updateUser } = authSlice.actions;
export default authSlice.reducer;
