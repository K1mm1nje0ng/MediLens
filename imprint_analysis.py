# imprint_analysis.py

import cv2
import pytesseract
import numpy as np
import re
from image_preprocessing import preprocess_engraved, preprocess_printed, preprocess_adaptive

try:
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
except Exception:
    print("Tesseract 실행 파일을 찾을 수 없습니다. imprint_analysis.py 파일의 경로를 확인해주세요.")


def recognize_text_specialized(image):
    """
     "알파벳 전용" 모드와 "숫자 전용" 모드로 각각 OCR을 실행하여 더 정확한 결과를 찾습니다.
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
    kernel = np.ones((2, 2), np.uint8)
    thick_image = cv2.dilate(gray, kernel, iterations=1)
    upscaled = cv2.resize(thick_image, None, fx=2.5, fy=2.5, interpolation=cv2.INTER_CUBIC)

    # 두 가지 모드(알파벳 전용, 숫자 전용)에 대한 설정
    configs = {
        "alpha": r'-c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        "numeric": r'-c tessedit_char_whitelist=0123456789'
    }

    results = {}

    for mode, whitelist in configs.items():
        best_text_for_mode = ""
        max_avg_conf_for_mode = 0

        # 다양한 각도와 psm 모드를 시도
        for psm in [7, 8, 6]:
            for angle in range(0, 360, 30):
                h, w = upscaled.shape
                center = (w // 2, h // 2)
                M = cv2.getRotationMatrix2D(center, angle, 1.0)
                rotated = cv2.warpAffine(upscaled, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

                custom_config = f'--oem 3 --psm {psm} {whitelist}'
                data = pytesseract.image_to_data(rotated, config=custom_config, output_type=pytesseract.Output.DICT)

                words, confidences = [], []
                for i in range(len(data['text'])):
                    if int(data['conf'][i]) > 50 and data['text'][i].strip() != '':
                        words.append(data['text'][i])
                        confidences.append(int(data['conf'][i]))

                if words:
                    current_text, avg_conf = "".join(words), np.mean(confidences)
                    if avg_conf > max_avg_conf_for_mode:
                        max_avg_conf_for_mode, best_text_for_mode = avg_conf, current_text

        results[mode] = {"text": best_text_for_mode, "confidence": max_avg_conf_for_mode}

    # 알파벳 모드와 숫자 모드의 신뢰도를 비교하여 최종 결과 선택
    alpha_res = results["alpha"]
    numeric_res = results["numeric"]

    print(f"      - 알파벳 모드: '{alpha_res['text']}' (신뢰도 {alpha_res['confidence']:.2f}%)")
    print(f"      - 숫자 모드: '{numeric_res['text']}' (신뢰도 {numeric_res['confidence']:.2f}%)")

    # 신뢰도가 더 높은 쪽을 최종 결과로 선택하되, 신뢰도 차이가 크지 않으면 알파벳을 우선함
    if alpha_res['confidence'] > numeric_res['confidence'] + 5:
        return alpha_res['text'], alpha_res['confidence']
    elif numeric_res['confidence'] > alpha_res['confidence'] + 5:
        return numeric_res['text'], numeric_res['confidence']
    else:
        # 신뢰도가 비슷하면 둘 중 더 긴 텍스트를 선택 (보통 더 정확)
        if len(alpha_res['text']) >= len(numeric_res['text']):
            return alpha_res['text'], alpha_res['confidence']
        else:
            return numeric_res['text'], numeric_res['confidence']



def get_imprint(original_pill_image, pill_mask, debug=False):
    """
    개선된 OCR 함수(recognize_text_specialized)를 호출하도록 수정
    """
    print("  - [각인 분석] 다양한 전처리 방법 적용 중...")
    candidate_images = {
        "Engraved (음각)": preprocess_engraved(original_pill_image.copy(), pill_mask),
        "Printed (양각)": preprocess_printed(original_pill_image.copy(), pill_mask),
        "Adaptive (범용)": preprocess_adaptive(original_pill_image.copy(), pill_mask),
    }

    results = []

    for method_name, image in candidate_images.items():
        if debug:
            cv2.imshow(f"Debug: {method_name}", image)

        print(f"    - '{method_name}' 방법으로 분석 시도:")
        text, confidence = recognize_text_specialized(image)  # 새로운 함수 호출
        if text:
            results.append({
                "method": method_name, "text": text,
                "confidence": confidence, "length": len(text)
            })

    if debug:
        print("\n  [디버그] 각인 분석 이미지 확인 중... 아무 키나 누르면 계속 진행합니다.")
        cv2.waitKey(0)
        cv2.destroyAllWindows()

    if not results:
        print("  - [각인 분석] 최종 각인을 찾지 못했습니다.")
        return ""

    for res in results:
        res['score'] = (res['confidence'] * 0.7) + (res['length'] * 0.3 * 10)

    best_result = max(results, key=lambda x: x['score'])

    print(f"  - [각인 분석] 최종 선택: '{best_result['text']}' (방법: {best_result['method']})")
    return best_result['text']