import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// 네비게이션 훅 및 타입 임포트
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, PillSearchSummary } from '../types/navigation';
// 아이콘 임포트
import Feather from 'react-native-vector-icons/Feather';

// 내비게이션 스택으로부터 받을 파라미터 타입
type Props = NativeStackScreenProps<
  RootStackParamList,
  'ImageResultGroupScreen'
>;

// 이미지 분석 결과(2D 배열)를 그룹으로 보여주는 화면
export default function ImageResultGroupScreen({ route, navigation }: Props) {
  // PillSearchScreen에서 전달받은 2D 배열
  const { imageResults } = route.params;

  // 그룹(1D 배열)을 탭했을 때의 핸들러
  const handleGroupPress = (group: PillSearchSummary[]) => {
    // 1D 배열을 SearchResultListScreen으로 전달
    navigation.navigate('SearchResultListScreen', {
      searchResults: group,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7FEFB' }}>
      {/* 상단 헤더 (뒤로가기, 화면 제목) */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>분석된 알약 그룹</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 그룹 목록 스크롤 뷰 */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.infoText}>
          사진에서 {imageResults.length}개의 알약 그룹이 감지되었습니다.
        </Text>

        {/* 2D 배열을 순회하며 그룹 생성 */}
        {imageResults.map((group, index) => {
          // 각 그룹의 첫 번째 항목(가장 유력한 후보)을 대표로 표시
          const representative = group[0];
          if (!representative) return null; // 빈 그룹일 경우 건너뜀

          return (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => handleGroupPress(group)}
            >
              {/* 대표 알약 이미지 */}
              <Image
                source={{ uri: representative.imageUrl }}
                style={styles.image}
              />
              {/* 정보 텍스트 */}
              <View style={styles.textContainer}>
                <Text style={styles.groupTitle}>알약 {index + 1}</Text>
                <Text style={styles.pillName} numberOfLines={1}>
                  {representative.pillName}
                </Text>
                <Text style={styles.candidateCount}>
                  ({group.length}개의 후보 보기)
                </Text>
              </View>
              {/* 화살표 아이콘 */}
              <Feather name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

// 화면 스타일 정의
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FEFB' },
  scroll: { paddingHorizontal: 20, paddingBottom: 60, paddingTop: 10 },
  // 헤더
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
  // 안내 텍스트
  infoText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  // 알약 그룹 카드
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  // 대표 이미지
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    marginRight: 15,
  },
  // 텍스트 영역
  textContainer: {
    flex: 1,
  },
  // "알약 1"
  groupTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  // "타이레놀..."
  pillName: {
    fontSize: 14,
    color: '#444',
    marginVertical: 4,
  },
  // "(N개 후보)"
  candidateCount: {
    fontSize: 12,
    color: '#409F82',
    fontWeight: '500',
  },
});