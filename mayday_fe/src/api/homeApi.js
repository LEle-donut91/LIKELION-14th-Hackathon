import axiosInstance from "./axiosInstance";
import axiosRequests from "./axiosRequests";

/**
 * 홈 화면 요약 데이터 조회 API
 * @param {Object} params
 * @param {number} params.year - 조회 연도
 * @param {number} params.month - 기준 월
 */
export const getHomeSummary = async ({ year, month }) => {
  try {
    const response = await axiosInstance.get(axiosRequests.getHome, {
      params: {
        year,
        month,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        alert(error.response.data.message || "인증이 필요합니다. 다시 로그인해주세요.");
      } else {
        alert(error.response.data.message || "데이터를 불러오는 중 오류가 발생했습니다.");
      }
    } else {
      console.error("네트워크 에러:", error.message);
    }
    throw error;
  }
};
