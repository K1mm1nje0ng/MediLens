import pandas as pd
import numpy as np
import re
from fuzzywuzzy import fuzz

# 색상명과 RGB 값 매핑 (수정/추가 가능)
COLOR_RGB_MAP = {
    '하양': [255, 255, 255],  '검정': [0, 0, 0],        '회색': [149, 165, 166],
    '빨강': [231, 76, 60],    '주황': [230, 126, 34],   '노랑': [241, 196, 15],
    '초록': [39, 174, 96],    '파랑': [52, 152, 219],   '남색': [0, 0, 128],
    '보라': [142, 68, 173],   '분홍': [218, 132, 136],  '갈색': [160, 82, 45], '살구': [240, 190, 160]
}

# RGB 색 공간에서 이론상 가장 먼 거리
MAX_COLOR_DIST = np.sqrt(255 ** 2 * 3)
# 색상 유사도 0점을 받을 기준 거리 (이 값보다 멀어지면 0점)
EFFECTIVE_COLOR_DIST = 120.0


def get_color_distance(color_name1, color_name2):
    """ 두 색상 이름 간의 RGB 공간에서의 유클리드 거리를 계산합니다. """
    rgb1 = COLOR_RGB_MAP.get(color_name1)
    rgb2 = COLOR_RGB_MAP.get(color_name2)

    if rgb1 is None or rgb2 is None:
        # 맵에 없는 색상이면 최대 거리를 반환하여 유사도를 0으로 만듭니다.
        return MAX_COLOR_DIST

    return np.linalg.norm(np.array(rgb1) - np.array(rgb2))


def calculate_color_similarity_score(identified_colors_str, db_colors_str):
    """
    인식된 색상과 DB의 색상 간의 유사도 점수를 계산합니다.
    점수는 0 (완전 다름) 에서 1 (완전 같음) 사이의 값입니다.
    """
    identified_colors = set(identified_colors_str.split())
    db_colors = set(db_colors_str.split())

    if not identified_colors or not db_colors:
        return 0

    total_max_similarity = 0

    # 각 인식된 색상에 대해 DB 색상 중 가장 유사한 것을 찾습니다.
    for id_color in identified_colors:
        max_similarity_for_color = 0
        for db_color in db_colors:
            if id_color == db_color:
                similarity = 1.0
            else:
                distance = get_color_distance(id_color, db_color)
                similarity = max(0, 1 - (distance / EFFECTIVE_COLOR_DIST))

            if similarity > max_similarity_for_color:
                max_similarity_for_color = similarity

        total_max_similarity += max_similarity_for_color

    # 평균 최대 유사도를 최종 점수로 반환합니다.
    return total_max_similarity / len(identified_colors)


def load_database(db_path):
    """
    CSV 데이터베이스를 로드하고, 모든 데이터를 문자열로 변환하여 반환
    """
    try:
        df = pd.read_csv(db_path, encoding='cp949')
        # 모든 열의 데이터를 문자열 타입으로 변환하여 타입 오류 방지
        for col in df.columns:
            df[col] = df[col].astype(str)
        print(f"'{db_path}' 데이터베이스를 성공적으로 불러왔습니다.")
        return df.to_dict('records')
    except Exception as e:
        print(f"데이터베이스 로딩 오류: {e}")
        return None


def normalize_imprint(text):
    """
    알파벳(A-Z)과 숫자(0-9)를 제외한 모든 문자(특수기호, 공백 등)를 제거합니다.
    """
    # 1. str 타입으로 변환하고, 대문자화, 양끝 공백/nan 제거
    text_cleaned = str(text).upper().replace('NAN', '').strip()

    # 2. A-Z, 0-9를 제외한 모든 문자를 빈 문자열("")로 치환
    return re.sub(r"[^A-Z0-9가-힣]", "", text_cleaned)


def calculate_score(row, shape_probabilities, colors, imprint):
    """
    데이터베이스의 약 정보와 분석된 정보를 비교하여 유사도 점수를 계산
    (점수가 높을수록 더 유사함)
    """
    score = 0
    MAX_SHAPE_SCORE = 25
    MAX_COLOR_SCORE = 25
    MAX_IMPRINT_SCORE = 50

    # 1. 모양 점수: AI의 예측 확률에 따라 가중치 부여
    shape_score = 0
    db_shape = row['shape']
    if db_shape in shape_probabilities:
        # 확률값(%)을 100으로 나누어 0~1 사이의 값으로 변환
        probability = shape_probabilities[db_shape] / 100.0
        shape_score = MAX_SHAPE_SCORE * probability
    score += shape_score

    # 2. 색상 점수: 색상 유사도에 따라 점수 부여 (0~30점)
    color_similarity = calculate_color_similarity_score(colors, row['color'])
    score += color_similarity * MAX_COLOR_SCORE

    # --- 각인 점수 계산 로직 수정 (정규화 적용) ---
    # 1. AI가 인식한 각인을 정규화
    imprint_recognized = normalize_imprint(imprint)
    imprint_score = 0

    # 2. DB의 각인 정보를 정규화
    imprint1_db = normalize_imprint(row.get('text', ''))
    imprint2_db = normalize_imprint(row.get('text2', ''))
    db_imprint_full = (imprint1_db + imprint2_db).strip()

    if imprint_recognized:
        # 3-1. 탐지된 각인이 있는 경우
        if db_imprint_full:
            # DB에도 각인이 있으면 유사도 계산
            similarity1 = fuzz.ratio(imprint_recognized, imprint1_db) if imprint1_db else 0
            similarity2 = fuzz.ratio(imprint_recognized, imprint2_db) if imprint2_db else 0
            similarity_full = fuzz.ratio(imprint_recognized, db_imprint_full)

            max_similarity = max(similarity1, similarity2, similarity_full)
            imprint_score = (max_similarity / 100.0) * MAX_IMPRINT_SCORE  # MAX 45점

            # --- 각인 일치도 보너스 ---
            # 정규화 후 95% 이상 일치하면 보너스
            if max_similarity > 95:
                imprint_score += 20  # 20점 추가

        else:
            # (탐지 각인은 있으나 DB 각인이 없으면 0점)
            imprint_score = 0

    elif not db_imprint_full:
        # 3-2. 탐지된 각인도 없고, DB 각인도 없으면 10점 보너스
        imprint_score = 10

    # (3-3. 탐지 각인은 없으나 DB 각인이 있으면 0점 -> 기본값)

    score += imprint_score
    return score


def find_best_match(pill_db, identified_shape_info, identified_colors, identified_imprint):
    """
    분석된 정보를 바탕으로 데이터베이스에서 가장 일치하는 알약 후보를 찾음.
    """

    # 문자열, 딕셔너리 등 어떤 형태로 들어와도 처리 가능하도록 파싱 로직 추가
    shape_probabilities = {}
    if isinstance(identified_shape_info, str) and identified_shape_info:
        # '타원형 (78.55%), 원형 (17.31%)' 과 같은 문자열을 파싱하여 딕셔너리로 변환
        parts = identified_shape_info.split(', ')
        for part in parts:
            try:
                shape, prob_str = part.split(' (')
                prob = float(prob_str.replace('%)', ''))
                shape_probabilities[shape] = prob
            except (ValueError, IndexError):
                continue  # 파싱에 실패하는 경우(예: '(A)...' 등)는 무시
    elif isinstance(identified_shape_info, dict):
        shape_probabilities = identified_shape_info

    # 모양 정보가 없으면(파싱 실패) 빈 딕셔너리 유지
    if not shape_probabilities:
        print("  - [경고] 모양 확률 정보가 파싱되지 않았습니다. 모양 점수가 0이 됩니다.")

    primary_candidates = []
    for row in pill_db:
        # shape_probabilities의 키(모양 이름)를 기준으로 후보군 필터링
        shape_match = row['shape'] in shape_probabilities

        # identified_colors가 비어있을 수 있으므로 split() 전 확인
        color_list = identified_colors.split() if identified_colors else []
        color_match = any(color in row['color'] for color in color_list)

        # 모양이나 색상 중 하나라도 관련이 있거나, 각인이라도 관련있으면 후보군에 포함
        imprint_match = False
        if identified_imprint and (
                identified_imprint in str(row.get('text', '')) or identified_imprint in str(row.get('text2', ''))):
            imprint_match = True

        if shape_match or color_match or imprint_match:
            primary_candidates.append(row)

    if not primary_candidates:
        # 필터링 실패 시 전체 DB를 대상으로 검색 시도
        print("  - [알림] 1차 필터링 후보가 없습니다. 전체 DB를 대상으로 점수를 계산합니다.")
        primary_candidates = pill_db

    candidates = []
    for row in primary_candidates:
        # 파싱된 shape_probabilities 딕셔너리를 점수 계산에 사용
        score = calculate_score(row, shape_probabilities, identified_colors, identified_imprint)
        imprint_display = f"앞:{row.get('text', '')}/뒤:{row.get('text2', '')}"
        pill_info = f"{row['name']} ({row['shape']}, {row['color']}, {imprint_display})"
        candidates.append({'pill_info': pill_info, 'score': score})

    candidates.sort(key=lambda x: x['score'], reverse=True)

    # 점수가 0점 초과인 후보만 5개까지 반환
    return [c for c in candidates if c['score'] > 0][:5]