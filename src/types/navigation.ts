/**
 * src/types/navigation.ts
 *
 * 앱 내비게이션 스택과 화면 간 파라미터 타입을 정의
 */

// 1. 상세 정보 타입 (GET /detail API 최종 명세 기반)
export interface PillResultData {
  // --- API 명세서에 있는 필드 ---
  id: string; // "code"
  pillName: string; // "제품명"
  company: string; // "업체명"
  effects: string; // "효능"
  usage: string; // "사용법"
  warnings: string; // "주의사항"
  warningAlert: string; // "주의사항경고"
  sideEffects: string; // "부작용"
  storage: string; // "보관법"
  imageUrl: string; // "이미지" (프록시 URL)
  
  sizeLong: string; // "장축"
  sizeShort: string; // "단축"
  sizeThick: string; // "두께" (sizeThic -> sizeThick 오타 수정)
  
  imprint1: string; // "각인_1" (imprintFront -> imprint1)
  imprint2: string; // "각인_2" (imprintBack -> imprint2)

  color1: string; // "색_1" (신규)
  color2: string; // "색_2" (신규)
  shape: string; // "모양" (신규)
  form: string; // "형태" (신규)
  
  // --- (제거) ---
  // description: string; // "성상" (제거됨)
}

// 2. 요약 정보 타입 (GET /search, /result, /recent API 응답)
export interface PillSearchSummary {
  id: string; // API의 'code'
  pillName: string; // API의 'pill_info'
  imageUrl: string; // API의 'image' (프록시 URL)
}

// 3. 앱 전체 네비게이션 스택 정의
export type RootStackParamList = {
  PillSearchScreen: undefined; // 메인 화면
  DirectSearchScreen: undefined; // 직접 검색
  
  // 검색 결과 목록 (1D 배열)
  SearchResultListScreen: {
    searchResults: PillSearchSummary[]; // 1D 배열
  };

  // 상세 결과 (상세 정보 '객체'를 받음)
  ResultScreen: { result: PillResultData };

  // 이미지 분석 결과 '그룹' 화면
  ImageResultGroupScreen: {
    imageResults: PillSearchSummary[][]; // 2D 배열
  };
};


