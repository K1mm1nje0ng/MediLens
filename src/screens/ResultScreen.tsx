import React, { useState } from 'react';
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
// 타입 임포트 (PillResultData 사용)
import { RootStackParamList, PillResultData } from '../types/navigation';
// 아이콘 임포트
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

// 내비게이션 스택으로부터 `ResultScreen`이 받을 파라미터 타입
type Props = NativeStackScreenProps<RootStackParamList, 'ResultScreen'>;

// 알약 분석 결과 상세 정보를 표시하는 메인 화면 컴포넌트
export default function ResultScreen({ route, navigation }: Props) {
  // `route.params`로부터 전달받은 알약 결과 데이터 추출
  const { result } = route.params as { result: PillResultData };
  // 네트워크 이미지 로딩 상태 관리
  const [isImageLoading, setIsImageLoading] = useState(true);

  // 이미지 로드 실패 시 에러 로그 콜백
  const handleImageError = (error: any) => {
    console.error('이미지 로드 실패:', error.nativeEvent.error);
    setIsImageLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7FEFB' }}>
      {/* 화면 상단 헤더: 뒤로가기 버튼과 '분석 결과' 타이틀 */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>분석 결과</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 알약의 모든 상세 정보를 포함하는 메인 스크롤 뷰 */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* 모든 정보를 감싸는 메인 카드 */}
        <View style={styles.outerBox}>
          {/* 알약 아이콘과 알약 이름 */}
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

          {/* 알약 이미지 (네트워크 로드) */}
          <View style={styles.imageBox}>
            <Image
              source={{ uri: result.imageUrl }}
              style={styles.image}
              onLoadEnd={() => setIsImageLoading(false)}
              onError={handleImageError}
            />
            {isImageLoading && (
              <ActivityIndicator
                style={StyleSheet.absoluteFill}
                size="large"
                color="#409F82"
              />
            )}
          </View>

          {/* 알약의 물리적 식별 정보 (최종 명세 반영) */}
          <View style={styles.identBox}>
            {/* 각인 (앞/뒤) */}
            <View style={styles.markContainer}>
              <View style={styles.markBoxLeft}>
                <Text style={styles.markText}>{result.imprint1}</Text>
              </View>
              <View style={styles.markBoxRight}>
                <Text style={styles.markText}>{result.imprint2}</Text>
              </View>
            </View>
            
            {/* 크기, 모양, 형태, 색상 */}
            <View style={styles.identInfo}>
              {/* 크기 (장축, 단축, 두께) */}
              <View style={styles.identRow}>
                <Text style={styles.identLabel}>크기(mm) |</Text>
                <Text style={styles.identValue}>
                  {result.sizeLong} x {result.sizeShort} x {result.sizeThick}
                </Text>
              </View>
              
              {/* 모양, 형태 */}
              <View style={styles.identRow}>
                <Text style={styles.identLabel}>모양/형태 |</Text>
                <Text style={styles.identValue}>
                  {result.shape} / {result.form}
                </Text>
              </View>
              
              {/* 색상 */}
              <View style={styles.identRow}>
                <Text style={styles.identLabel}>색상 |</Text>
                <Text style={styles.identValue}>
                  {result.color1}
                  {result.color2 ? ` / ${result.color2}` : ''}
                </Text>
              </View>
            </View>
          </View>

          {/* 알약의 상세 정보 (InfoRow 컴포넌트 사용) */}
          <View style={styles.infoBox}>
            <InfoRow label="제품명" value={result.pillName} />
            <InfoRow label="업체명" value={result.company} />
            <InfoRow label="효능" value={result.effects} />
            <InfoRow label="사용법" value={result.usage} />
            <InfoRow label="주의사항" value={result.warnings} />
            <InfoRow label="주의사항경고" value={result.warningAlert} />
            <InfoRow label="부작용" value={result.sideEffects} />
            <InfoRow label="보관법" value={result.storage} />
          </View>
        </View>

        {/* '수정하기' 버튼: 탭하면 `DirectSearchScreen`으로 이동 */}
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

// '라벨 | 값' 형태의 정보 행을 렌더링하는 재사용 컴포넌트
function InfoRow({ label, value }: { label: string; value: string }) {
  // 텍스트가 40자를 초과할 경우 '더보기/접기' 상태
  const [expanded, setExpanded] = useState(false);
  const MAX_LENGTH = 40;

  // 값이 null/undefined일 경우 빈 문자열로 처리
  const safeValue = value || '';
  // 값이 비어있으면 렌더링하지 않음
  if (!safeValue) {
    return null;
  }
  
  const isLong = safeValue.length > MAX_LENGTH;
  // 표시할 텍스트 (더보기/접기 적용)
  const displayText = expanded
    ? safeValue
    : safeValue.slice(0, MAX_LENGTH) + (isLong ? '...' : '');

  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>
        {displayText}{' '}
        {isLong && ( // 텍스트가 길 때만 '더보기/접기' 버튼 표시
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

// 화면 스타일 정의
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FEFB' },
  scroll: { paddingBottom: 60, paddingHorizontal: 20 },
  // 헤더
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#000' },
  // 메인 카드
  outerBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    marginBottom: 24,
    elevation: 3,
  },
  // '알약명' 헤더
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '600', color: '#1C1B14', flex: 1 },
  // 이미지
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
  // 식별 정보 (각인, 크기, 성상)
  identBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  // 각인 (앞/뒤)
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
  // 크기, 모양, 형태, 색상
  identInfo: { gap: 6 },
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
  // 상세 정보 리스트
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
    textAlign: 'left', // 왼쪽 정렬
    marginRight: 4,
    width: 110, // '주의사항경고'를 위해 너비 조정
  },
  infoValue: {
    flex: 1,
    color: '#484848',
    fontSize: 14,
    lineHeight: 20,
  },
  // '수정하기' 버튼
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


