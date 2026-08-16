// src/api/exportApi.js
import axiosInstance from "./axiosInstance";
import axiosRequests from "./axiosRequests";

/**
 * 내보내기 미리보기 데이터 및 요약 조회
 * @param {number|string} year - 내보낼 연도 (필수)
 */
export const getExportPreview = async (year) => {
  try {
    const response = await axiosInstance.get(axiosRequests.getExport, {
      params: { year },
    });
    return response.data;
  } catch (error) {
    // 400 에러 등 API 오류 응답 처리
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw new Error("서버와의 통신에 실패했습니다.");
  }
};
