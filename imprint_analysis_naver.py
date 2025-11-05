import cv2
import re
import requests
import json
import uuid
import time
import base64
import os
from dotenv import load_dotenv

# .env 파일에서 환경 변수 로드
load_dotenv()

# ⚠️ [수정] --- API URL과 Secret Key 모두 .env 파일에서 불러옵니다 ---
API_URL = os.getenv("NAVER_CLOVA_API_URL").strip()
SECRET_KEY = os.getenv("NAVER_CLOVA_API_KEY").strip()


# --------------------------------------------------------------------


# 네이버 CLOVA OCR API를 호출하는 단일 함수
def recognize_text_naver_ocr(image):
    """
    네이버 CLOVA OCR API를 호출하여 이미지에서 텍스트를 인식
    """
    if not API_URL or "YOUR_API_URL_HERE" in API_URL or not API_URL.startswith("https"):
        print("    - [오류] .env 파일의 NAVER_CLOVA_API_URL이 잘못되었습니다.")
        return ""

    if not SECRET_KEY or "YOUR_SECRET_KEY" in SECRET_KEY:
        print("    - [오류] .env 파일의 NAVER_CLOVA_API_KEY가 잘못되었습니다.")
        return ""

    # 이미지를 base64로 인코딩
    _, buffer = cv2.imencode('.jpg', image)
    image_base64 = base64.b64encode(buffer).decode('utf-8')

    request_json = {
        'images': [{'format': 'jpg', 'name': 'pill_image', 'data': image_base64}],
        'requestId': str(uuid.uuid4()),
        'version': 'V2',
        'timestamp': int(round(time.time() * 1000))
    }

    payload = json.dumps(request_json).encode('UTF-8')
    headers = {
        'X-OCR-SECRET': SECRET_KEY,
        'Content-Type': 'application/json'
    }

    try:
        response = requests.post(API_URL, headers=headers, data=payload)
        response.raise_for_status()  # HTTP 오류가 발생하면 예외 발생
        result = response.json()

        # 인식된 텍스트들을 하나로 합침
        full_text = ""
        for field in result['images'][0]['fields']:
            full_text += field['inferText']

        cleaned_text = re.sub(r'[^A-Z0-9]', '', full_text.upper())
        return cleaned_text

    except requests.exceptions.RequestException as e:
        print(f"    - 네이버 OCR API 호출 오류: {e}")
        # 오류 상세 내용 출력 (디버깅용)
        try:
            print(f"    - 응답 내용: {response.text}")
        except:
            pass
        return ""


# --- 결과를 보내는 메인 함수 ---
def analyze_imprint_naver(original_pill_image):
    """
    YOLO가 잘라낸 '원본' 이미지를 네이버 OCR로 분석하여 각인 텍스트를 추출
    """

    # OCR 분석
    print("    - 네이버 OCR 분석 시도...")
    imprint_text = recognize_text_naver_ocr(original_pill_image)  # ◀◀ 원본 크롭 이미지 전달
    print(f"      => 결과: '{imprint_text}'")

    return imprint_text