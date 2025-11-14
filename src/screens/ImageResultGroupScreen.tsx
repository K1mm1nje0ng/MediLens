import React, { useState } from 'react'; // useState 임포트 추가
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal, 
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, PillSearchSummary } from '../types/navigation';
import Feather from 'react-native-vector-icons/Feather';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ImageResultGroupScreen'
>;
type ScreenRouteProp = RouteProp<
  RootStackParamList,
  'ImageResultGroupScreen'
>;

const { width, height } = Dimensions.get('window'); // 화면 너비와 높이 가져오기

export default function ImageResultGroupScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();

  const { imageResults, processedImage } = route.params;

  
  // 이미지 확대 모달 상태 관리
  const [isImageModalVisible, setImageModalVisible] = useState(false);

  const handleGroupSelect = (group: PillSearchSummary[]) => {
    if (!group || group.length === 0) {
      Alert.alert('오류', '선택한 그룹에 후보 알약이 없습니다.');
      return;
    }
    navigation.navigate('SearchResultListScreen', {
      imageResults: group,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7FEFB' }}>
      {/* 상단 헤더 (뒤로가기, 화면 제목) */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>분석 결과 그룹</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 결과 그룹 목록을 보여주는 스크롤 뷰 */}
      <ScrollView contentContainerStyle={styles.scroll}>
        
        
        {/* processed_image 섹션: 텍스트 제거 및 TouchableOpacity로 감싸기 */}
        <TouchableOpacity
          style={styles.processedImageBox}
          onPress={() => setImageModalVisible(true)} // 이미지 탭 시 모달 열기
        >
          <Image
            source={{ uri: `data:image/jpeg;base64,${processedImage}` }}
            style={styles.processedImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        
        <Text style={styles.infoText}>
          사진에서 {imageResults.length}개의 알약 그룹이 감지되었습니다.
        </Text>

        {imageResults.map((group, groupIndex) => {
          const representativePill = group[0];
          if (!representativePill) return null;

          return (
            <TouchableOpacity
              key={`${representativePill.id}-${groupIndex}`}
              style={styles.groupContainer}
              onPress={() => handleGroupSelect(group)}
            >
              <Image
                source={{ uri: representativePill.imageUrl }}
                style={styles.groupImage}
              />
              <View style={styles.groupTextContainer}>
                <Text style={styles.groupTitle}>알약 {groupIndex + 1}</Text>
                <Text style={styles.groupSubtitle}>
                  '{representativePill.pillName}' 포함 {group.length}개의 후보
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      
      {/* 이미지 확대 모달 */}
      <Modal
        visible={isImageModalVisible}
        transparent={true}
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setImageModalVisible(false)}
            >
              <Feather name="x" size={30} color="#FFF" />
            </TouchableOpacity>
            <Image
              source={{ uri: `data:image/jpeg;base64,${processedImage}` }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 60, paddingTop: 10 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#000' },
  
  processedImageBox: {
    width: '100%',
    backgroundColor: '#F4F4F4', 
    borderRadius: 12,
    marginBottom: 20,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1, 
    borderColor: '#EEEEEE', 
  },
  
  processedImage: {
    width: '100%',
    height: 200,
  },

  infoText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
  },
  groupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  groupImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    marginRight: 15,
  },
  groupTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  groupSubtitle: {
    fontSize: 14,
    color: '#555',
  },

  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)', 
  },
  modalView: {
    width: width, 
    height: height, 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', 
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 50, 
    right: 20,
    zIndex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
  },
});