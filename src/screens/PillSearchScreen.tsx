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
// 타입 임포트 (PillResultData가 아닌 PillSearchSummary 사용)
import { RootStackParamList, PillSearchSummary } from '../types/navigation';
// 커스텀 훅 임포트 (카메라, 갤러리)
import { useCamera } from '../hooks/useCamera';
import { useGallery } from '../hooks/useGallery';
// 컴포넌트 임포트
import LoadingOverlay from '../components/LoadingOverlay';
// API 함수 임포트 (getRecent, getDetail 추가)
import {
  postPredict,
  getStatus,
  getResult,
  getRecent,
  getDetail,
} from '../api/pillApi';
// (제거) AsyncStorage 임포트 제거

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
  // (수정) history 상태는 상세 정보(PillResultData)가 아닌 '요약 정보'(PillSearchSummary)를 저장
  const [history, setHistory] = useState<PillSearchSummary[]>([]);

  // 커스텀 훅 사용
  const { openCamera } = useCamera();
  const { openGallery } = useGallery();

  // (수정) '최근 검색 기록'을 AsyncStorage가 아닌 getRecent API로 로드
  const loadHistory = async () => {
    try {
      // 1. GET /recent API 호출
      const historyData = await getRecent();
      // 2. 최대 5개로 제한 (API가 5개 이상 반환할 경우 대비)
      setHistory(historyData.slice(0, 5));
    } catch (error) {
      console.error('최근 검색 기록 불러오기 오류:', error);
      setHistory([]); // 실패 시 빈 배열로 설정
    }
  };

  // 화면이 포커스될 때마다(돌아올 때마다) loadHistory 함수 호출
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, []),
  );

  // '이미지 분석' API 호출 (실제 API 반영)
  const handleImageAnalysis = async (image: ImageAsset) => {
    // 1. uri 검사
    if (!image.uri) {
      Alert.alert('오류', '이미지 URI를 찾을 수 없습니다.');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('이미지 분석을 요청합니다...');
      // 2. API는 task_id (snake_case)를 반환
      const { task_id } = await postPredict(image); // 1. 분석 요청

      setMessage('분석 상태를 확인 중입니다...');
      // 3. getStatus에 task_id (snake_case) 전달
      const statusResponse = await getStatus(task_id); // 2. 상태 확인
      const status = statusResponse.status; // status는 'PENDING' 또는 'SUCCESS'

      // 4. 'SUCCESS' 상태일 때 결과 조회
      if (status === 'SUCCESS') {
        setMessage('결과를 가져오는 중입니다...');
        // 5. getResult는 '요약 목록' (PillSearchSummary[])을 반환
        const resultList = await getResult(task_id);

        if (!resultList || resultList.length === 0) {
          Alert.alert(
            '분석 실패',
            '이미지와 일치하는 알약을 찾을 수 없습니다.',
          );
        } else {
          // 6. '검색 결과 목록' 화면으로 이동
          navigation.navigate('SearchResultListScreen', {
            searchResults: resultList,
          });
        }
      } else if (status === 'PENDING') {
        // (참고) 실제 앱에서는 'SUCCESS'가 될 때까지 Polling(반복 조회) 필요
        Alert.alert('처리 중', '알약 분석이 진행 중입니다. 잠시 후 다시 시도해 주세요.');
      } else {
        Alert.alert('오류', '알약 분석에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('오류', '알약을 분석하는 중 문제가 발생했습니다.');
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
        await handleImageAnalysis(image as ImageAsset); // 분석 함수 호출
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
        await handleImageAnalysis(image as ImageAsset); // 분석 함수 호출
      }
    } catch (err) {
      console.error(err);
    }
  };

  // -----------------------------------------------------------------
  // (수정) '최근 검색 기록' 항목 탭 핸들러 (getDetail 호출)
  // -----------------------------------------------------------------
  const handleRecentSearch = async (pill: PillSearchSummary) => {
    setIsLoading(true);
    setMessage('상세 정보를 불러오는 중...');
    try {
      // 1. 요약 정보의 id(code)로 getDetail API 호출
      const detailResult = await getDetail(pill.id);
      // 2. 상세 정보(PillResultData)를 ResultScreen으로 전달
      navigation.navigate('ResultScreen', { result: detailResult });
    } catch (error) {
      console.error('상세 정보 조회 오류:', error);
      Alert.alert('오류', '상세 정보를 불러오는 데 실패했습니다.');
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
            {history.slice(0, 2).map((pill) => (
              <TouchableOpacity
                key={pill.id}
                style={styles.recentItem}
                activeOpacity={0.7}
                onPress={() => handleRecentSearch(pill)}
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
  // 카메라/사진/검색 버튼 (간격 축소)
  optionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 25, // 버튼 높이
    marginVertical: 13, // 버튼 간 간격
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