import { toast } from "react-hot-toast"
import { apiConnector } from "../apiConnector"
import { notificationEndpoints, complaintEndpoints } from "../apis"
import { setUnreadCount } from "../../slices/notificationSlice"

const {
  GET_NOTIFICATIONS_API,
  MARK_ONE_READ_API,
  MARK_ALL_READ_API,
  DELETE_ONE_API,
  DELETE_ALL_API,
} = notificationEndpoints

const { TOGGLE_UPVOTE_API } = complaintEndpoints

// ─── Get My Notifications ─────────────────────────────────────────────────────

export function fetchMyNotifications(token, page = 1, limit = 30) {
  return async (dispatch) => {
    let result = { notifications: [], unreadCount: 0, pagination: {} }
    try {
      const response = await apiConnector(
        "GET",
        `${GET_NOTIFICATIONS_API}?page=${page}&limit=${limit}`,
        null,
        { Authorization: `Bearer ${token}` }
      )
      if (!response?.data?.success) throw new Error(response.data.message)
      
      result = {
        notifications: response.data.notifications || [],
        unreadCount:   response.data.unreadCount   || 0,
        pagination:    response.data.pagination    || {},
      }
      
      dispatch(setUnreadCount(result.unreadCount))
    } catch (error) {
      console.log("GET_NOTIFICATIONS_API ERROR:", error)
    }
    return result
  }
}

// ─── Mark One as Read ─────────────────────────────────────────────────────────

export function markOneAsRead(notificationId, token) {
  return async (dispatch) => {
    try {
      const response = await apiConnector(
        "PATCH",
        `${MARK_ONE_READ_API}/${notificationId}/read`,
        null,
        { Authorization: `Bearer ${token}` }
      )
      if (!response?.data?.success) throw new Error(response.data.message)
      
      // We'll let the component handle re-fetching for now
      return true
    } catch (error) {
      console.log("MARK_ONE_READ_API ERROR:", error)
      return false
    }
  }
}

// ─── Mark All as Read ─────────────────────────────────────────────────────────

export function markAllAsRead(token) {
  return async (dispatch) => {
    try {
      const response = await apiConnector(
        "PATCH",
        MARK_ALL_READ_API,
        null,
        { Authorization: `Bearer ${token}` }
      )
      if (!response?.data?.success) throw new Error(response.data.message)
      toast.success("All notifications marked as read")
      dispatch(setUnreadCount(0))
      return true
    } catch (error) {
      console.log("MARK_ALL_READ_API ERROR:", error)
      toast.error("Could not mark notifications as read")
      return false
    }
  }
}

// Keeping these as plain exports if they don't need to update state directly or if state is updated via re-fetch
export const deleteOneNotification = async (notificationId, token) => {
  try {
    const response = await apiConnector(
      "DELETE",
      `${DELETE_ONE_API}/${notificationId}`,
      null,
      { Authorization: `Bearer ${token}` }
    )
    if (!response?.data?.success) throw new Error(response.data.message)
    return true
  } catch (error) {
    console.log("DELETE_ONE_NOTIFICATION ERROR:", error)
    toast.error("Could not delete notification")
    return false
  }
}

export const clearAllNotifications = async (token) => {
  try {
    const response = await apiConnector(
      "DELETE",
      DELETE_ALL_API,
      null,
      { Authorization: `Bearer ${token}` }
    )
    if (!response?.data?.success) throw new Error(response.data.message)
    toast.success("All notifications cleared")
    return true
  } catch (error) {
    console.log("DELETE_ALL_NOTIFICATIONS ERROR:", error)
    toast.error("Could not clear notifications")
    return false
  }
}

export const getUpvoters = async (complaintId, token) => {
  let result = null
  try {
    const response = await apiConnector(
      "GET",
      `${TOGGLE_UPVOTE_API}/${complaintId}/upvoters`,
      null,
      { Authorization: `Bearer ${token}` }
    )
    if (!response?.data?.success) throw new Error(response.data.message)
    result = {
      upvoters:    response.data.upvoters    || [],
      upVoteCount: response.data.upVoteCount || 0,
    }
  } catch (error) {
    console.log("GET_UPVOTERS ERROR:", error)
    toast.error("Could not fetch upvoters")
  }
  return result
}

// Backward compatibility or for use in components that don't need dispatch
export const getMyNotifications = async (token, page = 1, limit = 30) => {
  let result = { notifications: [], unreadCount: 0, pagination: {} }
  try {
    const response = await apiConnector(
      "GET",
      `${GET_NOTIFICATIONS_API}?page=${page}&limit=${limit}`,
      null,
      { Authorization: `Bearer ${token}` }
    )
    if (!response?.data?.success) throw new Error(response.data.message)
    result = {
      notifications: response.data.notifications || [],
      unreadCount:   response.data.unreadCount   || 0,
      pagination:    response.data.pagination    || {},
    }
  } catch (error) {
    console.log("GET_NOTIFICATIONS_API ERROR:", error)
  }
  return result
}
