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

// Stack Navigator 생성 (타입 지정)
const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    // 네비게이션 컨테이너: 전체 앱을 네비게이션 구조로 감쌈
    <NavigationContainer>
      {/* 상태 표시줄 설정 */}
      <StatusBar
        hidden={false}              // 상태 표시줄 표시
        backgroundColor="#ffffff"   // Android 배경색
        barStyle="dark-content"     // 아이콘/텍스트 색상 (밝은 배경용)
      />

      {/* Stack 네비게이터 설정 */}
      <Stack.Navigator initialRouteName="PillSearchScreen">
        {/* 메인 화면: 알약 검색 메뉴 */}
        <Stack.Screen
          name="PillSearchScreen"
          component={PillSearchScreen}
          options={{ headerShown: false }} // React Navigation 기본 헤더 숨김
        />

        {/* 분석 결과 화면 */}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;



