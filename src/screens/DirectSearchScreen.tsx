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
// Mock API 및 로딩 오버레이 임포트
import { postSearch } from '../api/pillApi';
import LoadingOverlay from '../components/LoadingOverlay';

// 검색 필터 옵션 정의 (모양, 제형, 색상)
const shapeOptions = ['원형', '타원형', '장방형', '전체'];
const typeOptions = ['정제', '경질캡슐', '연질캡슐', '전체'];
const colorOptions = [
  '하양', '노랑', '주황', '분홍', '빨강', '갈색',
  '연두', '초록', '청록', '파랑', '남색', '자주',
  '보라', '회색', '검정', '투명', '전체',
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
  const [type, setType] = useState('전체');
  const [color, setColor] = useState('전체');
  const [identifier, setIdentifier] = useState('');
  const [product, setProduct] = useState('');
  const [company, setCompany] = useState('');

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
    // API 전송용 검색 파라미터 객체 생성
    const searchParams = {
      shape: shape === '전체' ? undefined : shape,
      type: type === '전체' ? undefined : type,
      color: color === '전체' ? undefined : color,
      identifier: identifier || undefined,
      product: product || undefined,
      company: company || undefined,
    };

    setIsLoading(true);

    try {
      // 1. postSearch API 호출 (검색 결과 '목록' 요청)
      const searchResults = await postSearch(searchParams);

      if (!searchResults || searchResults.length === 0) {
        // 결과가 없으면 Alert (향후 '결과 없음' UI로 대체 가능)
        Alert.alert('검색 실패', '일치하는 알약 정보를 찾을 수 없습니다.');
      } else {
        // 2. 결과 목록 화면(SearchResultListScreen)으로 '목록' 데이터 전달
        navigation.navigate('SearchResultListScreen', {
          searchResults: searchResults,
        });
      }
    } catch (error) {
      console.error('검색 중 오류 발생:', error);
      Alert.alert('오류', '검색 중 문제가 발생했습니다.');
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

