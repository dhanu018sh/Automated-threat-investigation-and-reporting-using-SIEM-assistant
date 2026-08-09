import re

class EntityExtractor:
    def extract(self, text: str) -> list[dict]:
        entities = []
        
        ip_pattern = r'\b(?:\d{1,3}\.){3}\d{1,3}\b'
        for match in re.finditer(ip_pattern, text):
            entities.append({"type": "ip_address", "value": match.group(), "confidence": 1.0})
            
        hash_pattern = r'\b[A-Fa-f0-9]{32}\b|\b[A-Fa-f0-9]{40}\b|\b[A-Fa-f0-9]{64}\b'
        for match in re.finditer(hash_pattern, text):
            entities.append({"type": "file_hash", "value": match.group(), "confidence": 1.0})
            
        return entities
