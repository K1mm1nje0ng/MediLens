import React from 'react';
import { StatusBar } from 'react-native';
// 네비게이션 컨테이너 및 스택 네비게이터 임포트
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 네비게이션 타입 (스크린 목록 및 파라미터)
import { RootStackParamList } from './src/types/navigation';

// 스크린 컴포넌트 임포트
import PillSearchScreen from './src/screens/PillSearchScreen';
import ResultScreen from './src/screens/ResultScreen';
import DirectSearchScreen from './src/screens/DirectSearchScreen';
import SearchResultListScreen from './src/screens/SearchResultListScreen'; // 목록 화면 임포트

// Stack Navigator 생성
const Stack = createNativeStackNavigator<RootStackParamList>();

// 메인 앱 컴포넌트
function App(): React.JSX.Element {
  return (
    // 네비게이션 최상위 컨테이너
    <NavigationContainer>
      {/* 상태 표시줄 설정 (어두운 아이콘) */}
      <StatusBar
        hidden={false}
        backgroundColor="#ffffff"
        barStyle="dark-content"
      />

      {/* 스크린 스택 정의 (초기 화면: PillSearchScreen) */}
      <Stack.Navigator initialRouteName="PillSearchScreen">
        {/* 메인 화면 */}
        <Stack.Screen
          name="PillSearchScreen"
          component={PillSearchScreen}
          options={{ headerShown: false }}
        />

        {/* 상세 결과 화면 */}
        <Stack.Screen
          name="ResultScreen"
          component={ResultScreen}
          options={{ headerShown: false }}
        />

        {/* 직접 검색 화면 */}
        <Stack.Screen
          name="DirectSearchScreen"
          component={DirectSearchScreen}
          options={{ headerShown: false }}
        />

        {/* 검색 결과 목록 화면 */}
        <Stack.Screen
          name="SearchResultListScreen"
          component={SearchResultListScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;



