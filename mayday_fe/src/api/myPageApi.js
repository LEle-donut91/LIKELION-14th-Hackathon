import axiosInstance from "./axiosInstance";
import axiosRequests from "./axiosRequests";

/**
 * 마이페이지 요약 정보 조회 및 데이터 가공
 * @param {number|string} [year] - 요약 기준 연도
 */
export const getMyPageSummary = async (year) => {
  try {
    const response = await axiosInstance.get(axiosRequests.getMyPage, {
      params: year ? { year } : {},
    });

    const data = response.data?.data;

    if (!data) {
      throw new Error("요약 데이터가 존재하지 않습니다.");
    }

    // 화면 표출에 맞춘 데이터 가공을 API 파일에서 모아서 처리
    return {
      email: data.email || "-",
      recordedCount: data.recordedCount ?? 0,
      qualifiedEvidenceCount: data.qualifiedEvidenceCount ?? 0,

      // 원 단위 금액을 만 원 단위로 전환 (예: 4,320,000 -> 432)
      recognizedExpenseTenThousand: Math.floor((data.recognizedExpense ?? 0) / 10000),

      taxDDay: data.taxDDay,
      taxDueDate: data.taxDueDate,
    };
  } catch (error) {
    console.error("마이페이지 요약 정보 조회 실패:", error);
    throw error;
  }
};

/**
 * 로그아웃 API 요청
 */
export const postLogout = async () => {
  try {
    const response = await axiosInstance.post(axiosRequests.logout);
    return response.data;
  } catch (error) {
    console.error("로그아웃 API 요청 실패:", error);
    throw error;
  }
};

/**
 * 회원 탈퇴 API 요청
 */
export const deleteUser = async () => {
  try {
    // axios.delete는 두 번째 인자에 { data: payload } 형태로 body를 전달
    const response = await axiosInstance.delete(axiosRequests.deleteUser, {
      data: {
        confirmText: "탈퇴합니다",
      },
    });
    return response.data;
  } catch (error) {
    console.error("회원 탈퇴 API 요청 실패:", error);
    throw error;
  }
};
