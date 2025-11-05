import cv2
import os
import numpy as np
from tensorflow.keras.models import load_model
from PIL import ImageFont, ImageDraw, Image

# 로컬 모듈 임포트
from object_detection import detect_pills
from image_preprocessing import remove_background
from color_analysis import analyze_pill_colors
from shape_analysis import classify_shape_with_ai
from database_handler import load_database, find_best_match

# ⚠️ [수정] --- Naver OCR 임포트 제거 ---
from imprint_analysis import get_imprint as get_imprint_tesseract
from imprint_analysis_google import analyze_imprint_google  # ◀◀◀ Google/Tesseract만 남김


# ---------------------------------------------


# 한글 텍스트를 이미지에 그리는 함수
def draw_korean_text(image, text, position, font_path, font_size, font_color):
    """
    OpenCV 이미지 위에 한글 텍스트를 그림
    """
    pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(pil_image)

    try:
        font = ImageFont.truetype(font_path, font_size)
    except IOError:
        print(f"오류: '{font_path}' 폰트 파일을 찾을 수 없습니다. 기본 폰트를 사용합니다.")
        font = ImageFont.load_default()

    draw.text(position, text, font=font, fill=font_color)

    # ⚠️ [수정] --- cv2.COLOR_RGB_BGR -> cv2.COLOR_RGB2BGR ---
    return cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)  # ◀◀◀ 오타 수정 완료
    # -------------------------------------------------------


# --- 메인 실행 로직 ---
if __name__ == "__main__":

    # ⚠️ [수정] --- OCR 엔진 선택 스위치 ---
    # "google" : Google Vision API (권장)
    # "tesseract" : Tesseract (로컬 무료, 정확도 낮음)
    OCR_ENGINE = "google"  # ◀◀◀ Naver 옵션 제거
    # ------------------------------------

    # Tesseract 전용 디버그 모드
    DEBUG_MODE = False
    # ---------------------------------------------------

    IMAGE_PATH = "test_image/sample.png"  # ◀◀◀ 테스트할 이미지 경로
    YOLO_MODEL_PATH = 'weights/detection_model.pt'
    SHAPE_MODEL_PATH = "weights/shape_model.h5"
    OUTPUT_DIR = "output_images"
    DB_PATH = "database/pill.csv"
    FONT_PATH = "fonts/malgun.ttf"

    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    original_image = cv2.imread(IMAGE_PATH)
    if original_image is None:
        print(f"오류: '{IMAGE_PATH}' 이미지를 찾을 수 없습니다.")
        exit()

    shape_model = None
    try:
        shape_model = load_model(SHAPE_MODEL_PATH)
        print(f"'{SHAPE_MODEL_PATH}' 모양 분류 모델을 성공적으로 불러왔습니다.")
    except Exception as e:
        print(f"오류: '{SHAPE_MODEL_PATH}' 모델을 불러올 수 없습니다. {e}")
        print("모양 분석 기능이 비활성화됩니다.")

    pill_db = load_database(DB_PATH)
    if not pill_db:
        print(f"오류: '{DB_PATH}' 데이터베이스를 불러올 수 없습니다.")
        exit()

    print(f"\n*** [알림] {OCR_ENGINE.upper()} OCR 모드로 실행합니다. ***\n")

    pill_boxes = detect_pills(IMAGE_PATH, YOLO_MODEL_PATH)

    for i, box in enumerate(pill_boxes):
        x1, y1, x2, y2 = box

        # 1. YOLO가 잘라낸 원본 이미지
        cropped_pill = original_image[y1:y2, x1:x2]

        if cropped_pill is None or cropped_pill.size == 0:
            print(f"알약 #{i + 1}을 크롭하는 데 실패했습니다. 건너뜁니다.")
            continue

        print(f"\n--- 알약 #{i + 1} 분석 시작 ---")

        # 2. 배경 제거 (모양/색상 분석용)
        pill_without_bg, pill_mask = remove_background(cropped_pill.copy())

        # 색상 분석 (배경 제거된 이미지 사용)
        rgb_list, color_list = analyze_pill_colors(pill_without_bg)
        color_candidates_str = " ".join(sorted(color_list))
        print(f"  - 식별된 색상: {color_candidates_str} (대표 RGB: {rgb_list[0] if rgb_list else 'N/A'})")

        # 모양 분석을 위한 전처리
        gray_pill = cv2.cvtColor(pill_without_bg, cv2.COLOR_BGR2GRAY)
        _, binarized_image = cv2.threshold(gray_pill, 1, 255, cv2.THRESH_BINARY)

        smoothed_binarized_image = binarized_image.copy()
        contours, _ = cv2.findContours(binarized_image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if contours:
            pill_contour = max(contours, key=cv2.contourArea)
            perimeter = cv2.arcLength(pill_contour, True)
            epsilon = 0.005 * perimeter
            approximated_contour = cv2.approxPolyDP(pill_contour, epsilon, True)
            smoothed_binarized_image = np.zeros_like(binarized_image)
            cv2.drawContours(smoothed_binarized_image, [approximated_contour], -1, (255), -1)

        # AI로 모양 분석
        shape_result = "모델 로드 실패"
        if shape_model:
            shape_result = classify_shape_with_ai(smoothed_binarized_image, shape_model)
        print(f"  - AI 모양 분석 결과: {shape_result}")

        # ⚠️ [수정] --- Naver OCR 관련 'elif' 블록 제거 ---
        imprint_text = ""
        if OCR_ENGINE == "google":
            print("  - [Google API] 각인 분석 중...")
            imprint_text = analyze_imprint_google(cropped_pill.copy())

        elif OCR_ENGINE == "tesseract":
            print("  - [Tesseract] 각인 분석 중...")
            imprint_text = get_imprint_tesseract(cropped_pill.copy(), pill_mask, debug=DEBUG_MODE)
        else:
            print(f"  - [오류] OCR_ENGINE 설정이 잘못되었습니다: {OCR_ENGINE}")

        print(f"  - 인식된 각인: '{imprint_text}'")
        # ---------------------------------------------

        # 최종 알약 추측
        candidate_pills = find_best_match(pill_db, shape_result, color_candidates_str, imprint_text)
        # ---------------------------------------------------

        # 알약 후보군 출력
        print("  ---------------------------------")
        if candidate_pills:
            print("  => 최종 식별 후보:")
            for candidate in candidate_pills:
                print(f"     - {candidate['pill_info']} (점수: {candidate['score']})")

            top_candidate = candidate_pills[0]
            label = f"{top_candidate['pill_info']}"

            cv2.rectangle(original_image, (x1, y1), (x2, y2), (0, 255, 0), 2)
            label_box_width = len(label) * 12 + 10
            cv2.rectangle(original_image, (x1, y1 - 25), (x1 + label_box_width, y1), (0, 255, 0), -1)
            original_image = draw_korean_text(original_image, label, (x1, y1 - 25), FONT_PATH, 18, (0, 0, 0))
        else:
            print("  => 최종 식별 결과: 데이터베이스에서 일치하는 알약을 찾을 수 없습니다.")
        print("  ---------------------------------")

    final_output_path = os.path.join(OUTPUT_DIR, "final_result.jpg")
    cv2.imwrite(final_output_path, original_image)
    print(f"\n\n모든 분석이 완료되었습니다. 최종 결과는 '{final_output_path}'에 저장되었습니다.")