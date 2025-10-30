// API 응답 공용 타입: 알약 상세 정보 (ResultScreen용)
export interface PillResultData {
  success: boolean;
  id: string; // 알약 고유 ID
  pillName: string; // 알약 이름
  company: string; // 제조사
  description: string; // 성상 (모양, 색상 등)
  imageUrl: string; // 알약 이미지 URL
  imprintFront: string; // 각인 (앞)
  imprintBack: string; // 각인 (뒤)
  sizeLong: string; // 장축
  sizeShort: string; // 단축
  sizeThick: string; // 두께
  type: string; // 전문/일반
  components: string; // 주성분
  usage: string; // 용법용량
  effects: string; // 효능효과
  warnings: string; // 주의사항
}

// API 응답 공용 타입: 알약 요약 정보 (SearchResultListScreen용)
export interface PillSearchSummary {
  id: string;
  pillName: string;
  company: string;
  description: string;
  imageUrl: string;
}

// 전체 네비게이션 스크린 파라미터 타입 정의
export type RootStackParamList = {
  // 알약 검색 메인 화면
  PillSearchScreen: undefined;

  // 직접 검색 화면
  DirectSearchScreen: undefined;

  // 검색 결과 목록 화면
  SearchResultListScreen: {
    searchResults: PillSearchSummary[];
  };

  // 분석 결과 상세 화면
  ResultScreen: {
    result: PillResultData;
  };
};



