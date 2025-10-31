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
  imageFile: Asset, // 카메라/갤러리에서 받은 Asset 객체
): Promise<{ task_id: string }> => {
  // 1. FormData 객체 생성
  const formData = new FormData();
  
  // 2. 'file'이라는 키로 이미지 파일 추가 (명세서 기준)
  formData.append('file', {
    uri: imageFile.uri,
    type: imageFile.type || 'image/jpeg', // MIME 타입
    name: imageFile.fileName || 'image.jpg', // 파일명
  });

  // 3. 'multipart/form-data' 헤더와 함께 POST 요청
  const response = await client.post('/predict', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  // 4. task_id 반환 (202 Accepted 응답)
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
// (데이터 매핑: API 응답 -> PillSearchSummary[], 이미지 프록시 URL 사용)
// -----------------------------------------------------------------
export const getResult = async (taskId: string): Promise<PillSearchSummary[]> => {
  const response = await client.get(`/result/${taskId}`);
  
  const pillResults = response.data.pill_results;

  // 'pill_results' 배열을 'PillSearchSummary' 배열로 매핑
  return pillResults.map((item: any) => ({
    id: item.code, // code -> id
    pillName: item.pill_info, // pill_info -> pillName
    // 2. 이미지 URL을 프록시 URL로 변경
    imageUrl: `${BASE_URL}/image-proxy?url=${encodeURIComponent(item.image)}`,
  }));
};

// -----------------------------------------------------------------
// 4. 실제 API: 정보 기반 검색 (GET /search)
// (데이터 매핑: API 응답 -> PillSearchSummary[], 이미지 프록시 URL 사용)
// -----------------------------------------------------------------
export const postSearch = async (
  searchParams: any, // { shape, form, color, imprint, name, company }
): Promise<PillSearchSummary[]> => {
  // 1. { name: '타이레놀' } 객체를 '?name=타이레놀' 쿼리 문자열로 변환
  const response = await client.get('/search', {
    params: searchParams, // axios가 쿼리 파라미터로 자동 변환
  });

  const pillResults = response.data.pill_results;

  // 2. 'pill_results' 배열을 'PillSearchSummary' 배열로 매핑
  return pillResults.map((item: any) => ({
    id: item.code, // code -> id
    pillName: item.pill_info, // pill_info -> pillName
    // 3. 이미지 URL을 프록시 URL로 변경
    imageUrl: `${BASE_URL}/image-proxy?url=${encodeURIComponent(item.image)}`,
  }));
};

// -----------------------------------------------------------------
// 5. 실제 API: 알약 상세 정보 조회 (GET /detail) - (최종 필드 기준)
// -----------------------------------------------------------------
export const getDetail = async (
  pillId: string | number, // 'code'가 전달됨
): Promise<PillResultData> => {
  const response = await client.get('/detail', {
    params: {
      code: pillId, // 쿼리 파라미터 ?code=...
    },
  });

  const data = response.data; // { "제품명": "...", "업체명": "...", ... }

  // 1. 한글 키(API)를 영어 키(App)로 매핑 (최종 필드 기준)
  return {
    // --- API 명세서에 있는 필드 ---
    id: pillId.toString(),
    pillName: data['제품명'],
    company: data['업체명'],
    effects: data['효능'],
    usage: data['사용법'],
    warnings: data['주의사항'],
    // warningAlert: data['주의사항경고'], // "주의사항경고" 매핑 제거
    sideEffects: data['부작용'],
    storage: data['보관법'],
    // 이미지 URL을 프록시 URL로 변경
    imageUrl: `${BASE_URL}/image-proxy?url=${encodeURIComponent(data['이미지'])}`,

    // --- (확인 필요) 명세서에 없지만, UI/UX상 필요한 필드 ---
    imprintFront: data['각인앞'] || '', // 각인 앞
    imprintBack: data['각인뒤'] || '', // 각인 뒤
    sizeLong: data['크기장축'] || '', // 장축
    sizeShort: data['크기단축'] || '', // 단축
    sizeThic: data['크기두께'] || '', // 두께
    description: data['성상'] || '', // 성상
  };
};

// -----------------------------------------------------------------
// 6. 실제 API: 최근 검색 기록 (GET /recent)
// (데이터 매핑: API 응답 -> PillSearchSummary[], 이미지 프록시 URL 사용)
// -----------------------------------------------------------------
export const getRecent = async (): Promise<PillSearchSummary[]> => {
  const response = await client.get('/recent');

  const pillResults = response.data.pill_results;

  // 2. 'pill_results' 배열을 'PillSearchSummary' 배열로 매핑
  return pillResults.map((item: any) => ({
    id: item.code, // code -> id
    pillName: item.pill_info, // pill_info -> pillName
    // 5. 이미지 URL을 프록시 URL로 변경
    imageUrl: `${BASE_URL}/image-proxy?url=${encodeURIComponent(item.image)}`,
  }));
};