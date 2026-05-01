from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine


analyzer = AnalyzerEngine()
anonymizer = AnonymizerEngine()

def scan_and_mask (text: str) -> tuple[str, dict]:
    results = analyzer.analyze(text=text, language='en')
    left_to_right = sorted( results, key=lambda r: r.start )

    results = sorted (results, key=lambda r: r.start, reverse = True)

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
    return text
