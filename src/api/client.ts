import axios from 'axios';

// 백엔드 URL (pillApi.ts에서 이 주소를 가져다 쓸 수 있도록 export)
export const BASE_URL = 'http://3.104.212.75';

// Axios 인스턴스 생성 (POST /predict 전용)
const client = axios.create({
  baseURL: BASE_URL,
  // 타임아웃 설정
  timeout: 10000,
  // (참고) GET 요청은 fetch를 사용할 것이므로, 공통 헤더는 POST에서 개별 설정
});

export default client;