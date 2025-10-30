/**
 * src/types/navigation.ts
 *
 * 1. postSearch가 반환하는 '요약 정보' 타입을 정의 (PillSearchSummary)
 * 2. 'SearchResultListScreen'을 RootStackParamList에 추가
 */

// API 응답 타입 (상세 정보)
export interface PillResultData {
  success: boolean;
  id: string;
  pillName: string;
  company: string;
  description: string;
  imageUrl: string;
  imprintFront: string;
  imprintBack: string;
  sizeLong: string;
  sizeShort: string;
  sizeThick: string;
  type: string;
  components: string;
  usage: string;
  effects: string;
  warnings: string;
}

// -----------------------------------------------------------------
// (신규) postSearch가 반환하는 검색 결과 '요약' 타입
// -----------------------------------------------------------------
export interface PillSearchSummary {
  id: string;
  pillName: string;
  company: string;
  description: string;
}

// (수정) RootStackParamList
export type RootStackParamList = {
  PillSearchScreen: undefined;
  DirectSearchScreen: undefined;
  ResultScreen: { result: PillResultData };
  // -----------------------------------------------------------------
  // (신규) 검색 결과 목록 화면
  // -----------------------------------------------------------------
  SearchResultListScreen: {
    results: PillSearchSummary[]; // 요약 정보 '배열'을 받음
  };
};


