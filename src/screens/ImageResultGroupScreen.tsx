import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
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
import { RootStackParamList, PillSearchSummary } from '../types/navigation';
// 아이콘 임포트
import Feather from 'react-native-vector-icons/Feather';

// 이 스크린에서 사용할 네비게이션과 라우트 prop 타입
type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ImageResultGroupScreen'
>;
type ScreenRouteProp = RouteProp<
  RootStackParamList,
  'ImageResultGroupScreen'
>;

// 이미지 분석 결과 (2D 배열)를 '그룹'으로 묶어 보여주는 화면
export default function ImageResultGroupScreen() {
  // 네비게이션 및 라우트 훅
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();

  // `PillSearchScreen`으로부터 2D 배열(`imageResults`)을 받음
  const { imageResults } = route.params;

  // '알약 1', '알약 2' 그룹을 탭했을 때 핸들러
  const handleGroupSelect = (group: PillSearchSummary[]) => {
    // 1. 선택한 그룹(1D 배열)의 후보 목록을 `SearchResultListScreen`으로 전달
    navigation.navigate('SearchResultListScreen', {
      imageResults: group, // 1D 배열 전달
    });
  };

  // FlatList의 각 항목(알약 그룹)을 렌더링
  const renderItem = ({ item, index }: { item: PillSearchSummary[], index: number }) => {
    // 2D 배열의 각 1D 배열(group)을 렌더링
    // 각 그룹의 '첫 번째' 알약을 대표 이미지/이름으로 사용
    const representativePill = item[0];
    if (!representativePill) return null; // 빈 그룹은 렌더링 안 함

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => handleGroupSelect(item)} // 1D 배열(group) 전달
      >
        {/* 대표 알약 이미지 */}
        <Image 
          source={{ uri: representativePill.imageUrl }} 
          style={styles.itemImage} 
        />
        {/* 그룹 정보 (알약 N, 후보 N개) */}
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemTitle}>알약 {index + 1}</Text>
          <Text style={styles.itemSubtitle}>
            {representativePill.pillName} (외 {item.length - 1}개 후보)
          </Text>
        </View>
        <Feather name="chevron-right" size={20} color="#666" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7FEFB' }}>
      {/* 상단 헤더 (뒤로가기, 화면 제목) */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>이미지 분석 결과</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 알약 그룹 목록 (FlatList) */}
      <FlatList
        data={imageResults} // 2D 배열을 data로 사용
        renderItem={renderItem}
        keyExtractor={(item, index) => `group-${index}`}
        contentContainerStyle={styles.scroll}
        ListHeaderComponent={() => (
          <Text style={styles.infoText}>
            사진에서 {imageResults.length}개의 알약 그룹을 찾았습니다.
          </Text>
        )}
      />
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
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#000' },
  // 안내 텍스트
  infoText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
  },
  // 목록 아이템 컨테이너 (알약 그룹)
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
  // 대표 알약 이미지
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 15,
  },
  // 텍스트 영역 (그룹명, 후보 개수)
  itemTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  // 그룹명 (알약 N)
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  // 후보 정보 (대표 이름 + 외 N개)
  itemSubtitle: {
    fontSize: 13,
    color: '#666',
  },
});