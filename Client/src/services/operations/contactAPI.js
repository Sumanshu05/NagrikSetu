import { apiConnector } from "../apiConnector";
import { contactEndpoints } from "../apis";

const { CONTACT_US_API, GET_ALL_CONTACTS_API } = contactEndpoints;

export function contactUs(data) {
  return async () => {
    try {
      const response = await apiConnector("POST", CONTACT_US_API, data);
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      return response.data;
    } catch (error) {
      console.log("CONTACT_US_API ERROR: ", error);
      return null;
    }
  };
}

export function getAllContacts(token) {
  return async () => {
    try {
      const response = await apiConnector("GET", GET_ALL_CONTACTS_API, null, {
        Authorization: `Bearer ${token}`,
      });
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      return response.data.data;
    } catch (error) {
      console.log("GET_ALL_CONTACTS_API ERROR: ", error);
      return [];
    }
  };
}
