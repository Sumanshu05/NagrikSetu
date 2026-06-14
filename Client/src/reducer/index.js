import { combineReducers } from "@reduxjs/toolkit"

import authReducer from "../slices/authSlice"
import profileReducer from "../slices/profileSlice"
import notificationReducer from "../slices/notificationSlice"

const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  notification: notificationReducer,
})

export default rootReducer
