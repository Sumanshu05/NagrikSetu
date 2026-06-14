import { toast } from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { officerEndpoints } from "../apis";

const { GET_LEADERBOARD_API } = officerEndpoints;

export const getOfficerLeaderboard = async (token) => {
    let result = [];
    try {
        const response = await apiConnector("GET", GET_LEADERBOARD_API, null, {
            Authorization: `Bearer ${token}`,
        });

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        result = response.data.data;
    } catch (error) {
        console.log("GET_LEADERBOARD_API ERROR............", error);
        // toast.error(error.message); // Silent error for leaderboard is usually better
    }
    return result;
};
