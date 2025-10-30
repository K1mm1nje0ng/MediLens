import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, PillResultData } from '../types/navigation';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

// AsyncStorage 임포트 및 최근 검색용 키 정의
import AsyncStorage from '@react-native-async-storage/async-storage';
const HISTORY_KEY = '@pill_search_history';

// 내비게이션 파라미터 타입 정의
type Props = NativeStackScreenProps<RootStackParamList, 'ResultScreen'>;

// 검색 결과를 AsyncStorage에 저장 (최근 5개, 중복 제거)
const saveToHistory = async (newPill: PillResultData) => {
  try {
    // 1. 기존 기록 로드
    const rawHistory = await AsyncStorage.getItem(HISTORY_KEY);
    const history: PillResultData[] = rawHistory ? JSON.parse(rawHistory) : [];

    // 2. 중복 제거
    const filteredHistory = history.filter((pill) => pill.id !== newPill.id);

    // 3. 새 항목 맨 앞 추가 및 5개로 제한
    const newHistory = [newPill, ...filteredHistory].slice(0, 5);

    // 4. 저장
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    console.log('검색 기록 저장됨:', newHistory.length, '개');
  } catch (error) {
    console.error('AsyncStorage 저장 오류:', error);
  }
};

// 알약 분석 결과 상세 화면 컴포넌트
export default function ResultScreen({ route, navigation }: Props) {
  // 내비게이션 파라미터에서 결과 데이터 추출, 이미지 로딩 상태 관리
  const { result } = route.params;
  const [isImageLoading, setIsImageLoading] = useState(true);

  // 화면 로드 시(result 변경 시) saveToHistory 함수를 호출해 검색 기록 저장
  useEffect(() => {
    if (result && result.id) {
      saveToHistory(result);
    }
  }, [result]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7FEFB' }}>
      {/* 상단 헤더 (뒤로가기, 화면 제목) */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>분석 결과</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 메인 스크롤 뷰 */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* 알약 정보 전체를 감싸는 흰색 카드 */}
        <View style={styles.outerBox}>
          {/* 카드 헤더 (아이콘, 알약 이름) */}
          <View style={styles.header}>
            <FontAwesome5
              name="capsules"
              size={28}
              color="#409F82"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.title}>
              {result.pillName || '알약명 미확인'}
            </Text>
          </View>

          {/* 알약 이미지 (네트워크 로드, 로딩 인디케이터 표시) */}
          <View style={styles.imageBox}>
            <Image
              source={{ uri: result.imageUrl }}
              style={styles.image}
              onLoadEnd={() => setIsImageLoading(false)}
              onError={() => setIsImageLoading(false)}
            />
            {isImageLoading && (
              <ActivityIndicator
                style={StyleSheet.absoluteFill}
                size="large"
                color="#409F82"
              />
            )}
          </View>

          {/* 식별 정보 섹션 (각인, 크기, 성상) */}
          <View style={styles.identBox}>
            {/* 각인 (앞/뒤) */}
            <View style={styles.markContainer}>
              <View style={styles.markBoxLeft}>
                <Text style={styles.markText}>{result.imprintFront}</Text>
              </View>
              <View style={styles.markBoxRight}>
                <Text style={styles.markText}>{result.imprintBack}</Text>
              </View>
            </View>

            {/* 크기 및 성상 정보 */}
            <View style={styles.identInfo}>
              <View style={styles.identRow}>
                <Text style={styles.identLabel}>장축(mm) |</Text>
                <Text style={styles.identValue}>{result.sizeLong}</Text>
                <Text style={styles.identLabel}>단축(mm) |</Text>
                <Text style={styles.identValue}>{result.sizeShort}</Text>
                <Text style={styles.identLabel}>두께(mm) |</Text>
                <Text style={styles.identValue}>{result.sizeThick}</Text>
              </View>

              <View style={styles.identRow}>
                <Text style={styles.identLabel}>성상 |</Text>
                <Text style={styles.identValue}>{result.description}</Text>
              </View>
            </View>
          </View>

          {/* 상세 정보 리스트 */}
          <View style={styles.infoBox}>
            <InfoRow label="전문/일반 |" value={result.type} />
            <InfoRow label="업체명 |" value={result.company} />
            <InfoRow label="주성분 |" value={result.components} />
            <InfoRow label="용법용량 |" value={result.usage} />
            <InfoRow label="효능효과 |" value={result.effects} />
            <InfoRow label="주의사항 |" value={result.warnings} />
          </View>
        </View>

        {/* '찾은 약 수정하기' 버튼 */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('DirectSearchScreen')}
        >
          <Feather
            name="edit-3"
            size={20}
            color="#1C1B14"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.buttonText}>찾은 약 수정하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// '라벨 | 값' 형태의 상세 정보 행 컴포넌트
// 긴 텍스트의 경우 '더보기/접기' 기능 제공
function InfoRow({ label, value }: { label: string; value: string }) {
  const [expanded, setExpanded] = useState(false);
  const MAX_LENGTH = 40;
  const safeValue = value || '';
  const isLong = safeValue.length > MAX_LENGTH;
  const displayText = expanded
    ? safeValue
    : safeValue.slice(0, MAX_LENGTH) + (isLong ? '...' : '');

  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>
        {displayText}{' '}
        {isLong && (
          <Text
            onPress={() => setExpanded(!expanded)}
            style={{ color: '#409F82', fontWeight: '600' }}
          >
            {expanded ? ' 접기' : ' 더보기'}
          </Text>
        )}
      </Text>
    </View>
  );
}

// 스타일 정의
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FEFB' },
  scroll: { paddingBottom: 60, paddingHorizontal: 20 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#000' },
  outerBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    marginBottom: 24,
    elevation: 3,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '600', color: '#1C1B14', flex: 1 },
  imageBox: {
    width: '100%',
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginVertical: 16,
    padding: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  identBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  markContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    elevation: 2,
  },
  markBoxLeft: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#D9D9D9',
    paddingVertical: 8,
    minHeight: 30,
  },
  markBoxRight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    minHeight: 30,
  },
  markText: { fontSize: 14, fontWeight: '700', color: '#000' },
  identInfo: { gap: 4 },
  identRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  identLabel: {
    fontWeight: '600',
    color: '#000',
    fontSize: 12.5,
    marginRight: 4,
  },
  identValue: {
    fontWeight: '600',
    fontSize: 12.5,
    color: '#000',
    marginRight: 10,
    flexShrink: 1,
  },
  infoBox: { backgroundColor: '#FFFFFF', padding: 8 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 6,
  },
  infoLabel: {
    fontWeight: '700',
    color: '#1C1B14',
    fontSize: 16,
    textAlign: 'right',
    marginRight: 4,
    width: 80,
  },
  infoValue: {
    flex: 1,
    color: '#484848',
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    height: 50,
    marginTop: 10,
    marginBottom: 20,
    elevation: 2,
  },
  buttonText: { fontSize: 18, fontWeight: '500', color: '#000' },
});



