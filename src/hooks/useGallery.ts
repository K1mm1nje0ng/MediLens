import { Alert, PermissionsAndroid, Platform } from 'react-native';
import {
  launchImageLibrary,
  ImageLibraryOptions,
  Asset,
} from 'react-native-image-picker';

export const useGallery = () => {
  const openGallery = async (): Promise<Asset | null> => {
    try {
      // ✅ 1️⃣ Android 권한 요청
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
          Alert.alert('권한 거부', '갤러리 접근이 거부되었습니다.');
          return null;
        }
      }

      // ✅ 2️⃣ 갤러리 옵션
      const options: ImageLibraryOptions = {
        mediaType: 'photo',
        selectionLimit: 1,
        includeBase64: false,
      };

      // ✅ 3️⃣ launchImageLibrary는 Promise를 직접 반환함
      const response = await launchImageLibrary(options);

      if (response.didCancel) {
        console.log('사용자가 갤러리 선택을 취소했습니다.');
        return null;
      } else if (response.errorCode) {
        Alert.alert('오류', `갤러리 실행 실패: ${response.errorMessage}`);
        return null;
      } else if (response.assets && response.assets.length > 0) {
        const photo = response.assets[0];
        console.log('선택된 이미지 URI:', photo.uri);
        return photo;
      }

      return null;
    } catch (error) {
      console.error('launchImageLibrary 실행 중 오류:', error);
      Alert.alert('오류', '갤러리 실행 중 문제가 발생했습니다.');
      return null;
    }
  };

  return { openGallery };
};
