import os
import logging
import re
import cv2
from google.cloud import vision
from google.api_core import exceptions as google_exceptions


# --- [수정된 부분: 파일 전체] ---

def init_google_vision():
    """
    Google Vision API 클라이언트를 초기화합니다.
    main.py에서 load_dotenv()가 이미 실행되어
    GOOGLE_APPLICATION_CREDENTIALS 환경 변수가 설정되어 있어야 합니다.
    """
    try:
        # GOOGLE_APPLICATION_CREDENTIALS 환경 변수를 자동으로 읽어 클라이언트를 생성합니다.
        client = vision.ImageAnnotatorClient()
        # logging.info("Google Vision API 클라이언트가 성공적으로 초기화되었습니다.")
        # ➔ main.py에서 이미 "GOOGLE OCR 모드"로 실행한다고 출력하므로 중복 로깅 제거
        return client
    except google_exceptions.DefaultCredentialsError as e:
        logging.error(f"Google Vision API 인증 실패: {e}")
        logging.error("GOOGLE_APPLICATION_CREDENTIALS 환경 변수가 올바르게 설정되었는지, .env 파일과 JSON 키 파일 경로를 확인하세요.")
        return None
    except Exception as e:
        logging.error(f"Google Vision 클라이언트 초기화 중 알 수 없는 오류 발생: {e}")
        return None


# 이 모듈이 임포트될 때 클라이언트를 *한 번만* 초기화합니다.
google_vision_client = init_google_vision()


def analyze_imprint_google(image):
    """
    Google Vision API를 사용하여 이미지에서 텍스트(각인)를 추출합니다.
    main.py에서 이 함수를 직접 호출합니다.
    """
    if google_vision_client is None:
        # ➔ main.py 실행 시 보셨던 "초기화되지 않았다"는 오류가 여기서 발생합니다.
        logging.warning("- Google Vision 클라이언트가 초기화되지 않아 OCR을 건너뜁니다.")
        return ""

    try:
        # OpenCV 이미지를 Google Vision이 읽을 수 있는 형식으로 변환
        _, encoded_image = cv2.imencode('.png', image)
        content = encoded_image.tobytes()
        vision_image = vision.Image(content=content)

        # 텍스트 감지 (OCR)
        response = google_vision_client.text_detection(image=vision_image)
        texts = response.text_annotations

        if response.error.message:
            logging.error(f"Google Vision API 오류: {response.error.message}")
            return ""

        if texts:
            # 첫 번째 텍스트(전체 감지 내용)를 사용
            detected_text = texts[0].description
            # OCR 결과 정제: 공백, 특수문자 제거, 영문/숫자만 남김
            cleaned_text = re.sub(r'[\W_]+', '', detected_text).strip()

            if cleaned_text:
                # main.py에서 "인식된 각인:"을 출력하므로 여기서는 반환만 합니다.
                return cleaned_text

        # main.py에서 "인식된 각인: ''"으로 출력될 것이므로 별도 로깅 안 함
        return ""

    except Exception as e:
        logging.error(f"Google Vision OCR 실행 중 오류: {e}")
        return ""