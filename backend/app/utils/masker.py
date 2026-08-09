import re

def mask_sensitive_fields(data: dict, fields_to_mask: list) -> dict:
    masked_data = data.copy()
    
    email_pattern = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')
    ssn_pattern = re.compile(r'^\d{3}-\d{2}-\d{4}$')
    
    for key, value in masked_data.items():
        if key in fields_to_mask:
            masked_data[key] = "***MASKED***"
        elif isinstance(value, str):
            if email_pattern.match(value) or ssn_pattern.match(value):
                masked_data[key] = "***MASKED***"
                
    return masked_data
