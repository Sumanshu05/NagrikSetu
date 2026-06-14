import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  unreadCount: 0,
  loading: false,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setUnreadCount(state, action) {
      state.unreadCount = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const { setUnreadCount, setLoading } = notificationSlice.actions;
export default notificationSlice.reducer;
