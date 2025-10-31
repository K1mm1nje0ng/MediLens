// axios 클라이언트 및 BASE_URL 임포트
import client, { BASE_URL } from './client'; // BASE_URL을 가져오기 위해 import
// 타입 임포트
import { PillResultData, PillSearchSummary } from '../types/navigation';
// react-native-image-picker의 Asset 타입 (PillSearchScreen에서 필요)
import { Asset } from 'react-native-image-picker';

// -----------------------------------------------------------------
// 1. 실제 API: 이미지 분석 요청 (POST /predict) - (axios 유지)
// -----------------------------------------------------------------
export const postPredict = async (
  imageFile: Asset, // 카메라/갤러리에서 받은 Asset 객체
): Promise<{ task_id: string }> => {
  const formData = new FormData();
  formData.append('file', {
    uri: imageFile.uri,
    type: imageFile.type || 'image/jpeg',
    name: imageFile.fileName || 'image.jpg',
  });
  const response = await client.post('/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// -----------------------------------------------------------------
// 2. 실제 API: 작업 상태 조회 (GET /status/:taskId) - (axios 유지)
// -----------------------------------------------------------------
export const getStatus = async (
  taskId: string,
): Promise<{ task_id: string; status: string }> => {
  const response = await client.get(`/status/${taskId}`);
  return response.data;
};

// -----------------------------------------------------------------
// 3. 실제 API: 작업 결과 조회 (GET /result/:taskId) - (axios 유지)
// -----------------------------------------------------------------
export const getResult = async (taskId: string): Promise<PillSearchSummary[][]> => {
  const response = await client.get(`/result/${taskId}`);
  const resultGroups = response.data.pill_results;

  // 2D 배열 매핑 (API가 2D 배열을 반환한다고 가정)
  return resultGroups.map((group: any[]) =>
    group.map((item: any) => ({
      id: item.code,
      pillName: item.pill_info,
      imageUrl: `${BASE_URL}/image-proxy?url=${encodeURIComponent(item.image)}`,
    })),
  );
};

// -----------------------------------------------------------------
// 4. (수정) `fetch`를 사용한 텍스트 검색 (GET /search)
// - 'Network Error'의 더 구체적인 원인을 알기 위해 axios 대신 fetch 사용
// -----------------------------------------------------------------
export const postSearch = async (
  searchParams: any, // { shape, form, color, ... }
): Promise<PillSearchSummary[]> => {
  
  // 1. searchParams 객체를 URL 쿼리 문자열로 변환 (undefined 값 제외)
  const queryString = Object.keys(searchParams)
    .filter(key => searchParams[key] !== undefined)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(searchParams[key])}`)
    .join('&');
  
  const url = `${BASE_URL}/search?${queryString}`;
  
  console.log('Fetch API로 요청할 URL:', url); // 디버깅용 URL 로그

  try {
    // 2. axios 대신 fetch로 API 호출
    const response = await fetch(url, {
      method: 'GET',
    });

    // 3. 4xx, 5xx 에러 처리
    if (!response.ok) {
      // 400 에러 (필수 값 누락 등)
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.error || '잘못된 요청입니다 (400)');
      }
      // 500 에러 (서버 내부 오류)
      throw new Error(`서버 오류가 발생했습니다: ${response.status}`);
    }

    // 4. 성공 시 JSON 파싱
    const data = await response.json(); // { pill_results: [...] }
    const pillResults = data.pill_results;

    // 5. 'pill_results' 배열을 'PillSearchSummary' 배열로 매핑
    return pillResults.map((item: any) => ({
      id: item.code,
      pillName: item.pill_info,
      imageUrl: `${BASE_URL}/image-proxy?url=${encodeURIComponent(item.image)}`,
    }));

  } catch (error: any) {
    // 6. 'Network Error' (CORS 등)는 여기서 잡힘
    // (fetch는 CORS 오류 시 'TypeError: Failed to fetch'를 뱉음)
    console.error('Fetch API 오류 발생:', error.message);
    // 에러를 DirectSearchScreen의 catch 블록으로 다시 던짐
    // (이제 Alert에 'Network Error' 대신 'TypeError: Failed to fetch'가 뜰 수 있음)
    throw error;
  }
};

// -----------------------------------------------------------------
// 5. 실제 API: 알약 상세 정보 조회 (GET /detail) - (axios 유지)
// -----------------------------------------------------------------
export const getDetail = async (
  pillId: string | number, // 'code'가 전달됨
): Promise<PillResultData> => {
  const response = await client.get('/detail', {
    params: {
      code: pillId, // 쿼리 파라미터 ?code=...
    },
  });

  const data = response.data;

  // 한글 키(API)를 영어 키(App)로 매핑 (최종 필드 기준)
  return {
    id: pillId.toString(),
    pillName: data['제품명'],
    company: data['업체명'],
    effects: data['효능'],
    usage: data['사용법'],
    warnings: data['주의사항'],
    warningAlert: data['주의사항경고'],
    sideEffects: data['부작용'],
    storage: data['보관법'],
    imageUrl: `${BASE_URL}/image-proxy?url=${encodeURIComponent(data['이미지'])}`,
    imprint1: data['각인_1'] || '',
    imprint2: data['각인_2'] || '',
    sizeLong: data['장축'] || '',
    sizeShort: data['단축'] || '',
    sizeThick: data['두께'] || '',
    shape: data['모양'] || '',
    form: data['형태'] || '',
    color1: data['색_1'] || '',
    color2: data['색_2'] || '',
  };
};

// -----------------------------------------------------------------
// 6. 실제 API: 최근 검색 기록 (GET /recent) - (axios 유지)
// -----------------------------------------------------------------
export const getRecent = async (): Promise<PillSearchSummary[]> => {
  const response = await client.get('/recent');
  const pillResults = response.data.pill_results;

  // 'pill_results' 배열을 'PillSearchSummary' 배열로 매핑
  return pillResults.map((item: any) => ({
    id: item.code,
    pillName: item.pill_info,
    imageUrl: `${BASE_URL}/image-proxy?url=${encodeURIComponent(item.image)}`,
  }));
};
