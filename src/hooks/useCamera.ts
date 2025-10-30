import { Alert, PermissionsAndroid } from 'react-native';
import {
  launchCamera,
  CameraOptions,
  Asset,
} from 'react-native-image-picker';

// 카메라 기능 훅 정의
export const useCamera = () => {
  // 카메라를 실행하고 촬영된 이미지를 반환하는 함수
  const openCamera = async (): Promise<Asset | null> => {
    try {
      // 카메라 권한 요청
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: '카메라 접근 권한 요청',
          message: '알약 촬영을 위해 카메라 접근이 필요합니다.',
          buttonNeutral: '나중에',
          buttonNegative: '거부',
          buttonPositive: '허용',
        }
      );

      // 권한이 거부된 경우
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('카메라 접근이 거부되었습니다.');
        return null;
      }

      // 카메라 실행 옵션 설정
      const options: CameraOptions = {
        mediaType: 'photo',
        cameraType: 'back',
        saveToPhotos: true,
        includeBase64: false,
      };

      // 카메라 실행
      const response = await launchCamera(options);

      // 사용자가 촬영을 취소한 경우
      if (response.didCancel) {
        console.log('카메라 취소됨');
        return null;
      }
      // 오류 발생 시
      else if (response.errorCode) {
        Alert.alert('오류', `카메라 실패: ${response.errorMessage}`);
        return null;
      }
      // 정상적으로 사진이 촬영된 경우
      else if (response.assets && response.assets.length > 0) {
        const image = response.assets[0];
        console.log('촬영된 이미지 URI:', image.uri);
        return image;
      }

      // 기타 예외 상황
      return null;
    } catch (error) {
      // 예외 처리
      console.error('launchCamera 실행 중 오류:', error);
      Alert.alert('오류', '카메라 실행 중 문제가 발생했습니다.');
      return null;
    }
  };

  // 훅에서 openCamera 함수를 반환
  return { openCamera };
};


