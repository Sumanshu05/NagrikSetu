import { apiConnector } from "../apiConnector";
import { reviewEndpoints } from "../apis";

const { CREATE_REVIEW_API, GET_ALL_REVIEWS_API } = reviewEndpoints;

export function createReview(token, data) {
  return async () => {
    try {
      const response = await apiConnector("POST", CREATE_REVIEW_API, data, {
        Authorization: `Bearer ${token}`,
      });
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      return response.data;
    } catch (error) {
      console.log("CREATE_REVIEW_API ERROR: ", error);
      return null;
    }
  };
}

export function getAllReviews() {
  return async () => {
    try {
      const response = await apiConnector("GET", GET_ALL_REVIEWS_API);
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      return response.data.data;
    } catch (error) {
      console.log("GET_ALL_REVIEWS_API ERROR: ", error);
      return [];
    }
  };
}
