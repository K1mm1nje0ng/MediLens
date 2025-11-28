# 📱 메디렌즈 (MediLens) - Client

**메디렌즈(MediLens)**의 안드로이드 프론트엔드 애플리케이션입니다. React Native와 TypeScript로 구축되었으며, 사용자가 알약을 촬영하거나 갤러리에서 선택하면 AI 서버와 통신하여 실시간으로 정확한 식별 정보와 상세 데이터를 제공합니다.

## 1. 프로젝트 소개

복잡한 약물 식별 과정을 모바일 환경에 최적화하여, 누구나 쉽고 빠르게 알약 정보를 찾을 수 있도록 돕습니다.

### ✨ 주요 기능 (App Features)

* **스마트 촬영 & 이미지 로드:**
    * **Camera & Gallery:** `react-native-image-picker`를 사용하여 즉시 촬영하거나 앨범 이미지를 분석합니다.
    * **Smart Permissions:** Android 버전(13 이상/미만)을 감지하여 `READ_MEDIA_IMAGES` 또는 `READ_EXTERNAL_STORAGE` 권한을 자동으로 분기 처리합니다.
* **실시간 분석 상태 시각화:**
    * **Polling System:** 이미지 전송 후 `LoadingOverlay`를 통해 서버의 분석 진행 상황(Pending → Success)을 실시간으로 사용자에게 안내합니다.
* **다중 객체 결과 그룹화:**
    * **Grouping UI:** 한 번의 촬영으로 여러 알약이 탐지될 경우, **`ImageResultGroupScreen`**에서 그룹별로 후보를 나누어 직관적으로 보여줍니다.
    * **Zoom In:** 분석된 결과 이미지를 탭하여 전체 화면으로 확대, 탐지된 영역을 자세히 확인할 수 있습니다.
* **무한 스크롤 리스트:**
    * **Pagination:** 검색 결과가 많을 경우 `FlatList`의 `onEndReached`를 활용한 페이지네이션으로 데이터를 끊김 없이 로드합니다.
* **검색 보정 (Interactive Search):**
    * **Edit Query:** AI 분석 결과가 실제와 다를 경우, **'찾은 약 수정하기'**를 통해 분석된 특징(모양, 색상 등)을 유지한 채 검색 화면으로 이동하여 조건을 미세 조정할 수 있습니다.

## 🛠️ 기술 스택

| Category | Technology |
| :--- | :--- |
| **Framework** | React Native (CLI), TypeScript |
| **Networking** | Native Fetch API (Multipart/form-data)|
| **Navigation** | React Navigation (Native Stack) |
| **UI Components** | Custom Components, `react-native-vector-icons` |
| **Media & Permissions** | `react-native-image-picker`, `PermissionsAndroid` |

## 📂 프로젝트 구조

```bash
src
├── api/
│   ├── client.ts             # 기본 API 설정 (Base URL)
│   └── pillApi.ts            # 백엔드 통신 모듈 (Predict, Search, Status, Detail)
├── components/
│   └── LoadingOverlay.tsx    # 로딩 인디케이터 및 모달 컴포넌트
├── hooks/
│   ├── useCamera.ts          # 카메라 촬영 로직 및 권한 처리 훅
│   └── useGallery.ts         # 갤러리 선택 로직 및 권한 처리 훅
├── screens/
│   ├── PillSearchScreen.tsx      # 메인 대시보드 (촬영/검색 진입)
│   ├── DirectSearchScreen.tsx    # 조건 직접 입력 및 필터링
│   ├── ImageResultGroupScreen.tsx # 다중 객체 탐지 결과 그룹 확인
│   ├── SearchResultListScreen.tsx # 검색 결과 리스트 (무한 스크롤)
│   └── ResultScreen.tsx          # 알약 상세 정보, 이미지 확대, 수정
└── types/
    └── navigation.ts         # 네비게이션 스택 및 데이터 타입(Interface) 정의

```
## ⚙️ 환경 설정

### 1. 필수 라이브러리 설치

프로젝트 루트 디렉토리에서 의존성 라이브러리를 설치합니다.

```bash
npm install
```
### 2. 서버 주소 설정

`src/api/client.ts` 파일에서 백엔드 API 서버의 주소를 설정합니다.

```typescript
// src/api/client.ts
export const BASE_URL = 'http://YOUR_SERVER_IP:5000'; // 실제 서버 IP 입력
```
### 3. 안드로이드 권한 설정

카메라 및 갤러리 기능을 사용하기 위해 `android/app/src/main/AndroidManifest.xml`에 아래 권한이 필요합니다.

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```
## ▶️ 실행 방법

### 📱 Android

에뮬레이터 또는 USB 디버깅이 활성화된 안드로이드 기기를 연결 후 실행합니다.

```bash
npm run android
```
## 📄 주요 파일 기능 설명

| 파일명 | 주요 기능 |
| :--- | :--- |
| **App.tsx** | 앱의 진입점. `NavigationContainer`와 `Stack.Navigator`를 설정합니다. |
| **PillSearchScreen.tsx** | 메인 화면. 카메라/갤러리 기능을 호출하고 **비동기 폴링 로직**을 통해 전체 분석 프로세스를 제어합니다. |
| **DirectSearchScreen.tsx** | 모양, 색상, 제형 등 필터를 설정하여 알약을 직접 검색합니다. |
| **ImageResultGroupScreen.tsx** | YOLOv8 모델이 탐지한 다중 객체(알약)들을 그룹화하여 시각적으로 보여줍니다. |
| **SearchResultListScreen.tsx** | 검색된 알약 목록을 보여줍니다. **페이지네이션**을 통해 서버 부하를 줄이고 UX를 최적화했습니다. |
| **ResultScreen.tsx** | 알약의 상세 효능, 용법, 주의사항을 보여줍니다. 텍스트 더보기/접기 및 이미지 확대 기능을 제공합니다. |
| **pillApi.ts** | `postPredict`(분석 요청) → `getStatus`(상태 확인) → `getResult`(결과 수신)로 이어지는 핵심 통신 모듈입니다. |

### 🔌 백엔드 연동 로직 (Analysis Flow)

서버 부하 분산과 정확한 처리를 위해 **비동기 폴링(Polling) 방식**을 채택했습니다.

1.  **이미지 전송 (POST):** 사용자가 선택한 이미지를 `/predict`로 전송하고 고유 `task_id`를 발급받습니다.
2.  **상태 확인 (GET):** `/status/{task_id}`를 2초 간격으로 호출하며 분석 상태(`PENDING`/`SUCCESS`)를 모니터링합니다.
3.  **결과 수신 (GET):** 상태가 `SUCCESS`가 되면 `/result/{task_id}`를 호출하여 최종 결과 데이터를 받아옵니다.
4.  **화면 이동:** 수신된 데이터를 바탕으로 결과 그룹 화면 또는 리스트 화면으로 이동합니다.





