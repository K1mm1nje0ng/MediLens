// API 응답 타입 (상세 정보) - 최종 명세서 기준
export interface PillResultData {
  id: string;
  pillName: string;   // 제품명
  company: string;      // 업체명
  effects: string;      // 효능
  usage: string;        // 사용법
  warnings: string;     // 주의사항
  warningAlert: string; // 주의사항경고
  sideEffects: string;  // 부작용
  storage: string;      // 보관법
  imageUrl: string;     // 이미지
  imprint1: string;     // 각인_1
  imprint2: string;     // 각인_2
  sizeLong: string;     // 장축
  sizeShort: string;    // 단축
  sizeThick: string;    // 두께
  shape: string;        // 모양
  form: string;         // 형태
  color1: string;       // 색_1
  color2: string;       // 색_2
}

// 검색 결과 '요약' 타입 (목록용)
export interface PillSearchSummary {
  id: string;       // code
  pillName: string; // pill_info
  imageUrl: string; // image (프록시 URL로 변환됨)
}

// 앱 내 화면 이동(네비게이션) 규칙 정의
export type RootStackParamList = {
  // 메인 화면
  PillSearchScreen: undefined;

  // 직접 검색 화면
  DirectSearchScreen: undefined;

  // (신규) 이미지 분석 결과 (알약 그룹 목록)
  // 2D 배열을 파라미터로 받음
  ImageResultGroupScreen: {
    imageResults: PillSearchSummary[][];
  };

  // 검색 결과 목록 화면 (1D)
  SearchResultListScreen: {
    // 1D 배열(이미지 검색) 또는 검색어(직접 검색)
    imageResults?: PillSearchSummary[]; 
    searchQuery?: any; 
  };

  // 최종 상세 결과 화면
  ResultScreen: { result: PillResultData };
};


