import { apiConnector } from "../apiConnector";
import { aiEndpoints } from "../apis";

const { ASK_AI_API, ANALYZE_COMPLAINT_API } = aiEndpoints;

export async function askAiAssistant(prompt) {
  try {
    const response = await apiConnector("POST", ASK_AI_API, { prompt });
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  } catch (error) {
    // Extract Axios error response status if available
    const status = error?.response?.status;
    if (status === 503 || status === 429) {
      throw new Error("The AI assistant is currently busy. Please wait a moment and try again.");
    }
    console.error("ASK_AI_API ERROR: ", error);
    throw error;
  }
}


export async function analyzeComplaint(complaintText) {
  try {
    const response = await apiConnector("POST", ANALYZE_COMPLAINT_API, { complaintText });
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  } catch (error) {
    console.error("ANALYZE_COMPLAINT_API ERROR: ", error);
    throw error;
  }
}
