import React, { useState, useEffect } from 'react';
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

// 네비게이션 prop 타입
type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DirectSearchScreen'
>;

// Route 타입
type DirectSearchScreenRouteProp = RouteProp<
  RootStackParamList, 
  'DirectSearchScreen'
>;

// 알약 식별 정보 기반 직접 검색 화면
export default function DirectSearchScreen() {
  // 네비게이션 훅
  const navigation = useNavigation<NavigationProp>();
  // 라우트 훅
  const route = useRoute<DirectSearchScreenRouteProp>();

  // 모든 검색 조건 상태를 배열로 관리하여 다중 선택 지원
  const [selectedShapes, setSelectedShapes] = useState<string[]>(['전체']);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['전체']);
  const [selectedColors, setSelectedColors] = useState<string[]>(['전체']);
  
  const [identifier, setIdentifier] = useState(''); 
  const [product, setProduct] = useState(''); 
  const [company, setCompany] = useState(''); 

  // 화면 진입 시 파라미터 확인하여 상태 채워넣기
  useEffect(() => {
    if (route.params?.initialQuery) {
      const q = route.params.initialQuery;
      
      // 1. 모양
      if (q.shape && q.shape !== '전체') {
        setSelectedShapes(q.shape.split(','));
      } else {
        setSelectedShapes(['전체']);
      }

      // 2. 색상
      if (q.color && q.color !== '전체') {
        setSelectedColors(q.color.split(','));
      } else {
        setSelectedColors(['전체']);
      }
      
      // 3. 제형
      if (q.form && q.form !== '전체') {
        const rawForms = q.form.split(',');
        const mappedForms = rawForms.map(f => mapFormToCategory(f));
        setSelectedTypes(Array.from(new Set(mappedForms)));
      } else {
        setSelectedTypes(['전체']);
      }

      setIdentifier(q.imprint || '');
      setProduct(q.name || '');
      setCompany(q.company || '');
    }
  }, [route.params]);

  // 제형 문자열을 카테고리로 매핑
  const mapFormToCategory = (formVal: string): string => {
    if (typeOptions.includes(formVal)) return formVal;
    if (formVal.includes('정')) return '정제';
    if (formVal.includes('연질')) return '연질캡슐';
    if (formVal.includes('캡슐')) return '경질캡슐';
    return formVal;
  };

  // 다중 선택 토글 로직
  // limit: 0이면 무제한 선택
  const toggleSelection = (
    item: string,
    currentList: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    limit: number = 0
  ) => {
    // 1. '전체'를 선택한 경우 -> 초기화
    if (item === '전체') {
      setList(['전체']);
      return;
    }

    // '전체'가 아닌 항목을 선택했을 때
    let newList = currentList.filter((i) => i !== '전체');

    if (newList.includes(item)) {
      // 이미 선택된 항목이면 제거
      newList = newList.filter((i) => i !== item);
    } else {
      // 새로운 항목 추가 전 개수 제한 확인 (여기서는 모두 0으로 보내서 무제한)
      if (limit > 0 && newList.length >= limit) {
        Alert.alert('알림', `최대 ${limit}개까지만 선택 가능합니다.`);
        return; 
      }
      newList.push(item);
    }

    // 다 지워서 아무것도 없으면 '전체'로 복귀
    if (newList.length === 0) {
      setList(['전체']);
    } else {
      setList(newList);
    }
  };

  // 옵션 그룹 렌더링 함수
  const renderOptionGroup = (
    label: string,
    options: string[],
    currentList: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => (
    <View style={styles.groupContainer}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.label}> |</Text>
      </View>

      <View style={styles.optionContainer}>
        {options.map((opt) => {
          const isSelected = currentList.includes(opt);
          // limit을 0으로 전달하여 모든 항목 무제한 선택 가능
          const limit = 0; 

          return (
            <TouchableOpacity
              key={opt}
              style={[styles.optionButton, isSelected && styles.selected]}
              onPress={() => toggleSelection(opt, currentList, setList, limit)}
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
    // 배열을 콤마 문자열로 변환 ("전체"가 포함되어 있으면 undefined로 보냄)
    const shapeStr = selectedShapes.includes('전체') ? undefined : selectedShapes.join(',');
    const typeStr = selectedTypes.includes('전체') ? undefined : selectedTypes.join(',');
    const colorStr = selectedColors.includes('전체') ? undefined : selectedColors.join(',');

    const searchQuery: SearchQuery = {
      shape: shapeStr,
      form: typeStr,
      color: colorStr,
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
          {/* 모든 그룹 무제한 다중 선택 적용 */}
          {renderOptionGroup('모양', shapeOptions, selectedShapes, setSelectedShapes)}
          {renderOptionGroup('제형', typeOptions, selectedTypes, setSelectedTypes)}
          {renderOptionGroup('색상', colorOptions, selectedColors, setSelectedColors)}

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
    backgroundColor: '#E3F8F3'
  },
  optionText: { fontSize: 11, color: '#484848', fontWeight: '500' },
  selectedText: { color: '#409F82', fontWeight: '700' },
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

