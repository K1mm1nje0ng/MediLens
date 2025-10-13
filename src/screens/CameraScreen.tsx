/*import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useCamera } from '../hooks/useCamera';
import LoadingOverlay from '../components/LoadingOverlay';

// 📦 API 응답 타입
interface AnalysisResultType {
  success: boolean;
  pillName: string;
}

// 📱 네비게이션 Props 타입
type CameraScreenProps = NativeStackScreenProps<RootStackParamList, 'CameraScreen'>;

// 🧠 가짜 API (실제 서버 연동 전까지 테스트용)
const analyzePillImageAPI = async (imageUri: string): Promise<AnalysisResultType> => {
  console.log(`${imageUri} 이미지를 서버로 전송하여 분석 요청`);
  return new Promise(resolve =>
    setTimeout(() => resolve({ success: true, pillName: '비맥스정' }), 3000)
  );
};

// 📸 메인 컴포넌트
const CameraScreen: React.FC<CameraScreenProps> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { openCamera } = useCamera();

  // 화면 진입 시 자동으로 카메라 실행
  useEffect(() => {
    const runCamera = async () => {
      try {
        const image = await openCamera();

        if (image && image.uri) {
          setIsLoading(true);
          const result = await analyzePillImageAPI(image.uri);

          if (result.success) {
            // ✅ 결과 화면으로 이동
            navigation.replace('ResultScreen', { result });
          } else {
            Alert.alert('분석 실패', '알약을 인식하지 못했습니다.');
            navigation.goBack();
          }
        } else {
          // 사용자가 촬영 취소 → 이전 화면으로 돌아감
          navigation.goBack();
        }
      } catch (error) {
        console.error('카메라 실행 오류:', error);
        Alert.alert('오류', '카메라 실행 중 문제가 발생했습니다.');
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };

    runCamera();
  }, []);

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={isLoading} message="알약을 분석 중입니다..." />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CameraScreen;
*/