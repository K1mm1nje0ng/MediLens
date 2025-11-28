import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 네비게이션 타입 정의
import { RootStackParamList } from './src/types/navigation';

// 개별 화면 컴포넌트 import
import PillSearchScreen from './src/screens/PillSearchScreen';
import ResultScreen from './src/screens/ResultScreen';
import DirectSearchScreen from './src/screens/DirectSearchScreen';
// 1D/2D 배열 처리 화면 import
import SearchResultListScreen from './src/screens/SearchResultListScreen';
import ImageResultGroupScreen from './src/screens/ImageResultGroupScreen';

// Stack Navigator 생성
const Stack = createNativeStackNavigator<RootStackParamList>();

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
        {/* 메인 화면: 알약 검색 메뉴 */}
        <Stack.Screen
          name="PillSearchScreen"
          component={PillSearchScreen}
          options={{ headerShown: false }} 
        />

        {/* 직접 검색 화면 */}
        <Stack.Screen
          name="DirectSearchScreen"
          component={DirectSearchScreen}
          options={{ headerShown: false }}
        />

        {/* 이미지 분석 결과 */}
        <Stack.Screen
          name="ImageResultGroupScreen"
          component={ImageResultGroupScreen}
          options={{ headerShown: false }}
        />

        {/* 검색 결과 목록 화면 */}
        <Stack.Screen
          name="SearchResultListScreen"
          component={SearchResultListScreen}
          options={{ headerShown: false }}
        />
        
        {/* 분석 결과 화면 */}
        <Stack.Screen
          name="ResultScreen"
          component={ResultScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;




