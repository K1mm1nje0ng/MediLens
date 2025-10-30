// axios 클라이언트 임포트
//import client from './client';
// 타입 임포트
import { PillResultData, PillSearchSummary } from '../types/navigation';

// --- Mock API용 딜레이 함수 (Promise) ---
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// --- Mock 데이터 (A) ---
const mockPillDataA: PillResultData = {
  success: true,
  id: 'DUMMY_A',
  pillName: '타이레놀정500밀리그람',
  company: '(주)한국얀센',
  description: '흰색의 장방형 필름코팅정',
  imageUrl: 'https://placehold.co/250x100/EFEFEF/999?text=Pill+Image+A',
  imprintFront: 'TY',
  imprintBack: '500',
  sizeLong: '17.7',
  sizeShort: '7.1',
  sizeThick: '4.7',
  type: '일반의약품',
  components: '아세트아미노펜 500mg',
  usage: '필요시 1회 1~2정, 1일 최대 8정',
  effects: '해열, 진통: 두통, 치통, 생리통, 관절통 완화',
  warnings: '매일 세잔 이상 정기적으로 술을 마시는 사람은...',
};

// --- Mock 데이터 (B) ---
const mockPillDataB: PillResultData = {
  success: true,
  id: 'DUMMY_B',
  pillName: '비맥스메타정',
  company: '(주)녹십자',
  description: '적갈색의 타원형 필름코팅정제',
  imageUrl: 'https://placehold.co/250x100/EFEFEF/999?text=Pill+Image+B',
  imprintFront: 'BM',
  imprintBack: 'X',
  sizeLong: '17.23',
  sizeShort: '10.22',
  sizeThick: '6.49',
  type: '일반의약품',
  components: '벤포티아민 100mg, 리보플라빈 100mg...',
  usage: '만 12세 이상 성인 1회 1정 1일 1회 식후 복용',
  effects: '비타민 B군 보급 및 피로개선, 신경통, 근육통',
  warnings: '1) 특정 질환자는 복용 주의 2) 어린이 손이 닿지 않도록',
};

// --- Mock 데이터 (C) ---
const mockPillDataC: PillResultData = {
  success: true,
  id: 'DUMMY_C',
  pillName: '맥세렌디정',
  company: '맥널티제약',
  description: '노란색의 원형 필름코팅정',
  imageUrl: 'https://placehold.co/250x100/EFEFEF/999?text=Pill+Image+C',
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

// --- Mock 데이터 (D) ---
const mockPillDataD: PillResultData = {
  success: true,
  id: 'DUMMY_D',
  pillName: '삐콤씨정',
  company: '유한양행',
  description: '주황색의 타원형 필름코팅정',
  imageUrl: 'https://placehold.co/250x100/EFEFEF/999?text=Pill+Image+D',
  imprintFront: 'YH',
  imprintBack: 'BC',
  sizeLong: '15.7',
  sizeShort: '8.1',
  sizeThick: '5.9',
  type: '일반의약품',
  components: '비타민 B 복합체, 비타민 C',
  usage: '1일 1회 1정',
  effects: '육체피로, 임신/수유기, 병중/병후의 비타민 보급',
  warnings: '녹차, 홍차 등 탄닌을 함유하는 차와 복용 주의',
};

// --- Mock API 함수들 ---

// Mock: 이미지 분석 요청 (POST /predict)
// (imageFile 객체를 받지만 사용하지 않고, 고정된 taskId 반환)
export const postPredict = async (
  imageFile: any,
): Promise<{ taskId: string }> => {
  console.log('MOCK API: /predict 호출됨', imageFile?.fileName);
  await delay(1500); // 1.5초 딜레이
  return { taskId: `dummy-task-${Date.now()}` };
};

// Mock: 작업 상태 조회 (GET /status/:taskId)
// (taskId를 받지만 사용하지 않고, 'DONE' 상태 반환)
export const getStatus = async (
  taskId: string,
): Promise<{ status: string }> => {
  console.log('MOCK API: /status/ 호출됨', taskId);
  await delay(1500);
  return { status: 'DONE' };
};

// Mock: 작업 결과 조회 (GET /result/:taskId)
// (taskId를 받지만 사용하지 않고, Mock 데이터 A 반환)
export const getResult = async (taskId: string): Promise<PillResultData> => {
  console.log('MOCK API: /result/ 호출됨', taskId);
  await delay(1000);
  return mockPillDataA;
};

// Mock: 정보 기반 검색 (POST /search)
// (searchParams를 받지만 사용하지 않고, 4개 데이터의 요약 목록 반환)
export const postSearch = async (
  searchParams: any,
): Promise<PillSearchSummary[]> => {
  console.log('MOCK API: /search 호출됨', searchParams);
  await delay(800);

  // '검색 결과 목록' 화면용 요약 데이터 생성
  const searchSummaryList: PillSearchSummary[] = [
    {
      id: mockPillDataA.id,
      pillName: mockPillDataA.pillName,
      company: mockPillDataA.company,
      description: mockPillDataA.description,
      imageUrl: mockPillDataA.imageUrl, // 요약에도 이미지 URL 포함
    },
    {
      id: mockPillDataB.id,
      pillName: mockPillDataB.pillName,
      company: mockPillDataB.company,
      description: mockPillDataB.description,
      imageUrl: mockPillDataB.imageUrl,
    },
    {
      id: mockPillDataC.id,
      pillName: mockPillDataC.pillName,
      company: mockPillDataC.company,
      description: mockPillDataC.description,
      imageUrl: mockPillDataC.imageUrl,
    },
    {
      id: mockPillDataD.id,
      pillName: mockPillDataD.pillName,
      company: mockPillDataD.company,
      description: mockPillDataD.description,
      imageUrl: mockPillDataD.imageUrl,
    },
  ];

  return searchSummaryList;
};

// Mock: 알약 상세 정보 조회 (GET /detail/:pillId)
// (pillId 값에 따라 다른 상세 데이터 반환)
export const getDetail = async (
  pillId: string | number,
): Promise<PillResultData> => {
  console.log('MOCK API: /detail/ 호출됨', pillId);
  await delay(500);

  switch (pillId) {
    case 'DUMMY_A':
      return mockPillDataA;
    case 'DUMMY_B':
      return mockPillDataB;
    case 'DUMMY_C':
      return mockPillDataC;
    case 'DUMMY_D':
      return mockPillDataD;
    // '최근 검색'용 문자열 ID 대응
    case '타이레놀정500밀리그람':
      return mockPillDataA;
    case '비맥스메타정':
      return mockPillDataB;
    case '맥세렌디정':
      return mockPillDataC;
    case '삐콤씨정':
      return mockPillDataD;
    // 기본값 (혹은 첫 번째 항목)
    default:
      return mockPillDataA;
  }
};