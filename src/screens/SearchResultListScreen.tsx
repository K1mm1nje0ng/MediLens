import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// 네비게이션 임포트
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
// 아이콘, API, 컴포넌트 임포트
import Feather from 'react-native-vector-icons/Feather';
import { getDetail } from '../api/pillApi';
import LoadingOverlay from '../components/LoadingOverlay';

// 내비게이션 파라미터 타입
type Props = NativeStackScreenProps<
  RootStackParamList,
  'SearchResultListScreen'
>;

// 직접 검색 결과 목록 표시하는 화면
export default function SearchResultListScreen({ route, navigation }: Props) {
  // 내비게이션 파라미터에서 검색 결과 목록 추출
  const { searchResults } = route.params;
  // 상세 정보 로딩 상태 (getDetail 호출 시)
  const [isLoading, setIsLoading] = useState(false);

  // 목록의 항목을 탭했을 때 실행되는 핸들러
  const handleItemPress = async (pillId: string) => {
    setIsLoading(true);
    try {
      // 1. 탭한 항목의 ID로 getDetail API 호출 (상세 정보 요청)
      const detailResult = await getDetail(pillId);

      // 2. 상세 정보(detailResult)를 ResultScreen으로 전달
      navigation.navigate('ResultScreen', { result: detailResult });
    } catch (error) {
      console.error('상세 정보 로드 오류:', error);
      Alert.alert('오류', '상세 정보를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7FEFB' }}>
      {/* 상단 헤더 */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>검색 결과</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 로딩 오버레이 (getDetail 호출 시) */}
      <LoadingOverlay visible={isLoading} message="상세 정보 로드 중..." />

      {/* 메인 스크롤 뷰 */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scroll}
      >
        {/* 검색 결과가 0건일 경우 */}
        {searchResults.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="search" size={48} color="#999" />
            <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
          </View>
        ) : (
          // 검색 결과 목록 렌더링
          searchResults.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemCard}
              onPress={() => handleItemPress(item.id)}
            >
              {/* 알약 요약 이미지 */}
              <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
              <View style={styles.itemTextContainer}>
                {/* 알약 이름 */}
                <Text style={styles.itemTitle}>{item.pillName}</Text>
                {/* 제조사 */}
                <Text style={styles.itemSubtitle}>{item.company}</Text>
                {/* 성상 (한 줄, '...') */}
                <Text
                  style={styles.itemDescription}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// 스타일 정의
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FEFB' },
  scroll: { padding: 20 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#000' },
  // 검색 결과 목록 아이템 카드
  itemCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  // 목록 아이템 이미지
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    marginRight: 15,
  },
  itemTextContainer: {
    flex: 1,
  },
  // 목록 아이템 제목
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  // 목록 아이템 부제목
  itemSubtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  // 목록 아이템 설명
  itemDescription: {
    fontSize: 12,
    color: '#777',
  },
  // 검색 결과 없음
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});