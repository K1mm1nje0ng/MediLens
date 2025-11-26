export interface PillResultData {
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
}

// '직접 검색' (GET /search) API에 전송할 쿼리 파라미터 객체 타입
export type SearchQuery = {
  shape?: string;
  color?: string;
  form?: string;
  imprint?: string;
  name?: string;
  company?: string;
};

// 앱 내 화면 목록과 각 화면이 받을 파라미터 정의
export type RootStackParamList = {
  PillSearchScreen: undefined;
  
  // 수정 기능을 위해 파라미터를 받을 수 있게 설정
  DirectSearchScreen: { initialQuery?: SearchQuery } | undefined;
  
  // 이미지 분석 결과 화면
  ImageResultGroupScreen: {
    imageResults: PillSearchSummary[][]; 
    processedImage: string; 
  };

  // 검색 결과 목록 화면
  SearchResultListScreen: {
    // 이미지 분석 배열을 받거나
    imageResults?: PillSearchSummary[]; 
    // 검색 쿼리 객체를 받음
    searchQuery?: SearchQuery;
  };
  
  // 최종 상세 정보 화면
  ResultScreen: { result: PillResultData };
};


