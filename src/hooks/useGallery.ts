import { Alert, PermissionsAndroid, Platform } from 'react-native';
import {
  launchImageLibrary,
  ImageLibraryOptions,
  Asset,
} from 'react-native-image-picker';

// 갤러리 기능 훅 정의
export const useGallery = () => {
  // 갤러리를 열고 사용자가 선택한 이미지 반환
  const openGallery = async (): Promise<Asset | null> => {
    try {
      // Android 권한 요청
      if (Platform.OS === 'android') {
        const permission =
          Number(Platform.Version) >= 33
            ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
            : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

        const granted = await PermissionsAndroid.request(permission, {
          title: '갤러리 접근 권한 요청',
          message: '사진을 불러오기 위해 갤러리 접근이 필요합니다.',
          buttonNeutral: '나중에',
          buttonNegative: '거부',
          buttonPositive: '허용',
        });

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('갤러리 접근이 거부되었습니다.');
          return null;
        }
      }

      // 갤러리 옵션 설정
      const options: ImageLibraryOptions = {
        mediaType: 'photo',
        selectionLimit: 1,
        includeBase64: false,
      };

      // 갤러리 실행
      const response = await launchImageLibrary(options);

      if (response.didCancel) return null;
      if (response.errorCode) {
        Alert.alert('오류', `갤러리 실패: ${response.errorMessage}`);
        return null;
      }
      if (response.assets && response.assets.length > 0) return response.assets[0];

      return null;
    } catch (error) {
      console.error('갤러리 실행 중 오류:', error);
      Alert.alert('오류', '갤러리 실행 중 문제가 발생했습니다.');
      return null;
    }
  };

  return { openGallery };
};
