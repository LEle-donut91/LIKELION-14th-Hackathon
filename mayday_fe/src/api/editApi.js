import axiosInstance from "./axiosInstance";
import axiosRequests from "./axiosRequests";

/**
 * 수입 상세 기록 조회
 */
export const getIncomeDetail = async (incomeId) => {
  try {
    const response = await axiosInstance.get(
      axiosRequests.getIncomes(incomeId),
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw new Error("수입 상세 기록을 불러오는 중 오류가 발생했습니다.");
  }
};

/**
 * 수입 기록 수정
 */
export const updateIncomeDetail = async (incomeId, payload) => {
  try {
    const response = await axiosInstance.patch(
      axiosRequests.patchIncomes(incomeId),
      payload,
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw new Error("수입 기록 수정 중 오류가 발생했습니다.");
  }
};

/**
 * 수입 기록 삭제
 */
export const deleteIncomeDetail = async (incomeId) => {
  try {
    const response = await axiosInstance.delete(
      axiosRequests.deleteIncomes(incomeId),
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw new Error("수입 기록 삭제 중 오류가 발생했습니다.");
  }
};

/**
 * 지출 상세 기록 조회
 */
export const getExpenseDetail = async (expenseId) => {
  try {
    const response = await axiosInstance.get(
      axiosRequests.getExpense(expenseId),
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw new Error("지출 상세 기록을 불러오는 중 오류가 발생했습니다.");
  }
};

/**
 * 지출 기록 수정
 */
export const updateExpenseDetail = async (expenseId, payload) => {
  try {
    const response = await axiosInstance.patch(
      axiosRequests.patchExpense(expenseId),
      payload,
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw new Error("지출 기록 수정 중 오류가 발생했습니다.");
  }
};

/**
 * 지출 기록 삭제
 */
export const deleteExpenseDetail = async (expenseId) => {
  try {
    const response = await axiosInstance.delete(
      axiosRequests.deleteExpense(expenseId),
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw new Error("지출 기록 삭제 중 오류가 발생했습니다.");
  }
};
