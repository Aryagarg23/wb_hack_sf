from flask import request, jsonify, Blueprint
import numpy as np
from backend.src.db_controller import run_db_query
from backend.src.db_schema import Concept, Query, Link
from backend.tools.intent_zero_shot_classifier import classify_intent_zero_shot
from backend.tools.intent_categorizer import get_intent

vector_bp = Blueprint("vector", __name__, url_prefix='/api/vector')

INTENT_LABELS = ["Research", "Answer", "Transactional", "News", "Navigational"]

def collect_all_intent(query):
    source_names = ["DB", "RoBERTa", "Gmail", "Browsing", "Other"]
    intent_matrix = []

    db_intent_vector = list(get_intent(query).values())
    for i, score in enumerate(db_intent_vector):
        if score > 0.85:
            return({
                "most_significant": {
                    "source": source_names[0],
                    "intent": INTENT_LABELS[i],
                    "score": float(score)
                }
            })
    intent_matrix.append(db_intent_vector)

    roberta_vector = list(classify_intent_zero_shot(query).get('all_scores').values())
    for i, score in enumerate(roberta_vector):
        if i > 0.85:
            return({
                "most_significant": {
                    "source": source_names[1],
                    "intent": INTENT_LABELS[i],
                    "score": float(score)
                }
            })
    intent_matrix.append(roberta_vector)

    # Combine all into 5x5 matrix
    intent_matrix = np.array([
        db_intent_vector,
        roberta_vector,
    ])

    # Find the most significant (max) component
    max_idx = np.unravel_index(np.argmax(intent_matrix, axis=None), intent_matrix.shape)
    source_idx, intent_idx = max_idx

    max_info = {
        "source": source_names[source_idx],
        "intent": INTENT_LABELS[intent_idx],
        "score": float(intent_matrix[source_idx][intent_idx])
    }

    return({
        "most_significant": max_info
    })