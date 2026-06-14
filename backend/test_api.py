import requests
import json
import os

# Define the path to our test image
test_image_path = os.path.join(os.path.dirname(__file__), "shoe.webp")

url = "http://127.0.0.1:8000/api/grade"

print(f"Reading image from: {test_image_path}")

files = {
    'images': ('shoe.webp', open(test_image_path, 'rb'), 'image/webp')
}

data = {
    "product_name": "Amazon Essentials Women's Running Shoes",
    "category": "Apparel",
    "sub_category": "Footwear",
    "expected_color": "Blue",
    "reason": "Testing the API directly"
}

print(f"\nSending POST request to {url}...")
print("Data Payload:", json.dumps(data, indent=2))
print("Waiting for Amazon Nova AI response...\n")

try:
    response = requests.post(url, files=files, data=data)
    print(f"Status Code: {response.status_code}")
    
    try:
        print("\n--- JSON RESPONSE ---")
        print(json.dumps(response.json(), indent=2))
    except Exception:
        print("\n--- RAW RESPONSE ---")
        print(response.text)
        
except requests.exceptions.ConnectionError:
    print("\n[!] ERROR: Could not connect. Make sure your FastAPI server is running with: uvicorn main:app --reload")
except Exception as e:
    print(f"\n[!] Unexpected Error: {e}")
