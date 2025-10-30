/**
 * src/api/pillApi.ts
 *
 * - postSearch가 '검색 결과 목록' 테스트를 위해 4개의 요약 데이터를 반환하도록 수정
 * - getDetail이 ID 기반으로만 동작하도록 정리
 */

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

// --- Mock 데이터 (A) ---
const mockPillDataA = {
  success: true,
  id: 'dummy-123',
  pillName: '타이레놀정500밀리그람',
  company: '(주)한국얀센',
  description: '흰색의 장방형 필름코팅정',
  imageUrl:
    'https://health.kr/images/drug_info/002200A101560.jpg?v=2',
  imprintFront: 'TY',
  imprintBack: '500',
  sizeLong: '17.7',
  sizeShort: '7.1',
  sizeThick: '4.7',
  type: '일반의약품',
  components: '아세트아미노펜 500mg',
  usage: '필요시 1회 1~2정, 1일 최대 8정',
  effects: '해열, 진통: 두통, 치통, 생리통, 관절통 완화',
  warnings:
    '매일 세잔 이상 정기적으로 술을 마시는 사람이 이 약이나 다른 해열진통제를 복용해야 할 경우 반드시 의사 또는 약사와 상의하십시오.',
};

// --- Mock 데이터 (B) ---
const mockPillDataB = {
  success: true,
  id: 'dummy-456',
  pillName: '비맥스메타정',
  company: '(주)녹십자',
  description: '적갈색의 타원형 필름코팅정제',
  imageUrl:
    'https://health.kr/images/drug_info/011600A101235.jpg?v=2',
  imprintFront: 'BM',
  imprintBack: 'X',
  sizeLong: '17.23',
  sizeShort: '10.22',
  sizeThick: '6.49',
  type: '일반의약품',
  components:
    '벤포티아민 100mg, 리보플라빈 100mg, 니코틴산아미드 10mg 등',
  usage: '만 12세 이상 성인 1회 1정 1일 1회 식후 복용',
  effects:
    '비타민 B군 보급 및 피로개선, 신경통 및 근육통 완화, 구내염 개선',
  warnings:
    '1) 특정 질환자는 복용 주의 2) 어린이 손이 닿지 않도록 보관 3) 고용량 복용 시 부작용 주의',
};

// --- Mock 데이터 (C) ---
const mockPillDataC = {
  success: true,
  id: 'dummy-789',
  pillName: '삐콤씨정',
  company: '(주)유한양행',
  description: '황적색의 타원형 필름코팅정',
  imageUrl:
    'https://health.kr/images/drug_info/000600A100913.jpg?v=2',
  imprintFront: 'YHC',
  imprintBack: 'B-C',
  sizeLong: '15.6',
  sizeShort: '8.5',
  sizeThick: '5.9',
  type: '일반의약품',
  components: '비타민 B군 혼합제제',
  usage: '1일 1회 1~2정 복용',
  effects: '육체피로, 신경통, 근육통, 관절통 완화',
  warnings: '임산부, 수유부는 전문가와 상의하십시오.',
};

// --- Mock 데이터 (D) ---
const mockPillDataD = {
  success: true,
  id: 'dummy-101',
  pillName: '맥세렌디정',
  company: '맥널티제약',
  description: '노란색의 원형 필름코팅정',
  imageUrl:
    'https://health.kr/images/drug_info/A11A0418A0153.jpg?v=2',
  imprintFront: 'MSRD',
  imprintBack: '',
  sizeLong: '8.7',
  sizeShort: '8.7',
  sizeThick: '4.2',
  type: '전문의약품',
  components: '세레콕시브 200mg',
  usage: '의사의 처방에 따라 복용',
  effects: '골관절염, 류마티스 관절염의 증상 완화',
  warnings: '심혈관계 질환자는 신중히 투여하십시오.',
};


/**
 * 1. 알약 이미지 분석 요청 (POST /predict)
 * (기존과 동일)
 */
export const postPredict = async (
  imageFile: any,
): Promise<{ taskId: string }> => {
  console.log('MOCK API: /predict 호출됨', imageFile.fileName);
  await delay(1500);
  return { taskId: `dummy-task-${Date.now()}` };
};

/**
 * 2. 작업 상태 조회 (GET /status/<task_id>)
 * (기존과 동일)
 */
export const getStatus = async (
  taskId: string,
): Promise<{ status: string }> => {
  console.log('MOCK API: /status/ 호출됨', taskId);
  await delay(1500);
  return { status: 'DONE' };
};

/**
 * 3. 작업 결과 조회 (GET /result/<task_id>)
 * (기존과 동일 - Mock A 반환)
 */
export const getResult = async (taskId: string): Promise<any> => {
  console.log('MOCK API: /result/ 호출됨', taskId);
  await delay(1000);
  return mockPillDataA;
};

// -----------------------------------------------------------------
// 4. (변경) 알약 정보 기반 검색 (POST /search)
// '검색 결과 목록' 화면을 위해 4개의 요약 데이터를 반환
// -----------------------------------------------------------------
export const postSearch = async (
  searchParams: any,
): Promise<any[]> => {
  console.log('MOCK API: /search 호출됨', searchParams);
  await delay(800);

  // '검색 결과 목록' 화면에서 사용할 요약 정보 목록을 반환
  // (실제 API라면 searchParams를 기반으로 필터링해야 함)
  return [
    {
      id: mockPillDataB.id,
      pillName: mockPillDataB.pillName,
      company: mockPillDataB.company,
      description: mockPillDataB.description.slice(0, 20) + '...', // 간단한 요약
    },
    {
      id: mockPillDataA.id,
      pillName: mockPillDataA.pillName,
      company: mockPillDataA.company,
      description: mockPillDataA.description.slice(0, 20) + '...',
    },
    {
      id: mockPillDataC.id,
      pillName: mockPillDataC.pillName,
      company: mockPillDataC.company,
      description: mockPillDataC.description.slice(0, 20) + '...',
    },
    {
      id: mockPillDataD.id,
      pillName: mockPillDataD.pillName,
      company: mockPillDataD.company,
      description: mockPillDataD.description.slice(0, 20) + '...',
    },
  ];
};

// -----------------------------------------------------------------
// 5. (변경) 알약 상세 정보 조회 (GET /detail)
// ID 값에 따라 정확한 Mock 데이터를 반환
// -----------------------------------------------------------------
export const getDetail = async (pillId: string | number): Promise<any> => {
  console.log('MOCK API: /detail/ 호출됨', pillId);
  await delay(500);

  switch (pillId) {
    case mockPillDataA.id:
      return mockPillDataA;
    case mockPillDataB.id:
      return mockPillDataB;
    case mockPillDataC.id:
      return mockPillDataC;
    case mockPillDataD.id:
      return mockPillDataD;
    default:
      // ID가 일치하지 않으면 기본값(A) 반환
      return mockPillDataA;
  }
};