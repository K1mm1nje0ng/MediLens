import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 네비게이션 타입 정의 (화면 간 전달할 파라미터 구조)
import { RootStackParamList } from './src/types/navigation';

// 개별 화면 컴포넌트 import
import PillSearchScreen from './src/screens/PillSearchScreen';
import ResultScreen from './src/screens/ResultScreen';
import DirectSearchScreen from './src/screens/DirectSearchScreen';
import SearchResultListScreen from './src/screens/SearchResultListScreen';
// (신규) 이미지 분석 그룹 화면 임포트
import ImageResultGroupScreen from './src/screens/ImageResultGroupScreen';

// Stack Navigator 생성 (타입 지정)
const Stack = createNativeStackNavigator<RootStackParamList>();

// 앱의 루트 컴포넌트
function App(): React.JSX.Element {
  return (
    // 네비게이션 컨테이너
    <NavigationContainer>
      {/* 상태 표시줄 설정 */}
      <StatusBar
        hidden={false}
        backgroundColor="#ffffff"
        barStyle="dark-content"
      />

      {/* Stack 네비게이터 설정 */}
      <Stack.Navigator initialRouteName="PillSearchScreen">
        {/* 1. 메인 화면 */}
        <Stack.Screen
          name="PillSearchScreen"
          component={PillSearchScreen}
          options={{ headerShown: false }} // 기본 헤더 숨김
        />
        {/* 2. 상세 결과 화면 */}
        <Stack.Screen
          name="ResultScreen"
          component={ResultScreen}
          options={{ headerShown: false }}
        />
        {/* 3. 직접 검색 화면 */}
        <Stack.Screen
          name="DirectSearchScreen"
          component={DirectSearchScreen}
          options={{ headerShown: false }}
        />
        {/* 4. 검색 결과 '목록' 화면 */}
        <Stack.Screen
          name="SearchResultListScreen"
          component={SearchResultListScreen}
          options={{ headerShown: false }}
        />
        {/* 5. (신규) 이미지 분석 '그룹' 화면 */}
        <Stack.Screen
          name="ImageResultGroupScreen"
          component={ImageResultGroupScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;



