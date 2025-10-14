import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useCamera } from '../hooks/useCamera';
import { useGallery } from '../hooks/useGallery';
import LoadingOverlay from '../components/LoadingOverlay';

type PillSearchScreenProps = NativeStackScreenProps<RootStackParamList, 'PillSearchScreen'>;

interface AnalysisResultType {
  success: boolean;
  pillName: string;
}

const analyzePillImageAPI = async (imageUri: string): Promise<AnalysisResultType> => {
  console.log(`${imageUri}를 서버로 전송하여 분석 요청`);
  return new Promise(resolve =>
    setTimeout(() => resolve({ success: true, pillName: '비맥스정' }), 3000)
  );
};


export default function PillSearchScreen({ navigation }: PillSearchScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { openCamera } = useCamera();
  const { openGallery } = useGallery();

// 📸 카메라 촬영 로직
  /*✅ 카메라로 사진 찍고 분석 */
  const handleTakePhoto = async () => {
    try {
      const image = await openCamera();
      if (image && image.uri) {
        setIsLoading(true);
        const result = await analyzePillImageAPI(image.uri);
        if (result.success) {
          navigation.navigate('ResultScreen', { result });
        }
      }
    } catch (err) {
      console.error(err);
      Alert.alert('오류', '카메라 실행 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  /** ✅ 갤러리에서 사진 선택 후 분석 */
  const handleSelectPhoto = async () => {
    try {
      const image = await openGallery(); // useGallery 훅 수정 필요 (아래 참고)
      if (image && image.uri) {
        setIsLoading(true);
        const result = await analyzePillImageAPI(image.uri);
        if (result.success) {
          navigation.navigate('ResultScreen', { result });
        }
      }
    } catch (err) {
      console.error(err);
      Alert.alert('오류', '갤러리 실행 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* ✅ 프로그램 타이틀 */}
      <View style={styles.titleRow}>
        <FontAwesome5 name="capsules" size={40} color="#409F82" style={{ marginRight: 15 }} />
        <Text style={styles.title}>프로그램 이름</Text>
      </View>

      {/* ✅ ① 검색 카드 */}
      <View style={styles.searchCard}>
        <Text style={styles.header}>무슨 약을 찾으시나요?</Text>

        {/* 카메라로 알약 검색 */}
        <TouchableOpacity
          style={[styles.optionBox, { backgroundColor: '#409F82' }]}
          onPress={handleTakePhoto}
        >
          <Feather name="camera" size={35} color="#fff" />
          <Text style={[styles.optionText, { color: '#fff' }]}>카메라로 알약 검색</Text>
        </TouchableOpacity>

        {/* 사진으로 알약 검색 */}
        <TouchableOpacity
          style={[styles.optionBox, { backgroundColor: '#A8D4C5' }]}
          onPress={handleSelectPhoto} // ✅ 갤러리 기능 유지
        >
          <Feather name="image" size={35} color="#1C1B14" />
          <Text style={styles.optionText}>사진으로 알약 검색</Text>
        </TouchableOpacity>

        {/* 직접 알약 검색 */}
        <TouchableOpacity
          style={[styles.optionBox, { backgroundColor: '#fff' }]}
          onPress={() => navigation.navigate('DirectSearchScreen')}
        >
          <Feather name="search" size={35} color="#409F82" />
          <Text style={styles.optionText}>직접 알약 검색</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ 최근 검색 기록 */}
<View style={styles.recentCard}>
  <View style={styles.recentHeader}>
    <Feather name="archive" size={24} color="#000" style={{ marginRight: 8 }} />
    <Text style={styles.recentTitle}>최근 검색 기록</Text>
  </View>

  {['맥세렌디정', '삐콤씨정'].map((pill, index) => (
    <TouchableOpacity
      key={index}
      style={styles.recentItem}
      activeOpacity={0.7}
      onPress={() => {
        // ✅ 최근 검색 클릭 시 결과 화면으로 이동
        const result = { success: true, pillName: pill };
        navigation.navigate('ResultScreen', { result });
      }}
    >
      <View style={styles.recentIcon} />
      <Text style={styles.recentText}>{pill}</Text>
    </TouchableOpacity>
  ))}
</View>


      {/* ✅ 로딩 오버레이 */}
      <LoadingOverlay visible={isLoading} message="알약을 분석 중입니다..." />
    </ScrollView>
  );
}

// styles 부분은 기존과 동일
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FFFC' },
  scroll: { padding: 20, alignItems: 'stretch', paddingBottom: 50 },
  titleRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 25 },
  title: { fontSize: 36, fontWeight: '600', color: '#000' },
  searchCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: { fontSize: 27, fontWeight: '500', textAlign: 'center', marginVertical: 30 },
  optionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 25,
    marginVertical: 20,
  },
  optionText: { fontSize: 20, fontWeight: '500', marginLeft: 10, color: '#000' },
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
  recentItem: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  recentIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#E5E7EB', marginRight: 16 },
  recentText: { fontSize: 16, fontWeight: '500', color: '#1C1B14' },
});