import requests

url = 'http://127.0.0.1:8000/api/tryon/process'

print("================ PHASE 4: ERROR HANDLING TESTS ================")

# 1. Invalid item ID in items array
res1 = requests.post(url, json={'sample_id': 'sample-user-portrait', 'items': [{'id': 'non-existent-item-123', 'layer_type': 'base_top'}]})
print("[Test 1: Non-existent Item]:", "PASS" if res1.status_code == 200 and res1.json().get('success') else "FAIL")

# 2. Duplicate layer type conflict (2 base tops)
res2 = requests.post(url, json={
    'sample_id': 'sample-user-portrait',
    'items': [
        {'id': 'shirt-navy-formal', 'layer_type': 'base_top'},
        {'id': 'tshirt-graphic-black', 'layer_type': 'base_top'}
    ]
})
print("[Test 2: Duplicate Base Layer Conflict]:", "PASS" if res2.status_code == 400 and "Conflict detected" in res2.text else "FAIL", f"(Status: {res2.status_code})")

# 3. Duplicate eyewear conflict (2 glasses)
res3 = requests.post(url, json={
    'sample_id': 'sample-user-portrait',
    'items': [
        {'id': 'glasses-classic-black', 'layer_type': 'eyewear'},
        {'id': 'glasses-aviator-gold', 'layer_type': 'eyewear'}
    ]
})
print("[Test 3: Duplicate Eyewear Conflict]:", "PASS" if res3.status_code == 400 and "Conflict detected" in res3.text else "FAIL", f"(Status: {res3.status_code})")

# 4. Non-existent sample portrait
res4 = requests.post(url, json={'sample_id': 'invalid-model-999', 'items': []})
print("[Test 4: Non-existent Sample Portrait]:", "PASS" if res4.status_code == 404 else "FAIL", f"(Status: {res4.status_code})")

# 5. Malformed base64 image
res5 = requests.post(url, json={'user_image_base64': 'not-a-valid-base64-string', 'items': []})
data5 = res5.json()
print("[Test 5: Malformed Base64 Image]:", "PASS" if res5.status_code in [200, 400] and not data5.get('success') else "FAIL", f"(Status: {res5.status_code})")

print("All error handling tests executed.")
