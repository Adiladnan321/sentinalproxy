import re
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine


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
def scan_and_mask (text: str) -> tuple[str, dict]:
    results = analyzer.analyze(
        text=text,
        language='en',
        score_threshold=0.3,
        entities=ENTITIES_TO_MASK
    )
    left_to_right = sorted( results, key=lambda r: r.start )

    mapping = {}
    counters = {}
    value_to_token = {}
    for result in left_to_right:
        original_value = text[result.start:result.end]

        if original_value not in mapping.values():
            entity_type = result.entity_type
            counters[entity_type] = counters.get(entity_type, 0) + 1
            token = f"[[{entity_type}_{counters[entity_type]}]]"
            mapping[token] = original_value
            value_to_token[original_value] = token
    masked = text
    right_to_left = sorted (results, key=lambda r: r.start, reverse = True)

    for result in right_to_left:
        original_value = text[result.start:result.end]
        token = value_to_token[original_value]
        masked = masked[:result.start] + token + masked[result.end:]
        
    return masked, mapping


def restore(text: str, mapping: dict) -> str:
    for token, original_value in mapping.items():
        text = text.replace(token, original_value)
    
    # phantom token cleanup
    text = re.sub(r'\[\[[A-Z_a-z0-9]+\]\]', '[REDACTED]', text)
    return text
