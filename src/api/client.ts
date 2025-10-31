import axios from 'axios';

// 백엔드 URL (pillApi.ts에서 이 주소를 가져다 쓸 수 있도록 export)
export const BASE_URL = 'http://54.206.119.43';

// Axios 인스턴스 생성
const client = axios.create({
  baseURL: BASE_URL,
  // 타임아웃 설정
  timeout: 10000,
  // (참고) POST, GET마다 헤더가 다르므로 공통 헤더는 제거
});

export default client;