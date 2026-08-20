/*
 * [공통 Axios 인스턴스]
 * - 역할: API 요청 공통 설정 및 인증 토큰 자동 주입
 * - 사용처: historyApi.js 등 개별 API 파일에서 import하여 사용
 * - 주요 기능: BaseURL 설정, LocalStorage의 accessToken을 Bearer 토큰으로 헤더 주입
 */
import axios from "axios";

// env에 등록된 baseURL 연결
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

// 요청 인터셉터: Bearer 토큰만 공통으로 주입
axiosInstance.interceptors.request.use(
  (config) => {
    // 이 부분은 로그인 API 연동 로직 작성 후 수정해주시면 감사드리겠습니다.
    // 일단 지금은 로그인 시 LocalStorage에 accessToken이 저장된다고 가정하고 작성했습니다.
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor (401 에러 통합 처리)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 Unauthorized 에러 발생 시 처리
    if (error.response && error.response.status === 401) {
      alert("인증이 필요합니다. 다시 로그인해주세요.");

      // 1. localStorage에서 토큰 삭제
      localStorage.removeItem('accessToken');

      // 2. 로그인 페이지로 강제 이동 (SPA 리디렉션)
      // window.location.href를 사용하면 전역적으로 확실하게 리디렉션
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
