import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 타입 정의 import
import { RootStackParamList } from './src/types/navigation';

// 화면 import
import PillSearchScreen from './src/screens/PillSearchScreen';
import ResultScreen from './src/screens/ResultScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <StatusBar
        hidden={false}              // 상태표시줄 보이기
        backgroundColor="#ffffff"   // Android 전용 배경색
        barStyle="dark-content"     // 아이콘 색상 (밝은 배경에는 dark-content)
      />
      <Stack.Navigator initialRouteName="PillSearchScreen">
        {/* 홈 화면 */}
        <Stack.Screen
          name="PillSearchScreen"
          component={PillSearchScreen}
          options={{ headerShown: false }}
        />

        {/* 결과 화면 */}
        <Stack.Screen
          name="ResultScreen"
          component={ResultScreen}
          options={{ title: '분석 결과' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;


