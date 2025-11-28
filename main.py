import os
from dotenv import load_dotenv

load_dotenv()

import cv2
import numpy as np
from tensorflow.keras.models import load_model
from PIL import ImageFont, ImageDraw, Image

# 로컬 모듈 임포트
from object_detection import detect_pills
from image_preprocessing import remove_background
from color_analysis import analyze_pill_colors
from shape_analysis import classify_shape_with_ai
from database_handler import load_database, find_best_match
from imprint_analysis import get_imprint as get_imprint_tesseract
from imprint_analysis_google import analyze_imprint_google


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
    return cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
    # -------------------------------------------------------


# --- 메인 실행 로직 ---
if __name__ == "__main__":
    OCR_ENGINE = "google"
    # ------------------------------------
    # Tesseract 전용 디버그 모드
    DEBUG_MODE = False
    # ---------------------------------------------------

    IMAGE_PATH = "test_image/A11AKP08K005702.jpg"
    YOLO_MODEL_PATH = 'weights/detection_model.pt'
    SHAPE_MODEL_PATH = "weights/shape_model.h5"
    OUTPUT_DIR = "output_images"
    DB_PATH = "database/pill.csv"
    FONT_PATH = "fonts/NotoSansKR-Medium.ttf"

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

    # ---  최종 종합 분석을 위한 정보 수집기 ---
    all_shape_results = []
    all_color_sets = set()
    all_imprint_texts = []
    # ------------------------------------------------

    for i, box in enumerate(pill_boxes):
        x1, y1, x2, y2 = box

        # 1. YOLO가 잘라낸 원본 이미지
        cropped_pill = original_image[y1:y2, x1:x2]

        if cropped_pill is None or cropped_pill.size == 0:
            print(f"알약 #{i + 1}을 크롭하는 데 실패했습니다. 건너뜁니다.")
            continue

        print(f"\n--- 알약 #{i + 1} 개별 분석 시작 ---")

        # 2. 배경 제거 (모양/색상 분석용)
        pill_without_bg, pill_mask = remove_background(cropped_pill.copy())

        # 색상 분석 (배경 제거된 이미지 사용)
        rgb_list, color_list = analyze_pill_colors(pill_without_bg)
        color_candidates_str = " ".join(sorted(color_list))
        print(f"  - 식별된 색상: {color_candidates_str} (대표 RGB: {rgb_list[0] if rgb_list else 'N/A'})")
        all_color_sets.update(color_list)  # 종합 색상 세트에 추가

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
            
            contour_area = cv2.contourArea(pill_contour)
            min_rect = cv2.minAreaRect(pill_contour) 
            box_width, box_height = min_rect[1]
            box_area = box_width * box_height
            
            if box_area > 0:
                fill_ratio = contour_area / box_area
        else:
            fill_ratio = None


        # AI로 모양 분석
        shape_result = "모델 로드 실패"
        if shape_model:
            shape_result = classify_shape_with_ai(smoothed_binarized_image, shape_model)
        
            if shape_result:
                primary_prediction = shape_result[0][0]
                if primary_prediction in ['타원형', '장방형'] and fill_ratio and fill_ratio > 0:
                    print(f"  --- AI: {primary_prediction}, Fill Ratio: {fill_ratio:.2f} ---")

                    scores_dict = dict(shape_result)
                    if fill_ratio < 0.89: # 89% 미만이면 타원형
                        if primary_prediction != '타원형':
                            if not(scores_dict['장방형'] > 0.9):
                                temp = scores_dict['타원형']
                                scores_dict['타원형'] = scores_dict['장방형']
                                scores_dict['장방형'] = temp
                    else: # 85% 이상이면 장방형
                        if primary_prediction != '장방형':
                            if not(scores_dict['타원형'] > 0.9):
                                temp = scores_dict['장방형']
                                scores_dict['장방형'] = scores_dict['타원형']
                                scores_dict['타원형'] = temp
                    shape_result_list = list(scores_dict.items())
                    shape_result_list.sort(key=lambda x: x[1], reverse=True)
                    formatted_list = [f"{name} ({conf:.2%})" for name, conf in shape_result_list]
                else:
                    formatted_list = [f"{name} ({conf:.2%})" for name, conf in shape_result]
                shape_result = ", ".join(formatted_list)
        
                    
        print(f"  - AI 모양 분석 결과: {shape_result}")
        all_shape_results.append(shape_result)  #  종합 모양 리스트에 추가

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
        if imprint_text:  # 빈 각인이 아니면 종합 리스트에 추가
            all_imprint_texts.append(imprint_text)
        # ---------------------------------------------

        #  루프 내에서는 최종 후보를 계산하지 않음.
        #  대신 이미지에 사각형만 먼저 그림
        cv2.rectangle(original_image, (x1, y1), (x2, y2), (0, 255, 0), 2)

        print("  ---------------------------------")

    # --- 모든 알약 분석 후, 종합하여 최종 후보 계산 ---
    print("\n\n---  최종 종합 분석 결과  ---")

    # 1. 종합 각인 (중복 제거 및 공백으로 합치기)
    combined_imprint = " ".join(sorted(list(set(all_imprint_texts))))
    print(f"  - (종합) 식별된 각인: '{combined_imprint}'")

    # 2. 종합 색상
    combined_colors = " ".join(sorted(list(all_color_sets)))
    print(f"  - (종합) 식별된 색상: {combined_colors}")

    # 3. 종합 모양 (첫 번째 알약의 분석 결과를 대표로 사용)
    combined_shape_info = ""
    if all_shape_results:
        combined_shape_info = all_shape_results[0]
        # (참고) 모든 모양이 일치하는지 확인할 수 있으나,
        # '앞/뒤'를 가정한 것이므로 첫 번째(또는 가장 신뢰도 높은) 모양을 대표로 사용
        print(f"  - (종합) AI 모양 분석 (대표): {combined_shape_info}")
    else:
        print("  - (종합) AI 모양 분석: 분석 결과 없음")

    # --- 데이터베이스 매칭 ---
    print("\n\n  ---------------------------------")
    print("  =>  최종 식별 후보 (종합) ")

    final_candidate_pills = find_best_match(pill_db, combined_shape_info, combined_colors, combined_imprint)

    if final_candidate_pills:
        for candidate in final_candidate_pills:
            print(f"     - {candidate['pill_info']} (점수: {candidate['score']})")

        # --- 최종 결과 이미지에 라벨 그리기 ---
        # 1등 후보의 정보로 모든 박스에 라벨을 붙임
        top_candidate = final_candidate_pills[0]
        label = "알약"

        for box in pill_boxes:
            x1, y1, _, _ = box
            # 폰트 크기(18)에 맞춰 대략적인 라벨 박스 계산
            label_box_width = len(label) * 16 + 10
            cv2.rectangle(original_image, (x1, y1 - 25), (x1 + label_box_width, y1), (0, 255, 0), -1)
            original_image = draw_korean_text(original_image, label, (x1, y1 - 25), FONT_PATH, 18, (0, 0, 0))

    else:
        print("  => 최종 식별 결과: 데이터베이스에서 일치하는 알약을 찾을 수 없습니다.")
    print("  ---------------------------------")


    final_output_path = os.path.join(OUTPUT_DIR, "final_result.jpg")
    cv2.imwrite(final_output_path, original_image)
    print(f"\n\n모든 분석이 완료되었습니다. 최종 결과는 '{final_output_path}'에 저장되었습니다.")