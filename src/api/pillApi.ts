// axios 인스턴스(client)는 이제 필요 없으므로 BASE_URL만 임포트합니다.
import { BASE_URL } from './client'; 
// 타입 임포트
import { PillResultData, PillSearchSummary } from '../types/navigation';
// react-native-image-picker의 Asset 타입
import { Asset } from 'react-native-image-picker';

// fetch 에러 핸들러
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `서버 오류: ${response.status}`;
    try {
      // 서버가 JSON 에러 메시지를 보냈을 경우
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // JSON 파싱 실패
    }
    // DirectSearchScreen의 catch 블록으로 에러를 던짐
    throw new Error(errorMessage);
  }
  return response.json(); // 성공 시 JSON 파싱
};

// 이미지 분석 요청 (POST /predict) - (fetch로 변경됨)
export const postPredict = async (
  imageFile: Asset,
): Promise<{ task_id: string }> => {
  const url = `${BASE_URL}/predict`;
  
  const formData = new FormData();
  
  // React Native에서 FormData에 파일을 넣을 때는 객체 형태가 필요합니다.
  // TypeScript 오류 방지를 위해 as any를 사용할 수도 있습니다.
  formData.append('file', {
    uri: imageFile.uri,
    type: imageFile.type || 'image/jpeg',
    name: imageFile.fileName || 'image.jpg',
  } as any); 

  console.log('Fetch API로 요청할 URL (이미지 분석):', url);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    // 주의: fetch 사용 시 FormData 전송 헤더('Content-Type': 'multipart/form-data')는
    // 절대로 직접 설정하면 안 됩니다. (Boundary가 누락되어 전송 실패함)
  });

  return handleApiResponse(response);
};

// 작업 상태 조회 (GET /status/:taskId) - (fetch 사용)
export const getStatus = async (
  taskId: string,
): Promise<{ task_id: string; status: string }> => {
  const url = `${BASE_URL}/status/${taskId}`;
  const response = await fetch(url);
  return handleApiResponse(response);
};

// 작업 결과 조회 (GET /result/:taskId) - (fetch 사용)
export const getResult = async (
  taskId: string,
): Promise<{ processedImage: string; resultGroups: PillSearchSummary[][] }> => {
  const url = `${BASE_URL}/result/${taskId}`;
  const response = await fetch(url);
  const data = await handleApiResponse(response);

  // 2D 배열 매핑
  const resultGroups = data.pill_results.map((group: any[]) =>
    group.map((item: any) => ({
      id: item.code,
      pillName: item.pill_info,
      imageUrl: `${BASE_URL}/image-proxy?url=${encodeURIComponent(item.image)}`,
    })),
  );
  
  // base64 이미지와 2D 배열을 객체로 묶어 반환
  return {
    processedImage: data.processed_image,
    resultGroups: resultGroups,
  };
};

// 실제 API: 정보 기반 검색 (GET /search) - (fetch 사용 + 페이지네이션)
export const postSearch = async (
  searchParams: any,
  page: number = 1, // page 파라미터 추가
): Promise<{ pill_results: PillSearchSummary[]; total_pages: number }> => {
  
  // page 파라미터를 searchParams에 추가
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
  const data = await handleApiResponse(response);

  // pill_results 배열 매핑
  const mappedResults = data.pill_results.map((item: any) => ({
    id: item.code,
    pillName: item.pill_info,
    imageUrl: `${BASE_URL}/image-proxy?url=${encodeURIComponent(item.image)}`,
  }));

  // API 응답 구조 그대로 반환
  return {
    pill_results: mappedResults,
    total_pages: data.total_pages || 1,
  };
};


// 알약 상세 정보 조회 (GET /detail) - (fetch 사용)
export const getDetail = async (
  pillId: string | number,
): Promise<PillResultData> => {
  
  const url = `${BASE_URL}/detail?code=${pillId}`;
  console.log('Fetch API로 요청할 URL (상세):', url);

  const response = await fetch(url);
  const data = await handleApiResponse(response);

  // 한글 키(API)를 영어 키(App)로 매핑
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

// 최근 검색 기록 (GET /recent) - (fetch 사용)
export const getRecent = async (): Promise<PillSearchSummary[]> => {
  const url = `${BASE_URL}/recent`;
  const response = await fetch(url);
  const data = await handleApiResponse(response); 
  
  const pillResults = data.pill_results;

  // 'pill_results' 배열을 'PillSearchSummary' 배열로 매핑
  return pillResults.map((item: any) => ({
    id: item.code,
    pillName: item.pill_info,
    imageUrl: `${BASE_URL}/image-proxy?url=${encodeURIComponent(item.image)}`,
  }));
};