import re

def sanitize_query(query: str, platform: str) -> str:
    # Basic sanitization logic
    sanitized = query.strip()
    if len(sanitized) > 1000:
        sanitized = sanitized[:1000]
        
    # Prevent common injection characters based on platform
    if platform == "elastic":
        sanitized = re.sub(r'[\/\\\^\$\*\+\?\[\]\{\}\(\)\|]', '', sanitized)
    elif platform == "splunk":
        sanitized = sanitized.replace('|', '')
        
    return sanitized
