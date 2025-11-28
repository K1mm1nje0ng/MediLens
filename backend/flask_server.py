

from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import ImageFont, Image, ImageDraw
import cv2
import numpy as np
import os
import base64
import re
from tensorflow.keras.models import load_model

# 로컬 모듈 임포트
from object_detection import detect_pills
from image_preprocessing import remove_background
from color_analysis import get_dominant_color
from shape_analysis import classify_shape_with_ai
from database_handler import load_database, find_best_match
from imprint_analysis import get_imprint
from api_handler import get_pill_details_from_api

# --- Flask 앱 초기화 ---
app = Flask(__name__)
CORS(app) # 모바일 앱 등 다른 출처에서의 API 요청 허용

# --- 전역 변수 및 모델 로딩 ---
YOLO_MODEL_PATH = "weights/detection_model.pt"
SHAPE_MODEL_PATH = "weights/shape_model.h5"
DB_PATH = "database/pill.csv"
FONT_PATH_BOLD = "fonts/malgunbd.ttf"
FONT_SIZE = 18

# 서버 시작 시 모델과 DB를 미리 로드
PILL_DB = load_database(DB_PATH)
SHAPE_MODEL = None
try:
    SHAPE_MODEL = load_model(SHAPE_MODEL_PATH)
    print(f"'{SHAPE_MODEL_PATH}' 모양 분류 모델을 성공적으로 불러왔습니다.")
except Exception as e:
    print(f"오류: '{SHAPE_MODEL_PATH}' 모델을 불러올 수 없습니다. {e}")

PIL_FONT = ImageFont.load_default()
try:
    PIL_FONT = ImageFont.truetype(FONT_PATH_BOLD, FONT_SIZE)
except IOError:
    print(f"경고: '{FONT_PATH_BOLD}' 폰트를 찾을 수 없습니다.")


# --- 유틸리티 함수 ---
def draw_korean_text_on_image(image, text, position):
    """ Pillow를 사용하여 이미지에 한글 텍스트를 그림 """
    pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(pil_image)
    
    try: _, _, text_width, text_height = PIL_FONT.getbbox(text)
    except AttributeError: text_width, text_height = PIL_FONT.getsize(text)

    x, y = position
    draw.rectangle(((x, y - text_height - 10), (x + text_width + 10, y)), fill=(0, 255, 0))
    draw.text((x + 5, y - text_height - 7), text, font=PIL_FONT, fill=(0, 0, 0))
    
    return cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)


# --- API 엔드포인트 ---
@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': '파일이 없습니다.'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': '파일이 선택되지 않았습니다.'}), 400

    filestr = file.read()
    npimg = np.frombuffer(filestr, np.uint8)
    original_image = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    pill_boxes = detect_pills(original_image, YOLO_MODEL_PATH)
    
    candidates_by_box = []
    
    for box in pill_boxes:
        x1, y1, x2, y2 = box
        cropped_pill = original_image[y1:y2, x1:x2]
        
        # main.py의 분석 흐름을 그대로 따름
        pill_without_bg, pill_mask = remove_background(cropped_pill.copy())
        
        # 색상 분석
        _, color_candidates = get_dominant_color(pill_without_bg)
        print(color_candidates)
        
        # 모양 분석을 위한 이진화 및 스무딩 -----------
        gray_pill = cv2.cvtColor(pill_without_bg, cv2.COLOR_BGR2GRAY)
        _, binarized_image = cv2.threshold(gray_pill, 10, 255, cv2.THRESH_BINARY)
        
        smoothed_binarized_image = binarized_image.copy()
        contours, _ = cv2.findContours(binarized_image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if contours:
            pill_contour = max(contours, key=cv2.contourArea)
            perimeter = cv2.arcLength(pill_contour, True)
            epsilon = 0.005 * perimeter 
            approximated_contour = cv2.approxPolyDP(pill_contour, epsilon, True)
            smoothed_binarized_image = np.zeros_like(binarized_image)
            cv2.drawContours(smoothed_binarized_image, [approximated_contour], -1, (255), -1)
        #-----------------------------------------------------    
        
        # AI로 모양 분석
        if SHAPE_MODEL:
            shape_result = classify_shape_with_ai(smoothed_binarized_image, SHAPE_MODEL)
            print(shape_result)
        
        
        # 각인 분석
        imprint_text = get_imprint(cropped_pill.copy(), pill_mask)
        print(imprint_text)

        # DB 조회
        candidate_pills = find_best_match(PILL_DB, shape_result, color_candidates, imprint_text)
        print(candidate_pills)
        
        if candidate_pills:
            top_candidate = candidate_pills[0]
            label = f"{top_candidate['pill_info']}"
            original_image = draw_korean_text_on_image(original_image, label, (x1, y1))
            cv2.rectangle(original_image, (x1, y1), (x2, y2), (0, 255, 0), 2)
            candidates_by_box.append(candidate_pills)
        else:
            cv2.rectangle(original_image, (x1, y1), (x2, y2), (0, 0, 255), 2)
            original_image = draw_korean_text_on_image(original_image, "Unknown", (x1, y1))

    _, buffer = cv2.imencode('.jpg', original_image)
    img_str = base64.b64encode(buffer).decode('utf-8')
    
    return jsonify({
        'image': 'data:image/jpeg;base64,' + img_str,
        'candidates': candidates_by_box
    })

@app.route('/detail')
def detail():
    item_code = request.args.get('code')
    if not item_code:
        return jsonify({'error': '품목기준코드가 필요합니다.'}), 400
        
    details = get_pill_details_from_api(item_code)
    return jsonify(details)

# --- 서버 실행 ---
if __name__ == '__main__':
    # ★★★ 변경된 부분: use_reloader=False를 추가하여 자동 재시작 문제 해결 ★★★
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)


