import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert, // Alert 추가
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// 네비게이션 훅 임포트
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, SearchQuery } from '../types/navigation';
// 아이콘 임포트
import Feather from 'react-native-vector-icons/Feather';

// 검색 필터 옵션 정의
const shapeOptions = ['원형', '타원형', '장방형', '전체'];
const typeOptions = ['정제', '경질캡슐', '연질캡슐', '전체'];
const colorOptions = [
  '빨강', '검정', '하양', '회색', '주황', '노랑', '초록',
  '파랑', '남색', '보라', '분홍', '갈색', '살구', '전체'
];

// 이 스크린에서 사용할 네비게이션 prop 타입
type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DirectSearchScreen'
>;

// 이 스크린의 Route 타입 (파라미터 받기 위함)
type DirectSearchScreenRouteProp = RouteProp<
  RootStackParamList, 
  'DirectSearchScreen'
>;

// 알약 식별 정보(필터) 기반 직접 검색 화면
export default function DirectSearchScreen() {
  // 네비게이션 훅
  const navigation = useNavigation<NavigationProp>();
  // 라우트 훅 (파라미터 수신용)
  const route = useRoute<DirectSearchScreenRouteProp>();

  // 검색 조건 상태
  const [shape, setShape] = useState('전체');
  const [type, setType] = useState('전체'); 
  // [변경] 색상은 다중 선택을 위해 배열로 관리 (기본값 ['전체'])
  const [selectedColors, setSelectedColors] = useState<string[]>(['전체']);
  
  const [identifier, setIdentifier] = useState(''); 
  const [product, setProduct] = useState(''); 
  const [company, setCompany] = useState(''); 

  // 화면 진입 시 파라미터 확인하여 상태 채워넣기
  useEffect(() => {
    if (route.params?.initialQuery) {
      const q = route.params.initialQuery;
      
      setShape(q.shape || '전체');
      
      // [변경] 색상 문자열(예: "빨강,하양")을 배열로 변환
      if (q.color && q.color !== '전체') {
        // 콤마로 구분되어 있을 수 있으므로 split
        setSelectedColors(q.color.split(','));
      } else {
        setSelectedColors(['전체']);
      }
      
      // 제형(Form) 매핑 로직
      let targetType = '전체';
      const formVal = q.form || '';

      if (typeOptions.includes(formVal)) {
        targetType = formVal;
      } else if (formVal.includes('정')) {
        targetType = '정제';
      } else if (formVal.includes('연질')) {
        targetType = '연질캡슐';
      } else if (formVal.includes('캡슐')) {
        targetType = '경질캡슐';
      }
      setType(targetType);

      setIdentifier(q.imprint || '');
      setProduct(q.name || '');
      setCompany(q.company || '');
    }
  }, [route.params]);

  // [추가] 색상 토글 핸들러 (최대 2개 선택)
  const toggleColor = (color: string) => {
    // 1. '전체'를 선택한 경우 -> 초기화
    if (color === '전체') {
      setSelectedColors(['전체']);
      return;
    }

    setSelectedColors((prev) => {
      // '전체'가 선택되어 있었다면 제거하고 시작
      let newColors = prev.filter((c) => c !== '전체');

      if (newColors.includes(color)) {
        // 이미 선택된 색상이면 제거
        newColors = newColors.filter((c) => c !== color);
      } else {
        // 새로운 색상 추가 전 개수 확인
        if (newColors.length >= 2) {
          Alert.alert('알림', '색상은 최대 2개까지만 선택 가능합니다.');
          return prev; // 변경 없음
        }
        newColors.push(color);
      }

      // 아무것도 선택 안 된 상태면 다시 '전체'로
      if (newColors.length === 0) {
        return ['전체'];
      }

      return newColors;
    });
  };

  // 옵션 버튼 그룹 렌더링 함수 (단일 선택용: 모양, 제형)
  const renderSingleSelectGroup = (
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
            <Text style={[
              styles.optionText, 
              selected === opt && styles.selectedText // 선택된 텍스트 스타일 추가
            ]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // [추가] 색상 전용 렌더링 그룹 (다중 선택 지원)
  const renderColorGroup = () => (
    <View style={styles.groupContainer}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <Text style={styles.label}>색상</Text>
        <Text style={styles.label}> | (최대 2개)</Text>
      </View>

      <View style={styles.optionContainer}>
        {colorOptions.map((opt) => {
          const isSelected = selectedColors.includes(opt);
          return (
            <TouchableOpacity
              key={opt}
              style={[styles.optionButton, isSelected && styles.selected]}
              onPress={() => toggleColor(opt)}
            >
              <Text style={[
                styles.optionText,
                isSelected && styles.selectedText
              ]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // '검색하기' 버튼 핸들러 
  const handleSearch = () => {
    // [변경] 색상 배열을 콤마로 합쳐서 문자열로 변환 (예: "빨강,하양")
    const colorString = selectedColors.includes('전체') 
      ? undefined 
      : selectedColors.join(',');

    const searchQuery: SearchQuery = {
      shape: shape === '전체' ? undefined : shape,
      color: colorString, // 변환된 문자열 전달
      form: type === '전체' ? undefined : type,
      imprint: identifier || undefined, 
      name: product || undefined,
      company: company || undefined,
    };

    navigation.navigate('SearchResultListScreen', {
      searchQuery: searchQuery,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7FEFB' }}>
      {/* 상단 헤더 */}
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
        <View style={styles.outerBox}>
          {/* 모양, 제형은 단일 선택 */}
          {renderSingleSelectGroup('모양', shapeOptions, shape, setShape)}
          {renderSingleSelectGroup('제형', typeOptions, type, setType)}
          
          {/* 색상은 다중 선택 (커스텀 렌더링) */}
          {renderColorGroup()}

          {(
            [
              ['식별문자', identifier, setIdentifier],
              ['제품명', product, setProduct],
              ['회사명', company, setCompany],
            ] as [string, string, React.Dispatch<React.SetStateAction<string>>][]
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

          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
          >
            <Feather name="search" size={18} color="#fff" />
            <Text style={styles.searchButtonText}>검색하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  selected: { 
    borderWidth: 2, 
    borderColor: '#409F82',
    backgroundColor: '#E3F8F3' // 선택 시 배경색 살짝 변경
  },
  optionText: { fontSize: 11, color: '#484848', fontWeight: '500' },
  selectedText: { color: '#409F82', fontWeight: '700' }, // 선택 시 텍스트 진하게
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

