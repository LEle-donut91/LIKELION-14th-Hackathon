import axiosInstance from "./axiosInstance";
import axiosRequests from "./axiosRequests";

export const historyApi = {
  // 1. 보유 연도 목록 조회 GET
  getLedgerYears: async () => {
    const response = await axiosInstance.get(axiosRequests.getLedgerYears);
    return response.data;
  },

  // 2. 연도별 기록 전체 조회 GET
  getLedgerList: async (year) => {
    const response = await axiosInstance.get(axiosRequests.getLedgerList, {
      params: { year },
    });
    return response.data;
  },

  // 3. 기록 검색 GET
  getLedgerSearch: async (year, keyword) => {
    const response = await axiosInstance.get(axiosRequests.getLedgerSearch, {
      params: { year, keyword },
    });
    return response.data;
  },
};
