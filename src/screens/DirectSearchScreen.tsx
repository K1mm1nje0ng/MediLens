import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';

const shapeOptions = ['원형', '타원형', '장방형', '전체'];
const typeOptions = ['정제', '경질캡슐', '연질캡슐', '전체'];
const colorOptions = [
  '하양', '노랑', '주황', '분홍', '빨강', '갈색',
  '연두', '초록', '청록', '파랑', '남색', '자주',
  '보라', '회색', '검정', '투명', '전체',
];

export default function DirectSearchScreen() {
  const navigation = useNavigation();

  const [shape, setShape] = useState('전체');
  const [type, setType] = useState('전체');
  const [color, setColor] = useState('전체');
  const [identifier, setIdentifier] = useState('');
  const [product, setProduct] = useState('');
  const [company, setCompany] = useState('');

  const renderOptionGroup = (
    label: string,
    options: string[],
    selected: string,
    setSelected: (v: string) => void,
  ) => (
    <View style={styles.groupContainer}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.label}> |</Text>
      </View>

      <View style={styles.optionContainer}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.optionButton, selected === opt && styles.selected]}
            onPress={() => setSelected(opt)}>
            <Text style={styles.optionText}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const handleSearch = () => {
    const result = {
      success: true,
      pillName: `${company || product || '알약'} (직접검색)`,
    };
    // @ts-ignore
    navigation.navigate('ResultScreen', { result });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7FEFB' }}>
      {/* ✅ 헤더 (결과화면과 동일) */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>식별 검색</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* ✅ 스크롤 영역 */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        
        {/* ✅ 큰 흰색 카드 (outerBox 스타일 적용) */}
        <View style={styles.outerBox}>
          {renderOptionGroup('모양', shapeOptions, shape, setShape)}
          {renderOptionGroup('제형', typeOptions, type, setType)}
          {renderOptionGroup('색상', colorOptions, color, setColor)}

          {/* 입력 필드 */}
          {(
  [
    ['식별문자', identifier, setIdentifier],
    ['제품명', product, setProduct],
    ['회사명', company, setCompany],
  ] as [string, string, React.Dispatch<React.SetStateAction<string>>][]
).map(([label, value, setter], idx) => (
  <View style={styles.inputGroup} key={idx}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.label}> |</Text>
    </View>
    <TextInput
      placeholder="입력"
      placeholderTextColor="#B7B7B7"
      style={styles.input}
      value={value}
      onChangeText={setter}
    />
  </View>
))}

          {/* 검색 버튼 */}
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Feather name="search" size={18} color="#fff" />
            <Text style={styles.searchButtonText}>검색하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 60 },

  /* ✅ 헤더 (결과화면과 동일 구조) */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#000' },

  /* ✅ 카드 박스 (ResultScreen outerBox 복제) */
  outerBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },

  groupContainer: { marginBottom: 15 },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: 'black',
    marginBottom: 8,
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  selected: { borderWidth: 2, borderColor: '#409F82' },
  optionText: { fontSize: 11, color: '#484848', fontWeight: '500' },

  inputGroup: { marginTop: 10 },
  input: {
    backgroundColor: 'white',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#B1B1B1',
    paddingVertical: 6,
    paddingHorizontal: 15,
    fontSize: 12,
    color: 'black',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#409F82',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 25,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
