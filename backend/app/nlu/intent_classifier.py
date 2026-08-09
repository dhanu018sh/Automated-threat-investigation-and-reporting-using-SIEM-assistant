import re

class IntentClassifier:
    INTENTS = ["investigate", "summarize", "correlate", "report", "enrich", "remediate", "help", "unknown"]
    
    def classify(self, text: str) -> dict:
        text_lower = text.lower()
        if re.search(r"investigate|look into|find", text_lower):
            return {"intent": "investigate", "confidence": 0.8, "reasoning": "regex match"}
        elif re.search(r"summarize|summary", text_lower):
            return {"intent": "summarize", "confidence": 0.8, "reasoning": "regex match"}
        elif re.search(r"report|export", text_lower):
            return {"intent": "report", "confidence": 0.8, "reasoning": "regex match"}
        
        return {"intent": "unknown", "confidence": 0.0, "reasoning": "fallback"}
