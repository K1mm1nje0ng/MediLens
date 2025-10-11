# imprint_analysis.py

import cv2
import pytesseract
import numpy as np
from image_preprocessing import preprocess_for_tesseract

# Tesseract OCR 실행 파일 경로 설정 (Windows 기준)
try:
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
except Exception:
    print("Tesseract 실행 파일을 찾을 수 없습니다. 경로를 확인해주세요.")


def get_imprint(original_pill_image, pill_mask, debug=False):
    """
    Tesseract OCR과 '외곽선 추출' 기반 전처리 로직을 사용하여 각인을 분석합니다.
    """
    print("  - [각인 분석] Tesseract OCR + 외곽선 추출 최종 분석 시작...")

    preprocessed_image = preprocess_for_tesseract(original_pill_image.copy(), pill_mask)

    if debug:
        print("\n  [디버그] 전처리된 이미지를 확인하세요. 창을 닫으려면 아무 키나 누르세요.")
        cv2.imshow("Preprocessed Image for Tesseract", preprocessed_image)
        cv2.waitKey(0)  # 사용자가 키를 누를 때까지 대기
        cv2.destroyAllWindows()  # 모든 창 닫기

    upscaled = cv2.resize(preprocessed_image, None, fx=3.0, fy=3.0, interpolation=cv2.INTER_LANCZOS4)

    best_text = ""
    max_confidence = 0.0

    # 다양한 회전 각도를 시도하여 최상의 결과를 찾습니다.
    for angle in range(0, 360, 30):
        h, w = upscaled.shape
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(upscaled, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

        # psm 7: 이미지를 한 줄의 텍스트로 간주
        custom_config = r'--oem 3 --psm 7 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        data = pytesseract.image_to_data(rotated, config=custom_config, output_type=pytesseract.Output.DICT)

        current_words = []
        current_confs = []
        for i in range(len(data['text'])):
            conf = int(data['conf'][i])
            text = data['text'][i].strip()
            if conf > 60 and text:
                current_words.append(text)
                current_confs.append(conf)

        if current_words:
            current_text = "".join(current_words)
            current_conf = np.mean(current_confs)

            if len(current_text) > len(best_text) or \
                    (len(current_text) == len(best_text) and current_conf > max_confidence):
                max_confidence = current_conf
                best_text = current_text

    if not best_text:
        print("  - [각인 분석] 최종 각인을 찾지 못했습니다.")
        return ""

    print(f"  - [각인 분석] 최종 식별된 각인: '{best_text}' (평균 신뢰도: {max_confidence:.2f}%)")
    return best_text