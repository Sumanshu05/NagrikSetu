import { toast } from "react-hot-toast"
import { setUser } from "../../slices/profileSlice"
import { apiConnector } from "../apiConnector"
import { profileEndpoints } from "../apis"

const { UPDATE_PROFILE_API, UPDATE_DISPLAY_PICTURE_API, DELETE_ACCOUNT_API } = profileEndpoints

export function deleteProfile(token, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Deleting Account...")
    try {
      const response = await apiConnector("DELETE", DELETE_ACCOUNT_API, null, {
        Authorization: `Bearer ${token}`,
      })

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      toast.success("Account Deleted Successfully")
      dispatch(setUser(null))
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      navigate("/")
    } catch (error) {
      console.log("DELETE_PROFILE_API ERROR:", error)
      toast.error("Could Not Delete Account")
    }
    toast.dismiss(toastId)
  }
}

export function updateDisplayPicture(token, formData) {
  return async (dispatch) => {
    const toastId = toast.loading("Uploading...")
    try {
      const response = await apiConnector(
        "PUT",
        UPDATE_DISPLAY_PICTURE_API,
        formData,
        {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        }
      )
      console.log("UPDATE_DISPLAY_PICTURE_API RESPONSE:", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      toast.success("Display Picture Updated Successfully")
      dispatch(setUser(response.data.data))
    } catch (error) {
      console.log("UPDATE_DISPLAY_PICTURE_API ERROR:", error)
      toast.error("Could Not Update Display Picture")
    }
    toast.dismiss(toastId)
  }
}

export function updateProfile(token, formData) {
  return async (dispatch) => {
    const toastId = toast.loading("Updating Profile...")
    let success = false;
    try {
      const response = await apiConnector("PUT", UPDATE_PROFILE_API, formData, {
        Authorization: `Bearer ${token}`,
      })
      console.log("UPDATE_PROFILE_API RESPONSE:", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      const updatedUserDetails = response.data.updatedUserDetails || response.data.data || response.data.user;

      if (updatedUserDetails) {
        dispatch(setUser(updatedUserDetails))
      }
      
      toast.success("Profile Updated Successfully")
      success = true;
    } catch (error) {
      console.log("UPDATE_PROFILE_API ERROR:", error)
      toast.error(error.response?.data?.message || "Could Not Update Profile")
    }
    toast.dismiss(toastId)
    return success;
  }
}
