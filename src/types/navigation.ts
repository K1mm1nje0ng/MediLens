// API 응답 타입 (상세 정보) - 최종 명세서 기준
export interface PillResultData {
  // --- API 명세서에 있는 필드 ---
  id: string;
  pillName: string; // 제품명
  company: string; // 업체명
  effects: string; // 효능
  usage: string; // 사용법
  warnings: string; // 주의사항
  warningAlert: string; // 주의사항경고
  sideEffects: string; // 부작용
  storage: string; // 보관법
  imageUrl: string; // 이미지

  // --- API 명세서에 추가된 필드 ---
  imprint1: string; // 각인_1
  imprint2: string; // 각인_2
  sizeLong: string; // 장축
  sizeShort: string; // 단축
  sizeThick: string; // 두께
  shape: string; // 모양
  form: string; // 형태
  color1: string; // 색_1
  color2: string; // 색_2
}

// GET /search, GET /result, GET /recent가 반환하는 검색 결과 '요약' 타입
export interface PillSearchSummary {
  id: string; // code
  pillName: string; // pill_info
  imageUrl: string; // image
  // (참고) company, description은 목록 API에서 반환 안 함
}

// -----------------------------------------------------------------
// (수정) `SearchQuery` 타입을 export (내보내기) 추가
// -----------------------------------------------------------------
// '직접 검색' (GET /search) API에 전송할 쿼리 파라미터 객체 타입
export type SearchQuery = {
  shape?: string;
  color?: string;
  form?: string;
  imprint?: string;
  name?: string;
  company?: string;
};

// 앱 내 화면(Screen) 목록과 각 화면이 받을 파라미터(params) 정의
export type RootStackParamList = {
  PillSearchScreen: undefined; // 메인 화면
  DirectSearchScreen: undefined; // 직접 검색 옵션 화면
  
  // (수정) 이미지 분석 결과 (2D 배열)를 받는 화면
  ImageResultGroupScreen: {
    imageResults: PillSearchSummary[][]; // 2D 배열
  };

  // (수정) 검색 결과 목록 (1D)을 표시하는 화면
  SearchResultListScreen: {
    // 1D 배열 (이미지 분석에서 1D 그룹을 선택)
    imageResults?: PillSearchSummary[]; 
    // 또는 검색 쿼리 객체 (직접 검색)
    searchQuery?: SearchQuery;
  };
  
  // 최종 상세 정보 화면
  ResultScreen: { result: PillResultData };
};


