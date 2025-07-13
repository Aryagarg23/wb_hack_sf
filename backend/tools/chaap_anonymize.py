import re
import random
from typing import List, Dict

class SimplePIIObfuscator:
    def __init__(self):
        # Simple regex patterns for common PII
        self.patterns = {
            'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            'phone': r'\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b',
            'ssn': r'\b\d{3}-?\d{2}-?\d{4}\b',
            'credit_card': r'\b(?:\d{4}[-\s]?){3}\d{4}\b',
            'name': r'\b[A-Z][a-z]+\s+[A-Z][a-z]+\b',  # Simple first/last name pattern
            'address': r'\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln)\b',
        }

        # Replacement options for each type
        self.replacements = {
            'email': ['user@example.com', 'person@domain.com', 'someone@mail.com'],
            'phone': ['(555) 123-4567', '555-987-6543', '(123) 456-7890'],
            'ssn': ['123-45-6789', '987-65-4321', '555-12-3456'],
            'credit_card': ['1234 5678 9012 3456', '4000 1234 5678 9010', '5555 4444 3333 2222'],
            'name': ['John Smith', 'Jane Doe', 'Alex Johnson', 'Sam Wilson'],
            'address': ['123 Main Street', '456 Oak Avenue', '789 Pine Road'],
        }

    def obfuscate(self, text: str, mask_probability: float = 0.3) -> str:
        """
        Obfuscate PII in text with optional random masking

        Args:
            text: Input text to obfuscate
            mask_probability: Probability of masking non-PII words (0.0 to 1.0)

        Returns:
            Obfuscated text
        """
        result = text

        # First, replace known PII patterns
        for pii_type, pattern in self.patterns.items():
            matches = re.findall(pattern, result)
            for match in matches:
                replacement = random.choice(self.replacements[pii_type])
                result = result.replace(match, replacement, 1)

        # Optional: randomly mask some words for extra obfuscation
        if mask_probability > 0:
            words = result.split()
            for i, word in enumerate(words):
                if random.random() < mask_probability:
                    # Keep punctuation
                    if word.endswith(('.', ',', '!', '?', ':')):
                        words[i] = '[MASKED]' + word[-1]
                    else:
                        words[i] = '[MASKED]'
            result = ' '.join(words)

        return result

    def quick_scrub(self, text: str) -> str:
        """Quick PII removal without random masking"""
        return self.obfuscate(text, mask_probability=0.0)

    def heavy_scrub(self, text: str) -> str:
        """Heavy obfuscation with high random masking"""
        return self.obfuscate(text, mask_probability=0.6)