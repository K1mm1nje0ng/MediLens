# image_preprocessing.py

import cv2
import numpy as np


def remove_background(image):
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


def preprocess_engraved(image, mask):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    denoised = cv2.bilateralFilter(gray, 9, 75, 75)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    clahe_img = clahe.apply(denoised)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (21, 7))
    blackhat = cv2.morphologyEx(clahe_img, cv2.MORPH_BLACKHAT, kernel)
    _, thresholded = cv2.threshold(blackhat, 10, 255, cv2.THRESH_BINARY)

    # --- [오류 수정] cv2.MORPH_OPEN 인자를 추가했습니다. ---
    opening_kernel = np.ones((3, 3), np.uint8)
    opened = cv2.morphologyEx(thresholded, cv2.MORPH_OPEN, opening_kernel, iterations=1)
    # ---------------------------------------------------

    final_image = cv2.bitwise_and(opened, opened, mask=mask)
    return cv2.bitwise_not(final_image)

def preprocess_printed(image, mask):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    denoised = cv2.medianBlur(gray, 5)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    clahe_img = clahe.apply(denoised)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (21, 7))
    tophat = cv2.morphologyEx(clahe_img, cv2.MORPH_TOPHAT, kernel)
    _, thresholded = cv2.threshold(tophat, 15, 255, cv2.THRESH_BINARY)
    dilated = cv2.dilate(thresholded, np.ones((3, 3), np.uint8), iterations=1)
    final_image = cv2.bitwise_and(dilated, dilated, mask=mask)
    return cv2.bitwise_not(final_image)


def preprocess_adaptive(image, mask):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (3, 3), 0)
    edges = cv2.Canny(blurred, 50, 150)
    dilated_edges = cv2.dilate(edges, np.ones((2, 2), np.uint8), iterations=1)
    final_image = cv2.bitwise_and(dilated_edges, dilated_edges, mask=mask)
    return cv2.bitwise_not(final_image)