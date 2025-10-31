// 1. 상세 정보 타입 (GET /detail API 응답 기반 + UI/UX 필드)
export interface PillResultData {
  // --- API 명세서에 있는 필드 ---
  id: string;
  pillName: string;
  company: string;
  effects: string;
  usage: string;
  warnings: string;
  // warningAlert: string; // "주의사항경고" 제거
  sideEffects: string; // 부작용
  storage: string; // 보관법
  imageUrl: string;

  // --- (확인 필요) 명세서에 없지만, UI/UX상 필요한 필드 ---
  imprintFront: string; // 각인 앞
  imprintBack: string; // 각인 뒤
  sizeLong: string; // 장축
  sizeShort: string; // 단축
  sizeThic: string; // 두께
  description: string; // 성상
}

// 2. 요약 정보 타입 (GET /search, /result, /recent API 응답)
export interface PillSearchSummary {
  id: string; // API의 'code'
  pillName: string; // API의 'pill_info'
  imageUrl: string; // API의 'image'
}

// 3. 앱 전체 네비게이션 스택 정의
export type RootStackParamList = {
  PillSearchScreen: undefined; // 메인 화면
  DirectSearchScreen: undefined; // 직접 검색
  
  // 검색 결과 목록 (요약 정보 '배열'을 받음)
  SearchResultListScreen: {
    searchResults: PillSearchSummary[];
  };

  // 상세 결과 (상세 정보 '객체'를 받음)
  ResultScreen: { result: PillResultData };
};



