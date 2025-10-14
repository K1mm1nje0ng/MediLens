import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

type Props = NativeStackScreenProps<RootStackParamList, 'ResultScreen'>;

export default function ResultScreen({ route, navigation }: Props) {
  const { result } = route.params;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7FEFB' }}>
      {/* ✅ 헤더 */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>분석 결과</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* ✅ 스크롤 콘텐츠 */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.outerBox}>
          <View style={styles.header}>
            <FontAwesome5
              name="capsules"
              size={28}
              color="#409F82"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.title}>{result.pillName || '알약명 미확인'}</Text>
          </View>

          <View style={styles.imageBox}>
            <Image
              source={require('../../assets/images/pill.png')}
              style={styles.image}
            />
          </View>

          <View style={styles.identBox}>
            <View style={styles.markContainer}>
              <View style={styles.markBoxLeft}>
                <Text style={styles.markText}>BAT</Text>
              </View>
              <View style={styles.markBoxRight}>
                <Text style={styles.markText}></Text>
              </View>
            </View>

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

          {/* ✅ 세부 정보 - InfoRow 수정됨 */}
          <View style={styles.infoBox}>
            <InfoRow label="전문/일반 |" value="일반의약품" />
            <InfoRow label="업체명 |" value="(유)한풍제약" />
            <InfoRow
              label="주성분 |"
              value="히드록소코발라민아세트산염, 피리독신염산염, 니코틴아미드, 리보플라빈 ... 이 외 비타민 복합 성분이 포함되어 있습니다."
            />
            <InfoRow
              label="용법용량 |"
              value="만 12세 이상 성인 1회 1정 1일 1회 식후 복용"
            />
            <InfoRow
              label="효능효과 |"
              value="비타민 B군 보급 및 피로개선, 신경통 및 근육통 완화, 구내염 개선에 도움을 줍니다."
            />
            <InfoRow
              label="주의사항 |"
              value="1) 특정 질환자는 복용 주의 2) 어린이 손이 닿지 않도록 보관 3) 고용량 복용 시 부작용 주의"
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('DirectSearchScreen')}
        >
          <Feather
            name="edit-3"
            size={20}
            color="#1C1B14"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.buttonText}>찾은 약 수정하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ✅ 세부 정보 행 (더보기 기능 추가) */
function InfoRow({ label, value }: { label: string; value: string }) {
  const [expanded, setExpanded] = useState(false);
  const MAX_LENGTH = 40; // 표시할 기본 글자 수

  const isLong = value.length > MAX_LENGTH;
  const displayText = expanded ? value : value.slice(0, MAX_LENGTH) + (isLong ? '...' : '');

  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>
        {displayText}{' '}
        {isLong && (
          <Text
            onPress={() => setExpanded(!expanded)}
            style={{ color: '#409F82', fontWeight: '600' }}
          >
            {expanded ? ' 접기' : ' 더보기'}
          </Text>
        )}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FEFB' },
  scroll: { paddingBottom: 60, paddingHorizontal: 20 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#000' },
  outerBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    marginBottom: 24,
    elevation: 3,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '600', color: '#1C1B14' },
  imageBox: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#fff',
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
  },
  markContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    elevation: 2,
  },
  markBoxLeft: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#D9D9D9',
    paddingVertical: 8,
  },
  markBoxRight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  markText: { fontSize: 14, fontWeight: '700', color: '#000' },
  identInfo: { gap: 4 },
  identRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' },
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
  infoBox: { backgroundColor: '#FFFFFF', padding: 8 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    height: 50,
    marginTop: 10,
    marginBottom: 20,
    elevation: 2,
  },
  buttonText: { fontSize: 18, fontWeight: '500', color: '#000' },
});



