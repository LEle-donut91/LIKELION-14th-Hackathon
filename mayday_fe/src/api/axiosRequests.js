/**
 * [API 엔드포인트 URL 관리]
 * - 역할: 프로젝트 내에서 사용하는 백엔드 API 엔드포인트 URL 일괄 관리
 * - 사용처: historyApi.js, userApi.js 등 실제 axios 요청을 보낼 개별 API 파일
 * - 주요 기능: 
 *   1. 엔드포인트 중앙 집중 관리
 *   2. 유지 보수 용이 (엔드포인트 URL이 변경되더라도 여기서만 수정하면 됨)
 */

const axiosRequests = {
  // 고정 경로 + Query Parameter
  login: `/auth/login`,
  demoLogin: `/auth/demo-login`,
  signup: `/auth/signup`,
  logout: `/auth/logout`,
  deleteUser: `/users/me`,
  getMyPage: `/users/me/summary`,
  getHome: `/home/summary`,
  getLedgerYears: `/ledger/years`,
  getLedgerList: `/ledger`,
  getLedgerSearch: `/ledger/search`,
  getExport: `/ledger/export`,

  // Path Parameter
  getExpense: (expenseId) => `/expenses/${expenseId}`,
  patchExpense: (expenseId) => `/expenses/${expenseId}`,
  deleteExpense: (expenseId) => `/expenses/${expenseId}`,
  getIncomes: (incomeId) => `/incomes/${incomeId}`,
  patchIncomes: (incomeId) => `/incomes/${incomeId}`,
  deleteIncomes: (incomeId) => `/incomes/${incomeId}`,
};

export default axiosRequests;
