# tasks.py

import os
import cv2
import base64
import numpy as np
from celery import Celery
from tensorflow.keras.models import load_model
from PIL import ImageFont

# 로컬 모듈 임포트
from database_handler import load_database
from object_detection import detect_pills
from pill_analyzer import process_and_visualize_pills # 이전에 만든 메인 처리 함수

# --- 1. Celery 설정 ---
# 'redis://localhost:6379/0'는 Redis 서버의 주소입니다.
# broker: 작업(task)을 저장
# backend: 작업 결과를 저장
celery_app = Celery(
    'tasks',
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/0'
)

celery_app.conf.update(
    # 결과가 Redis 백엔드에 저장된 후 3600초 (1시간)가 지나면 자동으로 삭제됩니다.
    # 클라이언트가 결과를 가져갔는지 여부와 상관없이 삭제됩니다.
    result_expires=3600,
)

# --- 2. 모델, DB, 폰트 미리 로드 ---
# Celery 워커가 시작될 때 딱 한 번만 모델을 로드하여 효율성을 높입니다.
print("Loading models and database for Celery worker...")
SHAPE_MODEL_PATH = "weights/shape_model.h5"
DB_PATH = "database/pill.csv"
YOLO_MODEL_PATH = "weights/detection_model.pt"
FONT_PATH_BOLD = "fonts/malgunbd.ttf"
FONT_SIZE = 18

PILL_DB = load_database(DB_PATH)
SHAPE_MODEL = load_model(SHAPE_MODEL_PATH)
PIL_FONT = ImageFont.truetype(FONT_PATH_BOLD, FONT_SIZE)
print("Models and database loaded successfully.")


# --- 3. Celery Task 생성 ---
@celery_app.task
def analyze_pill_image_task(image_string):
    """
    Base64 인코딩된 이미지 문자열을 받아 알약 분석을 수행하는 Celery Task.
    """
    # Base64 문자열을 다시 이미지(numpy array)로 디코딩
    npimg = np.frombuffer(base64.b64decode(image_string), np.uint8)
    original_image = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    # 알약 탐지
    pill_boxes = detect_pills(original_image, YOLO_MODEL_PATH)

    # 분석 및 시각화 (시간이 오래 걸리는 부분)
    processed_image, candidates = process_and_visualize_pills(
        original_image, pill_boxes, SHAPE_MODEL, PILL_DB, PIL_FONT
    )

    # 결과 이미지를 다시 Base64 문자열로 인코딩
    _, buffer = cv2.imencode('.jpg', processed_image)
    img_str = base64.b64encode(buffer).decode('utf-8')

    # JSON 형태로 최종 결과를 반환 (이 결과는 Redis backend에 저장됨)
    return {
        'image': 'data:image/jpeg;base64,' + img_str,
        'candidates': candidates
    }

