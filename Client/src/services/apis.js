const BASE_URL = import.meta.env.VITE_APP_BASE_URL || "http://localhost:4000/api/v1"

// AUTH ENDPOINTS
export const endpoints = {
  SIGNUP_API: BASE_URL + "/auth/signup",
  LOGIN_API: BASE_URL + "/auth/login",
}

// PROFILE ENDPOINTS
export const profileEndpoints = {
  GET_USER_DETAILS_API: BASE_URL + "/profile",
  UPDATE_PROFILE_API: BASE_URL + "/profile/update",
  UPDATE_DISPLAY_PICTURE_API: BASE_URL + "/profile/update-display-picture",
  DELETE_ACCOUNT_API: BASE_URL + "/profile/delete",
}

// NOTIFICATION ENDPOINTS
export const notificationEndpoints = {
  GET_NOTIFICATIONS_API:    BASE_URL + "/notification",
  GET_UNREAD_COUNT_API:     BASE_URL + "/notification/unread-count",
  MARK_ONE_READ_API:        BASE_URL + "/notification",   // + /:id/read
  MARK_ALL_READ_API:        BASE_URL + "/notification/read-all",
  DELETE_ONE_API:           BASE_URL + "/notification",   // + /:id
  DELETE_ALL_API:           BASE_URL + "/notification",
}

// COMPLAINT ENDPOINTS
export const complaintEndpoints = {
  GET_ALL_COMPLAINTS_API:       BASE_URL + "/complaint",
  GET_MY_COMPLAINTS_API:        BASE_URL + "/complaint/my",
  CREATE_COMPLAINT_API:         BASE_URL + "/complaint",
  GET_COMPLAINT_BY_ID_API:      BASE_URL + "/complaint",          // + /:id
  UPDATE_COMPLAINT_STATUS_API:  BASE_URL + "/complaint",          // + /:id/status
  RESOLVE_COMPLAINT_API:        BASE_URL + "/complaint",          // + /:id/resolve
  TOGGLE_UPVOTE_API:            BASE_URL + "/complaint",          // + /:id/upvote
  DELETE_COMPLAINT_API:         BASE_URL + "/complaint",          // + /:id
  GET_PUBLIC_STATS_API:         BASE_URL + "/complaint/stats",
  GET_RECENT_COMPLAINTS_API:    BASE_URL + "/complaint/public/recent",
}
// ADMIN ENDPOINTS
export const adminEndpoints = {
  GET_ALL_USERS_API:        BASE_URL + "/admin/users",
  GET_ADMIN_STATS_API:      BASE_URL + "/admin/stats",
  VERIFY_OFFICER_API:       BASE_URL + "/admin/verify-officer", // + /:officerId
}

// OFFICER ENDPOINTS
export const officerEndpoints = {
  GET_LEADERBOARD_API: BASE_URL + "/officer/leaderboard",
}

// CONTACT ENDPOINTS
export const contactEndpoints = {
  CONTACT_US_API: BASE_URL + "/contact/contact",
  GET_ALL_CONTACTS_API: BASE_URL + "/contact/all-contacts",
}

// REVIEW ENDPOINTS
export const reviewEndpoints = {
  CREATE_REVIEW_API: BASE_URL + "/review",
  GET_ALL_REVIEWS_API: BASE_URL + "/review",
}
