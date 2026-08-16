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

export default axiosInstance;
