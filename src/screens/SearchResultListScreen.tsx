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
  SearchQuery, 
} from '../types/navigation';
// 아이콘 임포트
import Feather from 'react-native-vector-icons/Feather';
// API 함수 임포트
import { getDetail, postSearch } from '../api/pillApi';
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

// 검색 결과 '목록'을 표시하는 화면
export default function SearchResultListScreen() {
  // 네비게이션 및 라우트 훅
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();

  // 상태 관리
  const [isLoading, setIsLoading] = useState(false); // 상세 정보 로딩
  const [isListLoading, setListLoading] = useState(false); // 목록 로딩
  
  // `imageResults`  또는 `searchQuery` 를 파라미터로 받음
  const { imageResults, searchQuery } = route.params;

  // 페이지네이션 상태
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [results, setResults] = useState<PillSearchSummary[]>([]);

  // `searchQuery`로 API 호출
  const loadSearchResults = useCallback(async (query: SearchQuery, pageNum: number) => {
    // 무한 루프 방지
    
    setListLoading(true);
    try {
      // `page` 파라미터를 포함하여 `postSearch` API 호출
      const response = await postSearch(query, pageNum); 
      
      // `pill_results`와 `total_pages`를 상태에 저장
      setResults(prev => 
        pageNum === 1 ? response.pill_results : [...prev, ...response.pill_results]
      );
      setTotalPages(response.total_pages);
      setPage(pageNum); // 현재 페이지 번호 업데이트

    } catch (error: any) {
      Alert.alert('오류', error.message || '검색 결과를 불러오는데 실패했습니다.');
    } finally {
      setListLoading(false);
    }
  
  }, []); 

  // 화면이 처음 로드될 때 실행
  useEffect(() => {
    if (searchQuery) {
      // '직접 검색' (searchQuery)으로 진입한 경우: page 1로 API 호출
      loadSearchResults(searchQuery, 1);
    } else if (imageResults) {
      // '이미지 분석' (imageResults)으로 진입한 경우: 1D 배열을 results로 설정
      setResults(imageResults);
      setTotalPages(1); // 이미지 검색은 페이지네이션이 없음
    }
  }, [searchQuery, imageResults, loadSearchResults]); // 의존성 배열

  // 목록에서 알약 항목을 탭했을 때 핸들러
  const handlePillSelect = async (pill: PillSearchSummary) => {
    setIsLoading(true);
    try {
      // pill.id (code)로 상세 정보 API 호출
      const detailResult = await getDetail(pill.id);
      // ResultScreen으로 이동 (상세 정보 전달)
      navigation.navigate('ResultScreen', { result: detailResult });
    } catch (error: any) {
      Alert.alert('오류', error.message || '상세 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // FlatList의 끝에 도달하면 이 함수가 호출됨
  const handleLoadMore = () => {
    // - '직접 검색'일 때만
    // - (page=1)이 (totalPages=60)보다 작고
    // - (isListLoading=false) 현재 로딩 중이 아닐 때만!
    if (searchQuery && page < totalPages && !isListLoading) {
      // 'page + 1'로 다음 페이지 API 호출
      loadSearchResults(searchQuery, page + 1);
    }
  };

  // FlatList의 각 항목(알약)을 렌더링
  const renderItem = ({ item, index }: { item: PillSearchSummary; index: number }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handlePillSelect(item)}
      key={`${item.id}-${index}`}
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
    // 1페이지 로드 중에는 스피너 숨김 (초기 로딩이므로)
    if (!isListLoading || page === 1) return null;
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

      {/* 결과 목록 FlatList */}
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.scroll}
        ListFooterComponent={renderFooter} // 로딩 스피너
        ListEmptyComponent={renderEmpty} // 결과 없음
        onEndReached={handleLoadMore} // 0단계: 사용자가 스크롤을 끝까지 내리면...
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