import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// 네비게이션 훅 임포트
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
// 아이콘 임포트
import Feather from 'react-native-vector-icons/Feather';
// API 및 로딩 오버레이 임포트
import { postSearch } from '../api/pillApi';
import LoadingOverlay from '../components/LoadingOverlay';
import axios from 'axios'; // 1. (추가) AxiosError 타입을 위해 import

// 검색 필터 옵션 정의 (실제 API 파라미터 값 기준)
const shapeOptions = ['원형', '타원형', '장방형', '전체'];
const typeOptions = ['정제', '경질캡슐', '연질캡슐', '전체']; // API 명세의 'form'
const colorOptions = [
  '빨강', '검정', '하양', '회색', '주황', '노랑', '초록',
  '파랑', '남색', '보라', '분홍', '갈색', '전체'
];

// 이 스크린에서 사용할 네비게이션 prop 타입
type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DirectSearchScreen'
>;

// 알약 식별 정보(필터) 기반 직접 검색 화면
export default function DirectSearchScreen() {
  // 네비게이션 훅
  const navigation = useNavigation<NavigationProp>();

  // 검색 조건 상태 (모양, 제형, 색상, 텍스트 입력)
  const [shape, setShape] = useState('전체');
  const [type, setType] = useState('전체'); // 'form'
  const [color, setColor] = useState('전체');
  const [identifier, setIdentifier] = useState(''); // 'imprint'
  const [product, setProduct] = useState(''); // 'name'
  const [company, setCompany] = useState(''); // 'company'

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false);

  // 옵션 버튼 그룹(모양, 제형, 색상) 렌더링 함수
  const renderOptionGroup = (
    label: string,
    options: string[],
    selected: string,
    setSelected: (v: string) => void,
  ) => (
    <View style={styles.groupContainer}>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}
      >
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.label}> |</Text>
      </View>

      <View style={styles.optionContainer}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.optionButton, selected === opt && styles.selected]}
            onPress={() => setSelected(opt)}
          >
            <Text style={styles.optionText}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // '검색하기' 버튼 핸들러
  const handleSearch = async () => {
    // -----------------------------------------------------------------
    // 2. (수정) 유효성 검사: API 명세서에 따라 '모양'과 '색상'을 필수로 검사
    // -----------------------------------------------------------------
    if (shape === '전체' || color === '전체') {
      Alert.alert(
        '필수 조건 누락',
        'API 규격상 \'모양\'과 \'색상\'은 반드시 선택해야 합니다.'
      );
      return; // API 호출 중단
    }

    // API 전송용 검색 파라미터 객체 생성 (실제 API 키 이름 사용)
    const searchParams = {
      shape: shape, // 필수
      color: color, // 필수
      form: type === '전체' ? undefined : type,
      imprint: identifier || undefined,
      name: product || undefined,
      company: company || undefined,
    };

    setIsLoading(true);

    try {
      // 1. postSearch API 호출 (실제 GET /search 요청)
      const searchResults = await postSearch(searchParams);

      // (추가) API가 빈 배열을 반환했을 경우 (검색 결과 없음)
      if (!searchResults || searchResults.length === 0) {
        Alert.alert(
          '검색 결과 없음',
          '일치하는 알약 정보를 찾을 수 없습니다.'
        );
      } else {
        // 2. 결과 목록 화면(SearchResultListScreen)으로 '목록' 데이터 전달
        navigation.navigate('SearchResultListScreen', {
          searchResults: searchResults,
        });
      }

    } catch (error) { 
      console.error('검색 중 오류 발생:', error);
      // -----------------------------------------------------------------
      // 3. (수정) 400 에러일 경우, 서버가 보낸 에러 메시지(error.response.data.error)를 표시
      // -----------------------------------------------------------------
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        Alert.alert('검색 오류 (400)', error.response.data?.error || '잘못된 요청입니다. (필수 값 누락)');
      } else {
        Alert.alert('오류', '검색 중 문제가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7FEFB' }}>
      {/* 상단 헤더 (뒤로가기, 화면 제목) */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>식별 검색</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 메인 스크롤 뷰 */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* 검색 옵션 전체 카드 */}
        <View style={styles.outerBox}>
          {/* 모양, 제형, 색상 옵션 그룹 렌더링 */}
          {renderOptionGroup('모양', shapeOptions, shape, setShape)}
          {renderOptionGroup('제형', typeOptions, type, setType)}
          {renderOptionGroup('색상', colorOptions, color, setColor)}

          {/* 식별문자, 제품명, 회사명 텍스트 입력 필드 렌더링 */}
          {(
            [
              ['식별문자', identifier, setIdentifier],
              ['제품명', product, setProduct],
              ['회사명', company, setCompany],
            ] as [
              string,
              string,
              React.Dispatch<React.SetStateAction<string>>,
            ][]
          ).map(([label, value, setter], idx) => (
            <View style={styles.inputGroup} key={idx}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.label}> |</Text>
              </View>
              <TextInput
                placeholder="입력"
                placeholderTextColor="#B7B7B7"
                style={styles.input}
                value={value}
                onChangeText={setter}
              />
            </View>
          ))}

          {/* '검색하기' 실행 버튼 */}
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={isLoading} // 로딩 중 버튼 비활성화
          >
            <Feather name="search" size={18} color="#fff" />
            <Text style={styles.searchButtonText}>검색하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 로딩 오버레이 */}
      <LoadingOverlay visible={isLoading} message="알약을 검색 중입니다..." />
    </SafeAreaView>
  );
}

// 화면 스타일 정의
const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 60 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#000' },
  // 검색 옵션 카드
  outerBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  // 옵션 그룹 (모양, 제형, 색상)
  groupContainer: { marginBottom: 15 },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: 'black',
    marginBottom: 8,
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  // 선택된 옵션 버튼
  selected: { borderWidth: 2, borderColor: '#409F82' },
  optionText: { fontSize: 11, color: '#484848', fontWeight: '500' },
  // 텍스트 입력 필드
  inputGroup: { marginTop: 10 },
  input: {
    backgroundColor: 'white',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#B1B1B1',
    paddingVertical: 6,
    paddingHorizontal: 15,
    fontSize: 12,
    color: 'black',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  // 검색 버튼
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#409F82',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 25,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

