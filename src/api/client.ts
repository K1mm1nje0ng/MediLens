import axios from 'axios';
// 백엔드 URL 
const BASE_URL = 'https://your.backend-api.com/api/v1';

// Axios 인스턴스 생성
const client = axios.create({
  baseURL: BASE_URL,
  // 타임아웃 설정
  timeout: 10000,
  // 공통 헤더 등을 추가
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});

// 요청 인터셉터 설정
// client.interceptors.request.use(
//   (config) => {
//     // const token = '...some logic to get token...';
//     // if (token) {
//     //   config.headers.Authorization = `Bearer ${token}`;
//     // }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   },
// );

export default client;