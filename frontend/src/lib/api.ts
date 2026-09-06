import axios from "axios";
import { DashboardStats } from "@/types";

const API_URL = 'http://localhost:3000'


export const fetchCommentStats = async (): Promise<DashboardStats> => {
    const res = await axios.get(`${API_URL}/stats`);

    const data = res.data;
    console.log("The data is : ",data)
    return {
        totalComments: data.totalCount,
        blockedComments: data.blockedCount,
        totalLast5: data.totalLast5,
        blockedLast5: data.blockedLast5,
        blockedPercentage: Math.round(data.blockedPercentage),
        latestBlocked: data.latestBlocked,
    };
};