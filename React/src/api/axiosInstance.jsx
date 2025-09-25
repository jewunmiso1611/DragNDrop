import axios from 'axios';
import { errorHandler } from '../context/globalErrorHandler';

const instance = axios.create({
  baseURL: '/api',
   headers: {
    "Content-Type": "application/json",
  },
  withCredentials:true,
});

// ✅ 요청마다 로컬스토리지에서 토큰 가져와서 헤더에 붙이기
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response, // 성공 응답은 그대로 통과
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
