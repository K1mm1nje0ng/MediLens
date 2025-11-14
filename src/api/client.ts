import axios from 'axios';

// 백엔드 URL
export const BASE_URL = 'http://3.104.212.75';

// Axios 인스턴스 생성
const client = axios.create({
  baseURL: BASE_URL,
  // 타임아웃 설정
  timeout: 10000,
});

export default client;