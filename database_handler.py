# database_handler.py

import pandas as pd


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


def get_char_type(s):
    """문자열의 종류(알파벳, 숫자, 혼합 등)를 반환하는 헬퍼 함수"""
    if not s:  # 문자열이 비어있는 경우
        return "none"
    if s.isalpha():
        return "alpha"
    if s.isnumeric():
        return "numeric"
    if s.isalnum():
        return "alnum"
    return "other"


def calculate_score(row, shape, colors, imprint):
    """
    데이터베이스의 약 정보와 분석된 정보를 비교하여 유사도 점수를 계산
    (점수가 높을수록 더 유사함)
    """
    score = 0

    # 1. 모양 점수: 모양이 일치하면 20점 추가
    if row['shape'] in shape:
        score += 30

    # 2. 색상 점수: 색상이 모두 일치하면 20점 추가
    color_match = all(color in row['color'] for color in colors.split())
    if color_match:
        score += 30

    # 3. 각인 점수: 앞/뒤 각인 중 더 비슷한 쪽을 기준으로, '타입'까지 고려하여 점수 계산
    imprint_recognized = imprint.upper()
    imprint1_db = str(row.get('text', '')).upper()
    imprint2_db = str(row.get('text2', '')).upper()

    dist1 = levenshtein_distance(imprint_recognized, imprint1_db)
    dist2 = levenshtein_distance(imprint_recognized, imprint2_db)

    # 더 비슷한 쪽(거리가 짧은 쪽)의 DB 각인과 거리를 선택
    db_imprint_to_compare = imprint1_db if dist1 <= dist2 else imprint2_db
    min_dist = min(dist1, dist2)

    # [핵심] 문자 타입 페널티 계산
    type_penalty = 0
    recognized_type = get_char_type(imprint_recognized)
    db_type = get_char_type(db_imprint_to_compare)

    # 인식된 타입과 DB 타입이 (숫자/알파벳으로) 명확히 다른 경우 큰 페널티 부여
    if recognized_type in ["alpha", "numeric"] and db_type in ["alpha", "numeric"] and recognized_type != db_type:
        type_penalty = 20  # 20점 감점

    # 최종 각인 점수 계산
    max_imprint_score = 40
    imprint_score = max(0, max_imprint_score - (min_dist * 10) - type_penalty)
    score += imprint_score

    return score



def levenshtein_distance(s1, s2):
    """
    두 문자열 간의 레벤슈타인 거리를 계산
    """
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]


def find_best_match(pill_db, identified_shape, identified_colors, identified_imprint):
    """
    분석된 정보를 바탕으로 데이터베이스에서 가장 일치하는 알약 후보를 찾음
    """
    candidates = []

    # 1. 1차 필터링: 앞면 또는 뒷면 각인이 조금이라도 비슷한 후보만 추림
    primary_candidates = []
    if identified_imprint:
        for row in pill_db:
            db_imprint1 = str(row.get('text', '')).upper()
            db_imprint2 = str(row.get('text2', '')).upper()
            match1 = identified_imprint.upper() in db_imprint1 or levenshtein_distance(identified_imprint.upper(),
                                                                                       db_imprint1) <= 2
            match2 = identified_imprint.upper() in db_imprint2 or levenshtein_distance(identified_imprint.upper(),
                                                                                       db_imprint2) <= 2
            if match1 or match2:
                primary_candidates.append(row)

    if not primary_candidates:
        print("  - [1차 검색 실패] 각인 일치 후보 없음. 모양+색상만으로 2차 검색을 시도합니다.")
        for row in pill_db:
            shape_match = row['shape'] in identified_shape
            color_match = any(color in row['color'] for color in identified_colors.split())
            if shape_match and color_match:
                primary_candidates.append(row)

    if not primary_candidates:
        print("  - [2차 검색 실패] 모양과 색상으로도 유사한 후보를 찾을 수 없습니다.")
        return []

    # 필터링된 후보들을 대상으로 점수 계산
    for row in primary_candidates:
        score = calculate_score(row, identified_shape, identified_colors, identified_imprint)
        imprint_display = f"앞:{row.get('text', '')}/뒤:{row.get('text2', '')}"
        pill_info = f"{row['name']} ({row['shape']}, {row['color']}, {imprint_display})"
        candidates.append({'pill_info': pill_info, 'score': score})

    # 점수가 높은 순으로 정렬하고, 점수가 0점인 후보는 제외
    candidates.sort(key=lambda x: x['score'], reverse=True)
    return [c for c in candidates if c['score'] > 0][:10]