// axios 클라이언트 (POST용) 및 BASE_URL 임포트
import client, { BASE_URL } from './client';
// 타입 임포트
import { PillResultData, PillSearchSummary } from '../types/navigation';
// react-native-image-picker의 Asset 타입
import { Asset } from 'react-native-image-picker';

// --- (추가) fetch를 위한 공통 에러 핸들러 ---
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `서버 오류: ${response.status}`;
    try {
      // 400 Bad Request처럼, 서버가 JSON 에러 메시지를 보냈을 경우
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      // JSON 파싱 실패
    }
    // DirectSearchScreen의 catch 블록으로 에러를 던짐
    throw new Error(errorMessage);
  }
  return response.json(); // 성공 시 JSON 파싱
};

// -----------------------------------------------------------------
// 1. 실제 API: 이미지 분석 요청 (POST /predict) - (axios 사용)
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
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// -----------------------------------------------------------------
// 2. 실제 API: 작업 상태 조회 (GET /status/:taskId) - (fetch 사용)
// -----------------------------------------------------------------
export const getStatus = async (
  taskId: string,
): Promise<{ task_id: string; status: string }> => {
  const url = `${BASE_URL}/status/${taskId}`;
  const response = await fetch(url);
  return handleApiResponse(response);
};

// -----------------------------------------------------------------
// 3. 실제 API: 작업 결과 조회 (GET /result/:taskId) - (fetch 사용)
// (데이터 매핑: 2D 배열 반환)
// -----------------------------------------------------------------
export const getResult = async (taskId: string): Promise<PillSearchSummary[][]> => {
  const url = `${BASE_URL}/result/${taskId}`;
  const response = await fetch(url);
  const data = await handleApiResponse(response); // { pill_results: [ [...] ] }

  const resultGroups = data.pill_results;

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
// 4. 실제 API: 정보 기반 검색 (GET /search) - (fetch 사용 + 페이지네이션)
// (반환 타입: 요약 배열이 아닌, 페이지 정보 객체)
// -----------------------------------------------------------------
export const postSearch = async (
  searchParams: any,
  page: number = 1, // 1. page 파라미터 추가 (기본값 1)
): Promise<{ pill_results: PillSearchSummary[]; total_pages: number }> => {
  
  // 2. page 파라미터를 searchParams에 추가
  const paramsWithPage = {
    ...searchParams,
    page: page,
  };

  const queryString = Object.keys(paramsWithPage)
    .filter(key => paramsWithPage[key] !== undefined)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(paramsWithPage[key])}`)
    .join('&');
  
  const url = `${BASE_URL}/search?${queryString}`;
  console.log('Fetch API로 요청할 URL (검색):', url);

  const response = await fetch(url);
  const data = await handleApiResponse(response); // { pill_results: [...], total_pages: ... }

  // 3. pill_results 배열 매핑 (이미지 프록시 적용)
  const mappedResults = data.pill_results.map((item: any) => ({
    id: item.code,
    pillName: item.pill_info,
    imageUrl: `${BASE_URL}/image-proxy?url=${encodeURIComponent(item.image)}`,
  }));

  // 4. API 응답 구조 그대로 반환 (페이지 정보 포함)
  return {
    pill_results: mappedResults,
    total_pages: data.total_pages || 1,
  };
};

// -----------------------------------------------------------------
// 5. 실제 API: 알약 상세 정보 조회 (GET /detail) - (fetch 사용)
// -----------------------------------------------------------------
export const getDetail = async (
  pillId: string | number,
): Promise<PillResultData> => {
  
  const url = `${BASE_URL}/detail?code=${pillId}`;
  console.log('Fetch API로 요청할 URL (상세):', url);

  const response = await fetch(url);
  const data = await handleApiResponse(response);

  // -----------------------------------------------------------------
  // (수정) "필수 항목"으로 확인되었으므로, 불필요한 `|| ''` 폴백 제거
  // -----------------------------------------------------------------
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
    imprint1: data['각인_1'],
    imprint2: data['각인_2'],
    sizeLong: data['장축'],
    sizeShort: data['단축'],
    sizeThick: data['두께'],
    shape: data['모양'],
    form: data['형태'],
    color1: data['색_1'],
    color2: data['색_2'],
  };
};

// -----------------------------------------------------------------
// 6. 실제 API: 최근 검색 기록 (GET /recent) - (fetch 사용)
// -----------------------------------------------------------------
export const getRecent = async (): Promise<PillSearchSummary[]> => {
  const url = `${BASE_URL}/recent`;
  const response = await fetch(url);
  const data = await handleApiResponse(response); // { pill_results: [...] }
  
  const pillResults = data.pill_results;

  // 'pill_results' 배열을 'PillSearchSummary' 배열로 매핑
  return pillResults.map((item: any) => ({
    id: item.code,
    pillName: item.pill_info,
    imageUrl: `${BASE_URL}/image-proxy?url=${encodeURIComponent(item.image)}`,
  }));
};