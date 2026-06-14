import { toast } from "react-hot-toast"
import { apiConnector } from "../apiConnector"
import { adminEndpoints } from "../apis"

const {
  GET_ALL_USERS_API,
  GET_ADMIN_STATS_API,
  VERIFY_OFFICER_API
} = adminEndpoints

export const getAdminStats = async (token) => {
  let result = null
  try {
    const response = await apiConnector("GET", GET_ADMIN_STATS_API, null, {
      Authorization: `Bearer ${token}`,
    })
    if (!response?.data?.success) throw new Error(response.data.message)
    result = response?.data?.data
  } catch (error) {
    console.log("GET_ADMIN_STATS_API ERROR:", error)
  }
  return result
}

export const getAllUsers = async (token, filters = {}) => {
  let result = []
  try {
    const queryParams = new URLSearchParams(filters).toString()
    const url = queryParams ? `${GET_ALL_USERS_API}?${queryParams}` : GET_ALL_USERS_API

    const response = await apiConnector("GET", url, null, {
      Authorization: `Bearer ${token}`,
    })
    if (!response?.data?.success) throw new Error(response.data.message)
    result = response?.data?.data || []
  } catch (error) {
    console.log("GET_ALL_USERS_API ERROR:", error)
  }
  return result
}

export const verifyOfficer = async (officerId, token) => {
  const toastId = toast.loading("Verifying officer...")
  let success = false
  try {
    const response = await apiConnector(
      "PATCH",
      `${VERIFY_OFFICER_API}/${officerId}`,
      null,
      { Authorization: `Bearer ${token}` }
    )
    if (!response?.data?.success) throw new Error(response.data.message)
    toast.success("Officer verified successfully")
    success = true
  } catch (error) {
    console.log("VERIFY_OFFICER_API ERROR:", error)
    toast.error(error.response?.data?.message || "Failed to verify officer")
  }
  toast.dismiss(toastId)
  return success
}
