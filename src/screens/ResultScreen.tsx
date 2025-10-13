import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

type Props = NativeStackScreenProps<RootStackParamList, 'ResultScreen'>;

export default function ResultScreen({ route }: Props) {
  const { result } = route.params; // 분석 결과 데이터 (예: { pillName: '비맥스정', ... })

  return (
  <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
    {/* ✅ 전체 카드 */}
    <View style={styles.outerBox}>
      {/* ✅ 상단 약 이름 */}
      <View style={styles.header}>
        <FontAwesome5 name="capsules" size={28} color="#409F82" style={{ marginRight: 8 }} />
        <Text style={styles.title}>{result.pillName || '알약명 미확인'}</Text>
      </View>

      {/* ✅ 약 이미지 */}
      <View style={styles.imageBox}>
        <Image source={require('../../assets/images/pill.png')} style={styles.image} />
      </View>


      <View style={styles.identBox}>
  {/* 🔹 1. 각인 상자 */}
  <View style={styles.markContainer}>
  <View style={styles.markBoxLeft}>
    <Text style={styles.markText}>BAT</Text>
  </View>
  <View style={styles.markBoxRight}>
    {/* 뒷면 각인이 없으면 비워둬도 됨 */}
    <Text style={styles.markText}></Text>
  </View>
</View>

  {/* 🔹 2. 약의 규격 정보 */}
  <View style={styles.identInfo}>
    <View style={styles.identRow}>
      <Text style={styles.identLabel}>장축(mm) |</Text>
      <Text style={styles.identValue}>17.23</Text>
      <Text style={styles.identLabel}>단축(mm) |</Text>
      <Text style={styles.identValue}>10.22</Text>
      <Text style={styles.identLabel}>두께(mm) |</Text>
      <Text style={styles.identValue}>6.49</Text>
    </View>

    <View style={styles.identRow}>
      <Text style={styles.identLabel}>성상 |</Text>
      <Text style={styles.identValue}>적갈색의 타원형 필름코팅정제</Text>
    </View>
  </View>
</View>


      {/* ✅ 세부 정보 */}
      <View style={styles.infoBox}>
        <InfoRow label="전문/일반 |" value="일반의약품" />
        <InfoRow label="업체명 |" value="(유)한풍제약" />
        <InfoRow label="주성분 |" value="히드록소코발라민아세트산염 등 ...(더보기)" />
        <InfoRow label="용법용량 |" value="만 12세 이상 성인 1회 1정 1일 1회 식후 복용" />
        <InfoRow label="효능효과 |" value="비타민 B군 보급 및 피로개선 ...(더보기)" />
        <InfoRow label="주의사항 |" value="1) 특정 질환자는 복용 주의 ...(더보기)" />
      </View>
    </View>

    {/* ✅ 버튼 (카드 밖으로 분리) */}
    <TouchableOpacity style={styles.button} onPress={() => Alert.alert('개발 예정')}>
      <Feather name="edit-3" size={20} color="#1C1B14" style={{ marginRight: 8 }} />
      <Text style={styles.buttonText}>찾은 약 수정하기</Text>
    </TouchableOpacity>
  </ScrollView>
);
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FEFB' },
  scroll: { paddingBottom: 60 },

  /* 🔹 전체 카드 (outerBox) */
  outerBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    elevation: 3,
  },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '600', color: '#1C1B14' },

  imageBox: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#ffffffff',
    borderRadius: 12,
    marginVertical: 16,
    padding: 12,
  },
  image: { width: 250, height: 100, resizeMode: 'contain' },

  identBox: {
  backgroundColor: '#F5F5F5',
  borderRadius: 12,
  paddingVertical: 14,
  paddingHorizontal: 10,
  marginBottom: 8,
  marginHorizontal: -5,
  width: 'auto',
},

/* 🔹 각인 상자 */
markContainer: {
  flexDirection: 'row',
  borderWidth: 1,
  borderColor: '#D9D9D9',
  borderRadius: 4,
  overflow: 'hidden', // ✅ 테두리 안 넘치게
  backgroundColor: '#FFFFFF',
  marginBottom: 8,
  elevation: 2, // Android용 그림자 (선택)
  shadowColor: '#000', // iOS용 그림자 (선택)
  shadowOpacity: 0.05,
  shadowRadius: 2,
},

markBoxLeft: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  borderRightWidth: 1,     // ✅ 중앙 세로줄
  borderRightColor: '#D9D9D9',
  paddingVertical: 8,
},

markBoxRight: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingVertical: 8,
},

markText: {
  fontSize: 14,
  fontWeight: '700',
  color: '#000',
},


/* 🔹 정보 행 전체 영역 */
identInfo: { gap: 4 },

identRow: {
  flexDirection: 'row',
  flexWrap: 'wrap', // ✅ 줄바꿈 허용
  alignItems: 'flex-start',
},

identLabel: {
  fontWeight: '600',
  color: '#000',
  fontSize: 12.5,
  marginRight: 4,
},

identValue: {
  fontWeight: '600',
  fontSize: 12.5,
  color: '#000',
  marginRight: 10,
},


  infoBox: {
    backgroundColor: '#FFFFFF',
    padding: 8,
  },
  infoRow: {
  flexDirection: 'row',
  alignItems: 'flex-start', // ✅ 세로 위쪽 정렬로 통일
  marginVertical: 6,
},
infoLabel: {
  fontWeight: '700',
  color: '#1C1B14',
  fontSize: 16,
  textAlign: 'right',
  marginRight: 4,
  width: 80,
},
infoValue: {
  flex: 1,
  color: '#484848',
  fontSize: 14,
  lineHeight: 20, // ✅ 줄간격 유지 가능
},


  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffffff',
    borderRadius: 12,
    height: 50,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
  },
  buttonText: { fontSize: 18, fontWeight: '500', color: '#000' },
});

