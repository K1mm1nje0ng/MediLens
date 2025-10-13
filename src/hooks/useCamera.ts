import { Alert, PermissionsAndroid } from 'react-native';
import {
  launchCamera,
  CameraOptions,
  Asset,
} from 'react-native-image-picker';

export const useCamera = () => {
  const openCamera = async (): Promise<Asset | null> => {
    try {
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

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('카메라 접근이 거부되었습니다.');
        return null;
      }

      const options: CameraOptions = {
        mediaType: 'photo',
        cameraType: 'back',
        saveToPhotos: true,
        includeBase64: false,
      };

      const response = await launchCamera(options);

      if (response.didCancel) {
        console.log('카메라 취소됨');
        return null;
      } else if (response.errorCode) {
        Alert.alert('오류', `카메라 실패: ${response.errorMessage}`);
        return null;
      } else if (response.assets && response.assets.length > 0) {
        const image = response.assets[0];
        console.log('촬영된 이미지 URI:', image.uri);
        return image;
      }

      return null;
    } catch (error) {
      console.error('launchCamera 실행 중 오류:', error);
      Alert.alert('오류', '카메라 실행 중 문제가 발생했습니다.');
      return null;
    }
  };

  return { openCamera };
};
