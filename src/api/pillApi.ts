// axios 클라이언트 및 BASE_URL 임포트
import client, { BASE_URL } from './client';
// 타입 임포트
import { PillResultData, PillSearchSummary } from '../types/navigation';
// react-native-image-picker의 Asset 타입 (PillSearchScreen에서 필요)
import { Asset } from 'react-native-image-picker';

// -----------------------------------------------------------------
// 1. 실제 API: 이미지 분석 요청 (POST /predict)
// -----------------------------------------------------------------
export const postPredict = async (
  imageFile: Asset,
): Promise<{ task_id: string }> => {
  const formData = new FormData();
  formData.append('file', {
    uri: imageFile.uri,
    type: imageFile.type || 'image/jpeg',
    name: imageFile.fileName || 'image.jpg',
  });

  const response = await client.post('/predict', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data; // { task_id: "..." }
};

// -----------------------------------------------------------------
// 2. 실제 API: 작업 상태 조회 (GET /status/:taskId)
// -----------------------------------------------------------------
export const getStatus = async (
  taskId: string,
): Promise<{ task_id: string; status: string }> => {
  const response = await client.get(`/status/${taskId}`);
  return response.data; // { task_id: "...", status: "PENDING" | "SUCCESS" }
};

// -----------------------------------------------------------------
// 3. 실제 API: 작업 결과 조회 (GET /result/:taskId)
// (2D 배열 (PillSearchSummary[][]) 반환)
// -----------------------------------------------------------------
export const getResult = async (taskId: string): Promise<PillSearchSummary[][]> => {
  const response = await client.get(`/result/${taskId}`);
  
  // API 응답 (2D 배열): { pill_results: [ [알약1 후보들], [알약2 후보들] ] }
  const pillResultGroups = response.data.pill_results;

  // 2D 배열을 순회하며 'PillSearchSummary' 타입으로 매핑
  return pillResultGroups.map((group: any[]) => {
    // 1D 배열 (알약 1의 후보들)
    return group.map((item: any) => ({
      id: item.code, // code -> id
      pillName: item.pill_info, // pill_info -> pillName
      imageUrl: `${BASE_URL}/image-proxy?url=${encodeURIComponent(item.image)}`,
    }));
  });
};

// -----------------------------------------------------------------
// 4. 실제 API: 정보 기반 검색 (GET /search)
// (1D 배열 (PillSearchSummary[]) 반환)
// -----------------------------------------------------------------
export const postSearch = async (
  searchParams: any,
): Promise<PillSearchSummary[]> => {
  const response = await client.get('/search', {
    params: searchParams,
  });

  // API 응답 (1D 배열): { pill_results: [ 후보1, 후보2, ... ] }
  const pillResults = response.data.pill_results;

  // 1D 배열을 'PillSearchSummary' 타입으로 매핑
  return pillResults.map((item: any) => ({
    id: item.code,
    pillName: item.pill_info,
    imageUrl: `${BASE_URL}/image-proxy?url=${encodeURIComponent(item.image)}`,
  }));
};

// -----------------------------------------------------------------
// 5. 실제 API: 알약 상세 정보 조회 (GET /detail) - (최종 명세 반영)
// -----------------------------------------------------------------
export const getDetail = async (
  pillId: string | number, // 'code'가 전달됨
): Promise<PillResultData> => {
  const response = await client.get('/detail', {
    params: { code: pillId },
  });

  const data = response.data; // { "제품명": "...", "업체명": "...", ... }

  // 한글 키(API)를 영어 키(App)로 매핑 (최종 명세 기준)
  return {
    // --- API 명세서에 있는 필드 ---
    id: pillId.toString(),
    pillName: data['제품명'] || '',
    company: data['업체명'] || '',
    effects: data['효능'] || '',
    usage: data['사용법'] || '',
    warnings: data['주의사항'] || '',
    warningAlert: data['주의사항경고'] || '', // (제거됨 -> 다시 추가)
    sideEffects: data['부작용'] || '',
    storage: data['보관법'] || '',
    imageUrl: data['이미지'] 
      ? `${BASE_URL}/image-proxy?url=${encodeURIComponent(data['이미지'])}`
      : '',

    // --- (신규) 최종 명세 필드 ---
    sizeLong: data['장축'] || '',
    sizeShort: data['단축'] || '',
    sizeThick: data['두께'] || '',
    imprint1: data['각인_1'] || '', // 각인_1 -> imprint1
    imprint2: data['각인_2'] || '', // 각인_2 -> imprint2
    color1: data['색_1'] || '', // 색_1 -> color1
    color2: data['색_2'] || '', // 색_2 -> color2
    shape: data['모양'] || '', // 모양 -> shape
    form: data['형태'] || '', // 형태 -> form

    // --- (제거됨) ---
    // description: data['성상'] || '',
  };
};

// -----------------------------------------------------------------
// 6. 실제 API: 최근 검색 기록 (GET /recent)
// -----------------------------------------------------------------
export const getRecent = async (): Promise<PillSearchSummary[]> => {
  const response = await client.get('/recent');

  const pillResults = response.data.pill_results;

  // 1D 배열을 'PillSearchSummary' 타입으로 매핑
  return pillResults.map((item: any) => ({
    id: item.code,
    pillName: item.pill_info,
    imageUrl: `${BASE_URL}/image-proxy?url=${encodeURIComponent(item.image)}`,
  }));
};