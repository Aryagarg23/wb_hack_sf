# Import necessary libraries
from transformers import pipeline
import torch
import json
from typing import List, Tuple, Dict
from backend.tools.chaap_anonymize import SimplePIIObfuscator

obfuscator = SimplePIIObfuscator()

# This dictionary defines the intents and their detailed descriptions.
# It's used to create meaningful candidate labels for the classifier.
INTENT_LABEL_MAP = {
    "Research": (
        "The user's goal is to conduct a multi-faceted exploration of a subject, aiming for a deep understanding. "
        "This involves synthesizing information, comparing perspectives, and understanding complex relationships or historical context. "
        "The query is a starting point for an investigation, often seeking to understand the 'why' and 'how' of a topic, such as exploring the pros and cons of a method or the causes of a major event."
    ),
    "Answer": (
        "The user's goal is to obtain a single, precise, and self-contained piece of information. "
        "This intent is for queries that can be satisfied with a concise fact, a specific number or quantity, a direct definition, or a simple, actionable instruction. "
        "The user expects a quick, definitive resolution to a specific question."
    ),
    "Transactional": (
        "The user's goal is to perform a commercial action. The query is a clear signal of intent to buy, order, or subscribe to a product or service. "
        "Keywords and concepts related to pricing, purchasing, sales, or managing a commercial account are central to this intent. "
        "The user is often looking to interact with a checkout process, a shopping cart, or a service portal."
    ),
    "News": (
        "The user's goal is to find information about very recent, current, or ongoing events. "
        "This intent is strictly tied to timeliness and the query's value diminishes over time. "
        "It focuses on breaking stories, live updates, press releases, and journalistic content related to the current news cycle."
    ),
    "Navigational": (
        "The user's goal is to be routed to a specific online destination. The query is essentially an address. "
        "This is signaled by the use of URLs, domain names, or unique proper nouns for brands, websites, or login portals (e.g., 'intel.idbi bank .com', 'usaa title department'). "
        "The user's aim is digital transit, not to consume information about the entity in the query."
    )
}

# Global variable to hold the classifier pipeline.
# This prevents re-initializing the model on every function call, which is inefficient.
CLASSIFIER = None

def initialize_classifier():
    """
    Initializes the zero-shot classification pipeline if it hasn't been already.
    Uses the smallest and fastest DeBERTa model for efficiency.
    """
    global CLASSIFIER
    if CLASSIFIER is None:
        print("Initializing zero-shot classifier (one-time setup)...")
        # Use the smallest model for speed
        model_name = "MoritzLaurer/deberta-v3-large-zeroshot-v2.0"
        # Auto-detect device (GPU if available, otherwise CPU)
        device = 0 if torch.cuda.is_available() else -1
        
        CLASSIFIER = pipeline(
            "zero-shot-classification", 
            model=model_name,
            device=device
        )
        print(f"Classifier initialized on device: {'cuda:0' if device == 0 else 'cpu'}")

def create_enhanced_candidates() -> Dict[str, List[str]]:
    """
    Creates a dictionary mapping each intent to a list of descriptive phrases.
    This provides richer context for the model than single-word labels.
    
    Returns:
        A dictionary where keys are intents and values are lists of descriptive strings.
    """
    return {
        "Research": [
            "research and deep exploration", "investigate and understand comprehensively",
            "analyze multiple perspectives", "explore causes and effects"
        ],
        "Answer": [
            "get a specific fact or answer", "find precise information",
            "obtain a direct definition", "get a quick factual response"
        ],
        "Transactional": [
            "buy or purchase products", "complete a commercial transaction",
            "order items or services", "make a purchase decision"
        ],
        "News": [
            "find current news updates", "get recent event information",
            "access breaking news", "find latest developments"
        ],
        "Navigational": [
            "navigate to a website", "access a specific web page",
            "go to an online portal", "visit a particular domain"
        ]
    }

def classify_intent_zero_shot(query: str) -> str:
    obfuscated_query = obfuscator.quick_scrub(text=query)

    """
    Classifies a single query string into one of the predefined intents using a 
    zero-shot learning model. It uses an ensemble of hypothesis templates for
    improved accuracy and returns the results as a JSON object.

    Args:
        query: The user query string to classify.

    Returns:
        A JSON formatted string containing the predicted intent, confidence score,
        and a dictionary of scores for all possible intents.
    """
    # Ensure the classifier is ready to use
    initialize_classifier()
    
    # --- Ensemble Classification Logic ---
    intent_scores = {intent: [] for intent in INTENT_LABEL_MAP.keys()}
    
    # A set of different hypothesis templates to test the query against.
    # This diversity helps the model make a more robust prediction.
    hypothesis_templates = [
        "This query is about {}",
        "The user wants to {}",
        "This is a request to {}",
        "The purpose of this query is to {}"
    ]
    
    enhanced_candidates = create_enhanced_candidates()
    
    # Flatten all candidate descriptions into a single list and map them back to intents
    all_candidates = []
    intent_to_candidate_map = {}
    for intent, candidates in enhanced_candidates.items():
        for candidate in candidates:
            all_candidates.append(candidate)
            intent_to_candidate_map[candidate] = intent
            
    # Run the query through the pipeline with each hypothesis template
    for template in hypothesis_templates:
        result = CLASSIFIER(
            query, 
            all_candidates, 
            hypothesis_template=template,
            multi_label=False
        )
        
        # Aggregate the scores for each intent based on the results
        for candidate, score in zip(result['labels'], result['scores']):
            intent = intent_to_candidate_map[candidate]
            intent_scores[intent].append(score)
            
    # --- Aggregation and Final Result ---
    # Average the scores from the different templates for each intent
    avg_scores = {
        intent: sum(scores) / len(scores) if scores else 0
        for intent, scores in intent_scores.items()
    }
    
    # Determine the intent with the highest average score
    if not avg_scores:
        best_intent = "Unknown"
        confidence = 0.0
    else:
        best_intent = max(avg_scores, key=avg_scores.get)
        confidence = avg_scores[best_intent]
    
    # --- Format Output as JSON ---
    output_data = {
        "query": query,
        "predicted_intent": best_intent,
        "confidence": float(f"{confidence:.4f}"), # Format for consistency
        "all_scores": {
            intent: float(f"{score:.4f}")
            for intent, score in avg_scores.items()
        }
    }
    
    # Return the dictionary as a nicely formatted JSON string
    return json.dumps(output_data, indent=4)


    # single_query = "who is the current president of france"
    # json_result = classify_intent_zero_shot(single_query)