import time
import requests
import random

API_ENDPOINT = "http://127.0.0.1:8000/cv/update"

print("Starting Mock CV Feed...")
while True:
    try:
        # Mock high crowd intermittently
        is_surge = random.random() > 0.7
        expected = 30
        detected = expected + random.randint(15, 30) if is_surge else expected - random.randint(0, 10)
        
        requests.post(API_ENDPOINT, json={"detected_crowd": detected, "expected_devotees": expected})
    except Exception as e:
        print("Waiting for server...")
    time.sleep(2)
