import React from 'react';
import { View, Modal, ActivityIndicator, Text, StyleSheet } from 'react-native';

// 로딩 오버레이 컴포넌트의 Props 타입 정의
interface Props {
  visible: boolean; // 로딩창 표시 여부
  message?: string; // 사용자에게 보여줄 메시지
}

// 화면 전체를 덮는 로딩 오버레이 컴포넌트
const LoadingOverlay: React.FC<Props> = ({ visible, message }) => {
  return (
    //현재 화면 위에 반투명한 배경과 로딩 인디케이터 표시
    <Modal
      transparent={true}
      animationType="fade" 
      visible={visible} 
      onRequestClose={() => {}} 
    >
      {/* 어두운 반투명 배경 */}
      <View style={styles.background}>
        {/* 중앙의 흰색 로딩 박스 */}
        <View style={styles.container}>
          {/* 회전하는 로딩 인디케이터 */}
          <ActivityIndicator size="large" color="#409F82" />
          {/* 로딩 메시지 표시 */}
          <Text style={styles.message}>{message || '처리 중...'}</Text>
        </View>
      </View>
    </Modal>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  // 전체 화면을 덮는 어두운 반투명 배경
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  // 로딩 인디케이터와 메시지 담는 박스
  container: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  // 메시지 텍스트 스타일
  message: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
});

export default LoadingOverlay;
