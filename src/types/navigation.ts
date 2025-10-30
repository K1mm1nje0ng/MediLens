export type RootStackParamList = {
  // 알약 검색 메인 화면: 파라미터 없음
  PillSearchScreen: undefined;

  // 분석 결과 화면: result 객체를 전달받음
  ResultScreen: { 
    result: { 
      pillName: string; // 약 이름만 전달받는 구조
    }; 
  };

  // 직접 검색 화면: 파라미터 없음
  DirectSearchScreen: undefined;
};


