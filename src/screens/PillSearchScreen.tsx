import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
// 아이콘 임포트
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
// 네비게이션 훅 임포트
import {
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// 타입 임포트
import { RootStackParamList, PillSearchSummary } from '../types/navigation';
// 커스텀 훅 임포트 (카메라, 갤러리)
import { useCamera } from '../hooks/useCamera';
import { useGallery } from '../hooks/useGallery';
// 컴포넌트 임포트
import LoadingOverlay from '../components/LoadingOverlay';
// API 함수 임포트
import {
  postPredict,
  getStatus,
  getResult,
  getRecent,
  getDetail,
} from '../api/pillApi';

// 카메라/갤러리 훅이 반환하는 이미지 에셋 타입
interface ImageAsset {
  uri?: string;
  fileName?: string;
  type?: string; // postPredict를 위해 type 추가
}

// 이 스크린에서 사용할 네비게이션 prop 타입
type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PillSearchScreen'
>;

// 알약 검색 메인 화면 컴포넌트
export default function PillSearchScreen() {
  // 네비게이션 훅 사용
  const navigation = useNavigation<NavigationProp>();

  // 로딩 오버레이, 메시지, 최근 검색 기록 상태 관리
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  // (수정) 최근 기록 타입은 1D 배열 (PillSearchSummary[])
  const [history, setHistory] = useState<PillSearchSummary[]>([]);

  // 커스텀 훅 사용
  const { openCamera } = useCamera();
  const { openGallery } = useGallery();

  // (수정) GET /recent API로 최근 검색 기록(1D)을 로드
  const loadHistory = async () => {
    try {
      // (수정) AsyncStorage -> getRecent()
      const historyData = await getRecent();
      // (수정) 2개만 보여줌
      setHistory(historyData.slice(0, 2));
    } catch (error: any) {
      console.error('getRecent API 오류:', error.message);
      setHistory([]);
    }
  };

  // 화면이 포커스될 때마다(돌아올 때마다) loadHistory 함수 호출
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, []),
  );

  // '이미지 분석' API 호출 (2D 배열 처리)
  const handleImageAnalysis = async (image: ImageAsset) => {
    // 1. uri 검사
    if (!image.uri) {
      Alert.alert('오류', '이미지 URI를 찾을 수 없습니다.');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('이미지 분석을 요청합니다...');
      const { task_id } = await postPredict(image); // 1. 분석 요청

      // 2초마다 상태를 체크하는 폴링(Polling) 구현
      let status = 'PENDING';
      let attempts = 0;
      while (status === 'PENDING' && attempts < 30) { // 30번(60초) 시도
        attempts++;
        setMessage(`분석 상태 확인 중...`); // 카운터 텍스트 제거
        const statusResponse = await getStatus(task_id); // 2. 상태 확인
        status = statusResponse.status;

        if (status === 'SUCCESS') break; // 성공 시 루프 탈출
        await new Promise<void>((resolve) => setTimeout(resolve, 2000)); // 2초 대기
      }

      // 3. 최종 상태 확인
      if (status === 'SUCCESS') {
        setMessage('결과를 가져오는 중입니다...');
        // 4. (수정) getResult는 이제 '2D 배열' (PillSearchSummary[][])을 반환
        const resultGroups = await getResult(task_id);

        if (!resultGroups || resultGroups.length === 0) {
          Alert.alert(
            '분석 실패',
            '이미지와 일치하는 알약을 찾을 수 없습니다.',
          );
        } else {
          // 5. (수정) 'ImageResultGroupScreen'(신규)으로 2D 배열 전달
          navigation.navigate('ImageResultGroupScreen', {
            imageResults: resultGroups,
          });
        }
      } else if (status === 'PENDING') {
        Alert.alert('시간 초과', '알약 분석이 오래 걸리고 있습니다.');
      } else {
        Alert.alert('오류', '알약 분석에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('이미지 분석 오류:', err.message);
      Alert.alert('오류', err.message || '알약을 분석하는 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setMessage('');
    }
  };

  // '카메라로 알약 검색' 버튼 핸들러
  const handleTakePhoto = async () => {
    try {
      const image = await openCamera();
      if (image && image.uri) {
        await handleImageAnalysis(image as ImageAsset);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // '사진으로 알약 검색' 버튼 핸들러
  const handleSelectPhoto = async () => {
    try {
      const image = await openGallery();
      if (image && image.uri) {
        await handleImageAnalysis(image as ImageAsset);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // (수정) '최근 검색 기록' 탭 핸들러 (getDetail 호출)
  const handleRecentSearch = async (pill: PillSearchSummary) => {
    setIsLoading(true);
    setMessage('상세 정보를 불러오는 중...');
    try {
      // 1. pill.id (code)로 상세 정보 API 호출
      const detailResult = await getDetail(pill.id);
      // 2. ResultScreen으로 이동
      navigation.navigate('ResultScreen', { result: detailResult });
    } catch (error: any) {
      console.error('getDetail API 오류:', error.message);
      Alert.alert('오류', error.message || '상세 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 메인 스크롤 뷰
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* 상단 '프로그램 이름' 타이틀 */}
      <View style={styles.titleRow}>
        <FontAwesome5
          name="capsules"
          size={40}
          color="#409F82"
          style={{ marginRight: 15 }}
        />
        <Text style={styles.title}>프로그램 이름</Text>
      </View>

      {/* '무슨 약을 찾으시나요?' 검색 옵션 카드 */}
      <View style={styles.searchCard}>
        <Text style={styles.header}>무슨 약을 찾으시나요?</Text>

        {/* 1. 카메라로 알약 검색 */}
        <TouchableOpacity
          style={[styles.optionBox, { backgroundColor: '#409F82' }]}
          onPress={handleTakePhoto}
        >
          <Feather name="camera" size={35} color="#fff" />
          <Text style={[styles.optionText, { color: '#fff' }]}>
            카메라로 알약 검색
          </Text>
        </TouchableOpacity>

        {/* 2. 사진으로 알약 검색 */}
        <TouchableOpacity
          style={[styles.optionBox, { backgroundColor: '#A8D4C5' }]}
          onPress={handleSelectPhoto}
        >
          <Feather name="image" size={35} color="#1C1B14" />
          <Text style={styles.optionText}>사진으로 알약 검색</Text>
        </TouchableOpacity>

        {/* 3. 직접 알약 검색 */}
        <TouchableOpacity
          style={[styles.optionBox, { backgroundColor: '#fff' }]}
          onPress={() => navigation.navigate('DirectSearchScreen')}
        >
          <Feather name="search" size={35} color="#409F82" />
          <Text style={styles.optionText}>직접 알약 검색</Text>
        </TouchableOpacity>
      </View>

      {/* '최근 검색 기록' 카드 */}
      <View style={styles.recentCard}>
        {/* 카드 헤더 */}
        <View style={styles.recentHeader}>
          <Feather
            name="archive"
            size={24}
            color="#000"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.recentTitle}>최근 검색 기록</Text>
        </View>

        {/* 기록이 없거나, 최근 2개 항목 렌더링 */}
        {history.length === 0 ? (
          // '기록 없음' 텍스트
          <Text style={styles.recentEmpty}>최근 검색 기록이 없습니다.</Text>
        ) : (
          <>
            {/* 최근 검색 상위 2개 목록 렌더링 (이미지, 텍스트) */}
            {history.map((pill) => (
              <TouchableOpacity
                key={pill.id}
                style={styles.recentItem}
                activeOpacity={0.7}
                onPress={() => handleRecentSearch(pill)} // (수정) getDetail 호출
              >
                {/* 알약 이미지 */}
                <Image
                  source={{ uri: pill.imageUrl }}
                  style={styles.recentIcon}
                />
                {/* 알약 이름 (한 줄, '...') */}
                <Text
                  style={styles.recentText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {pill.pillName}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </View>

      {/* 로딩 오버레이 컴포넌트 */}
      <LoadingOverlay visible={isLoading} message={message} />
    </ScrollView>
  );
}

// 화면 스타일 정의
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FFFC' },
  // 스크롤 뷰 내부 컨텐츠 스타일 (상단 여백 40)
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 40, // 상단 여백
    alignItems: 'stretch',
    paddingBottom: 50,
  },
  // '프로그램 이름' 타이틀 영역 (세로 여백 50)
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 50, // 세로 여백
  },
  title: { fontSize: 36, fontWeight: '600', color: '#000' },
  // 검색 옵션 카드 (간격 축소)
  searchCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 15, // 내부 여백
    marginBottom: 20, // 하단 여백
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // '무슨 약을 찾으시나요?' 헤더 (간격 축소)
  header: {
    fontSize: 27,
    fontWeight: '500',
    textAlign: 'center',
    marginVertical: 20, // 세로 여백
  },
  // 카메라/사진/검색 버튼 (요청하신 값으로 수정)
  optionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 25, // 버튼 높이
    marginVertical: 13, // 버튼 간 격
  },
  optionText: {
    fontSize: 20,
    fontWeight: '500',
    marginLeft: 10,
    color: '#000',
  },
  // '최근 검색 기록' 카드
  recentCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  recentTitle: { fontSize: 18, fontWeight: '600', color: '#000' },
  // 최근 검색 항목 (목록)
  recentItem: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  // 최근 검색 아이콘 (이미지)
  recentIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#E5E7EB', // 이미지 로딩 중 배경
    marginRight: 16,
  },
  // 최근 검색 텍스트
  recentText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1B14',
    flexShrink: 1, // 텍스트가 길어질 때 줄어들도록 설정
  },
  // '기록 없음' 텍스트
  recentEmpty: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
});