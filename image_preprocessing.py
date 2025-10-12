# image_preprocessing.py

import cv2
import numpy as np


def remove_background(image):
    """이미지에서 배경을 제거하고 알약 마스크를 생성합니다."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        return image, np.ones(image.shape[:2], dtype=np.uint8) * 255

    pill_contour = max(contours, key=cv2.contourArea)

    if len(pill_contour) >= 5:
        ellipse = cv2.fitEllipse(pill_contour)
    else:
        (x, y), (w, h), angle = cv2.minAreaRect(pill_contour)
        ellipse = ((x, y), (w, h), angle)

    mask = np.zeros(gray.shape, dtype=np.uint8)
    cv2.ellipse(mask, ellipse, (255), -1)
    result = cv2.bitwise_and(image, image, mask=mask)
    return result, mask


def preprocess_for_tesseract(image, mask):
    """
    모폴로지 그라디언트(Morphological Gradient)를 사용하여
    글자의 '외곽선'만 정확히 추출, Tesseract의 정확도를 극대화합니다.
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # 1. CLAHE를 적용하여 이미지의 국소적 명암 대비를 향상시킵니다.
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    gray_enhanced = clahe.apply(gray)

    # 2. [핵심] 모폴로지 그라디언트 연산을 적용하여 글자의 외곽선을 추출합니다.
    kernel = np.ones((2, 2), np.uint8)
    gradient = cv2.morphologyEx(gray_enhanced, cv2.MORPH_GRADIENT, kernel)

    # 3. Otsu의 이진화로 최적의 임계값을 찾아 외곽선만 깔끔하게 추출합니다.
    _, binary = cv2.threshold(gradient, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # 4. 마스크를 적용하여 알약 영역 밖의 노이즈를 최종적으로 제거합니다.
    final_image = cv2.bitwise_and(binary, binary, mask=mask)

    # Tesseract는 '흰 배경, 검은 글씨'를 더 잘 인식하므로 이미지를 반전시킵니다.
    return cv2.bitwise_not(final_image)