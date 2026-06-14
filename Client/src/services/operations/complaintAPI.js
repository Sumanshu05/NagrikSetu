import { toast } from "react-hot-toast"
import { apiConnector } from "../apiConnector"
import { complaintEndpoints } from "../apis"

const {
  GET_ALL_COMPLAINTS_API,
  GET_MY_COMPLAINTS_API,
  CREATE_COMPLAINT_API,
  GET_COMPLAINT_BY_ID_API,
  UPDATE_COMPLAINT_STATUS_API,
  RESOLVE_COMPLAINT_API,
  TOGGLE_UPVOTE_API,
  DELETE_COMPLAINT_API,
  GET_PUBLIC_STATS_API,
  GET_RECENT_COMPLAINTS_API,
} = complaintEndpoints

// ─── Get All Complaints (officer) ─────────────────────────────────────────────

export const getAllComplaints = async (token, filters = {}) => {
  const toastId = toast.loading("Loading...")
  let result = { data: [], total: 0 }
  try {
    let url = GET_ALL_COMPLAINTS_API;
    const queryParams = new URLSearchParams(filters).toString();
    if (queryParams) {
      url += `?${queryParams}`;
    }

    const response = await apiConnector("GET", url, null, {
      Authorization: `Bearer ${token}`,
    })
    if (!response?.data?.success) throw new Error(response.data.message)
    result = response?.data || { data: [], total: 0 }
  } catch (error) {
    console.log("GET_ALL_COMPLAINTS_API ERROR:", error)
    toast.error(error.response?.data?.message || "Could not fetch complaints")
  }
  toast.dismiss(toastId)
  return result
}

// ─── Get My Complaints ────────────────────────────────────────────────────────

export const getMyComplaints = async (token) => {
  const toastId = toast.loading("Loading...")
  let result = []
  try {
    const response = await apiConnector("GET", GET_MY_COMPLAINTS_API, null, {
      Authorization: `Bearer ${token}`,
    })
    if (!response?.data?.success) throw new Error(response.data.message)
    result = response?.data?.data || []
  } catch (error) {
    console.log("GET_MY_COMPLAINTS_API ERROR:", error)
    toast.error(error.response?.data?.message || "Could not fetch complaints")
  }
  toast.dismiss(toastId)
  return result
}

// ─── Create Complaint ─────────────────────────────────────────────────────────

export const createComplaint = async (data, file, token) => {
  const toastId = toast.loading("Submitting complaint...")
  let result = null
  try {
    const formData = new FormData()
    formData.append("title", data.title)
    formData.append("category", data.category)
    formData.append("description", data.description)
    // Mock ward + coordinates until a map picker is added
    formData.append("wardId", "652c1e4b8f1b2c3d4e5f6a7b")
    formData.append("location", JSON.stringify({
      coordinates: [77.5946, 12.9716],
      landmark: data.location || "Unknown",
    }))
    if (file) formData.append("photos", file)

    const response = await apiConnector("POST", CREATE_COMPLAINT_API, formData, {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    })
    if (!response?.data?.success) throw new Error(response.data.message)
    toast.success("Complaint submitted successfully!")
    result = response?.data?.data
  } catch (error) {
    console.log("CREATE_COMPLAINT_API ERROR:", error)
    toast.error(error.response?.data?.message || "Failed to submit complaint")
  }
  toast.dismiss(toastId)
  return result
}

// ─── Get Complaint by ID ──────────────────────────────────────────────────────

export const getComplaintById = async (id, token) => {
  let result = null
  try {
    const response = await apiConnector(
      "GET",
      `${GET_COMPLAINT_BY_ID_API}/${id}`,
      null,
      { Authorization: `Bearer ${token}` }
    )
    if (!response?.data?.success) throw new Error(response.data.message)
    result = response?.data?.data
  } catch (error) {
    console.log("GET_COMPLAINT_BY_ID_API ERROR:", error)
    toast.error(error.response?.data?.message || "Could not fetch complaint details")
  }
  return result
}

// ─── Update Complaint Status (officer) ───────────────────────────────────────

export const updateComplaintStatus = async (id, status, note, token) => {
  const toastId = toast.loading("Updating status...")
  let result = null
  try {
    const response = await apiConnector(
      "PATCH",
      `${UPDATE_COMPLAINT_STATUS_API}/${id}/status`,
      { status, note },
      { Authorization: `Bearer ${token}` }
    )
    if (!response?.data?.success) throw new Error(response.data.message)
    toast.success("Status updated successfully")
    result = response?.data?.data
  } catch (error) {
    console.log("UPDATE_COMPLAINT_STATUS_API ERROR:", error)
    toast.error(error.response?.data?.message || "Failed to update status")
  }
  toast.dismiss(toastId)
  return result
}

// ─── Resolve Complaint (officer, requires closing photo) ─────────────────────

export const resolveComplaint = async (id, note, closingPhotoFile, token) => {
  const toastId = toast.loading("Resolving complaint...")
  let result = null
  try {
    const formData = new FormData()
    if (note) formData.append("note", note)
    formData.append("closingPhoto", closingPhotoFile)

    const response = await apiConnector(
      "PATCH",
      `${RESOLVE_COMPLAINT_API}/${id}/resolve`,
      formData,
      {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      }
    )
    if (!response?.data?.success) throw new Error(response.data.message)
    toast.success("Complaint resolved!")
    result = response?.data?.data
  } catch (error) {
    console.log("RESOLVE_COMPLAINT_API ERROR:", error)
    toast.error(error.response?.data?.message || "Failed to resolve complaint")
  }
  toast.dismiss(toastId)
  return result
}

// ─── Toggle Upvote (citizen) ──────────────────────────────────────────────────

export const toggleUpvote = async (complaintId, token) => {
  let result = null
  try {
    const response = await apiConnector(
      "POST",
      `${TOGGLE_UPVOTE_API}/${complaintId}/upvote`,
      null,
      { Authorization: `Bearer ${token}` }
    )
    if (!response?.data?.success) throw new Error(response.data.message)
    result = response?.data
  } catch (error) {
    console.log("TOGGLE_UPVOTE_API ERROR:", error)
    toast.error(error.response?.data?.message || "Could not upvote")
  }
  return result
}

// ─── Delete Complaint (citizen/admin) ─────────────────────────────────────────

export const deleteComplaint = async (id, token) => {
  const toastId = toast.loading("Deleting complaint...")
  let success = false
  try {
    const response = await apiConnector(
      "DELETE",
      `${DELETE_COMPLAINT_API}/${id}`,
      null,
      { Authorization: `Bearer ${token}` }
    )
    if (!response?.data?.success) throw new Error(response.data.message)
    toast.success("Complaint deleted successfully")
    success = true
  } catch (error) {
    console.log("DELETE_COMPLAINT_API ERROR:", error)
    toast.error(error.response?.data?.message || "Failed to delete complaint")
  }
  toast.dismiss(toastId)
  return success
}

// ─── Get Public Stats ─────────────────────────────────────────────────────────

export const getPublicStats = async () => {
  let result = []
  try {
    const response = await apiConnector("GET", GET_PUBLIC_STATS_API)
    if (!response?.data?.success) throw new Error(response.data.message)
    result = response?.data?.data || []
  } catch (error) {
    console.log("GET_PUBLIC_STATS_API ERROR:", error)
  }
  return result
}

// ─── Get Recent Complaints ────────────────────────────────────────────────────

export const getRecentComplaints = async () => {
  let result = []
  try {
    const response = await apiConnector("GET", GET_RECENT_COMPLAINTS_API)
    if (!response?.data?.success) throw new Error(response.data.message)
    result = response?.data?.data || []
  } catch (error) {
    console.log("GET_RECENT_COMPLAINTS_API ERROR:", error)
  }
  return result
}

