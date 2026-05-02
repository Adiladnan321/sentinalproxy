import re
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine
from database import get_connection


analyzer = AnalyzerEngine()
anonymizer = AnonymizerEngine()
ENTITIES_TO_MASK = [
    "PERSON",
    "EMAIL_ADDRESS",
    "PHONE_NUMBER",
    "CREDIT_CARD",
    "IBAN_CODE",
    "NRP",
    "MEDICAL_LICENSE",
]


class MockResult:
    def __init__(self, start, end, entity_type):
        self.start = start
        self.end = end
        self.entity_type = entity_type

def get_user_exceptions(user_id: str) -> dict:
    conn = get_connection()
    rows = conn.execute(
        "SELECT value, should_mask, entity_type FROM user_exceptions WHERE user_id = ?",
        (user_id,)
    ).fetchall()
    conn.close()
    return {row["value"].lower(): {"should_mask": bool(row["should_mask"]), "entity_type": row["entity_type"]} for row in rows}

def scan_and_mask(text: str, user_exceptions: dict = {}) -> tuple[str, dict]:
    results = list(analyzer.analyze(
        text=text,
        language='en',
        score_threshold=0.3,
        entities=ENTITIES_TO_MASK
    ))
    
    # manual forced masks
    forced_results = []
    for val, exc in user_exceptions.items():
        if exc["should_mask"]:
            for match in re.finditer(re.escape(val), text, re.IGNORECASE):
                forced_results.append(MockResult(match.start(), match.end(), exc["entity_type"]))
                
    all_results = results + forced_results
    left_to_right = sorted(all_results, key=lambda r: (r.start, -(r.end - r.start)))
    
    filtered_results = []
    last_end = -1
    for r in left_to_right:
        if r.start >= last_end:
            filtered_results.append(r)
            last_end = r.end

    mapping = {}
    counters = {}
    value_to_token = {}
    for result in filtered_results:
        original_value = text[result.start:result.end]
        val_lower = original_value.lower()

        # user said never mask this
        if val_lower in user_exceptions and not user_exceptions[val_lower]["should_mask"]:
            continue

        if original_value not in mapping.values():
            entity_type = result.entity_type
            counters[entity_type] = counters.get(entity_type, 0) + 1
            token = f"[[{entity_type}_{counters[entity_type]}]]"
            mapping[token] = original_value
            value_to_token[original_value] = token
            
    masked = text
    right_to_left = sorted(filtered_results, key=lambda r: r.start, reverse=True)

    for result in right_to_left:
        original_value = text[result.start:result.end]
        val_lower = original_value.lower()

        # skip values the user exempted
        if val_lower in user_exceptions and not user_exceptions[val_lower]["should_mask"]:
            continue

        token = value_to_token.get(original_value)
        if token:
            masked = masked[:result.start] + token + masked[result.end:]
        
    return masked, mapping


def restore(text: str, mapping: dict) -> str:
    for token, original_value in mapping.items():
        text = text.replace(token, original_value)
    
    # phantom token cleanup
    text = re.sub(r'\[\[[A-Z_a-z0-9]+\]\]', '[REDACTED]', text)
    return text

