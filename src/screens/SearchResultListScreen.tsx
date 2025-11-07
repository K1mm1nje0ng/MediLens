import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// 네비게이션 훅 임포트
import {
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// 타입 임포트
import {
  RootStackParamList,
  PillSearchSummary,
  SearchQuery, // 1. (수정) 'SearchQuery' 타입 임포트 추가
} from '../types/navigation';
// 아이콘 임포트
import Feather from 'react-native-vector-icons/Feather';
// API 함수 임포트
import { getDetail, postSearch } from '../api/pillApi';
// 2. (수정) 'LoadingOverlay' 컴포넌트 임포트 추가
import LoadingOverlay from '../components/LoadingOverlay'; 

// 이 스크린에서 사용할 네비게이션과 라우트 prop 타입
type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SearchResultListScreen'
>;
type ScreenRouteProp = RouteProp<
  RootStackParamList,
  'SearchResultListScreen'
>;

// 검색 결과 '목록' (1D)을 표시하는 화면
export default function SearchResultListScreen() {
  // 네비게이션 및 라우트 훅
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();

  // 상태 관리
  const [isLoading, setIsLoading] = useState(false); // 상세 정보 로딩
  const [isListLoading, setListLoading] = useState(false); // 목록 로딩 (초기/추가)
  
  // `imageResults` (1D) 또는 `searchQuery` (객체)를 파라미터로 받음
  const { imageResults, searchQuery } = route.params;

  // 페이지네이션 상태
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [results, setResults] = useState<PillSearchSummary[]>([]);

  // `searchQuery` (직접 검색)로 API를 호출하는 함수
  const loadSearchResults = useCallback(async (query: SearchQuery, pageNum: number) => {
    // 중복/초과 로드 방지
    // (pageNum === 1은 초기 로드이므로 totalPages 검사 안 함)
    if (isListLoading || (pageNum > totalPages && pageNum !== 1)) return; 
    
    setListLoading(true);
    try {
      // 1. `page` 파라미터를 포함하여 `postSearch` API 호출
      const response = await postSearch(query, pageNum); 
      
      // 2. `pill_results`와 `total_pages`를 상태에 저장
      setResults(prev => 
        pageNum === 1 ? response.pill_results : [...prev, ...response.pill_results]
      );
      setTotalPages(response.total_pages);
      setPage(pageNum);

    } catch (error: any) {
      Alert.alert('오류', error.message || '검색 결과를 불러오는데 실패했습니다.');
    } finally {
      setListLoading(false);
    }
  }, [isListLoading, totalPages]); // 이 함수가 의존하는 상태들

  // 화면이 처음 로드될 때 실행
  useEffect(() => {
    if (searchQuery) {
      // 1. '직접 검색' (searchQuery)으로 진입한 경우: page 1로 API 호출
      loadSearchResults(searchQuery, 1);
    } else if (imageResults) {
      // 2. '이미지 분석' (imageResults)으로 진입한 경우: 1D 배열을 results로 설정
      //    (imageResults는 1D 배열이라고 가정, 2D 배열 로직은 ImageResultGroupScreen이 처리)
      setResults(imageResults);
      setTotalPages(1); // 이미지 검색은 페이지네이션이 없음
    }
  }, [searchQuery, imageResults, loadSearchResults]); // 의존성 배열

  // 목록에서 알약 항목을 탭했을 때 핸들러
  const handlePillSelect = async (pill: PillSearchSummary) => {
    setIsLoading(true);
    try {
      // 1. pill.id (code)로 상세 정보 API 호출
      const detailResult = await getDetail(pill.id);
      // 2. ResultScreen으로 이동 (상세 정보 전달)
      navigation.navigate('ResultScreen', { result: detailResult });
    } catch (error: any) {
      Alert.alert('오류', error.message || '상세 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // FlatList의 끝에 도달했을 때 다음 페이지 로드
  const handleLoadMore = () => {
    // 1. '직접 검색' (searchQuery)일 때만 다음 페이지 로드
    // 2. 현재 페이지가 총 페이지보다 작을 때만
    if (searchQuery && page < totalPages && !isListLoading) {
      loadSearchResults(searchQuery, page + 1);
    }
  };

  // FlatList의 각 항목(알약)을 렌더링
  const renderItem = ({ item }: { item: PillSearchSummary }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handlePillSelect(item)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.pillName}
        </Text>
      </View>
      <Feather name="chevron-right" size={20} color="#666" />
    </TouchableOpacity>
  );

  // FlatList의 하단 (로딩 스피너) 렌더링
  const renderFooter = () => {
    if (!isListLoading) return null; // 로딩 중이 아니면 숨김
    return <ActivityIndicator size="large" color="#409F82" style={{ marginVertical: 20 }} />;
  };

  // (추가) FlatList의 '결과 없음' 렌더링
  const renderEmpty = () => {
    if (isListLoading) return null; // 초기 로딩 중에는 숨김
    return (
      <View style={styles.emptyContainer}>
        <Feather name="search" size={50} color="#ccc" />
        <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7FEFB' }}>
      {/* 상단 헤더 (뒤로가기, 화면 제목) */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>검색 결과</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* (수정) 결과 목록 FlatList */}
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.scroll}
        ListFooterComponent={renderFooter} // 로딩 스피너
        ListEmptyComponent={renderEmpty} // 결과 없음
        onEndReached={handleLoadMore} // 다음 페이지 로드
        onEndReachedThreshold={0.5} // 50% 지점에서 로드
      />

      {/* 상세 정보 로딩 시 전체 화면 오버레이 */}
      <LoadingOverlay visible={isLoading} message="상세 정보 로딩 중..." />
    </SafeAreaView>
  );
}

// 화면 스타일 정의
const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 60, flexGrow: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#000' },
  // 목록 아이템 컨테이너
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  // 알약 이미지
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 15,
  },
  // 텍스트 영역 (이름)
  itemTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  // 알약 이름
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  // '결과 없음' 컨테이너
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
});