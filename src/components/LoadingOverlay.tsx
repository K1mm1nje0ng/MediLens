import React from 'react';
import { View, Modal, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface Props {
  visible: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<Props> = ({ visible, message }) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={() => {}}
    >
      <View style={styles.background}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.message}>{message || '처리 중...'}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  message: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
});

export default LoadingOverlay;