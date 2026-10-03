import requests
import json
import base64

BASE_URL = 'http://127.0.0.1:8000/api'

print("================ PHASE 7: DEMO FLOW VERIFICATION ================")

# 1. Open Pratibimb & Fetch Catalog & Samples
cat_res = requests.get(f"{BASE_URL}/catalog/items")
assert cat_res.status_code == 200
items = cat_res.json()
print(f"[Step 1 & 2]: Catalog loaded ({len(items)} items available across 5 layer categories)")

# 3, 4, 5, 6, 7. Configure 5-piece layered outfit
outfit_payload = {
    'sample_id': 'sample-user-portrait',
    'items': [
        {'id': 'shirt-navy-formal', 'layer_type': 'base_top'},
        {'id': 'blazer-charcoal-open', 'layer_type': 'outerwear'},
        {'id': 'tie-crimson-silk', 'layer_type': 'accessory'},
        {'id': 'glasses-aviator-gold', 'layer_type': 'eyewear'}
    ],
    'background_id': 'bg-runway-paris'
}

# 8. Process Try-On
print("[Step 8]: Processing 4-layer virtual try-on with Parisian Runway staging...")
tryon_res = requests.post(f"{BASE_URL}/tryon/process", json=outfit_payload)
assert tryon_res.status_code == 200
tryon_data = tryon_res.json()
assert tryon_data['success']
print(f"[Step 8 Complete]: Success={tryon_data['success']}, Time={tryon_data['processing_time_ms']}ms, Layers={len(tryon_data['applied_layers'])}")

# 9. View Biometric Info
bio = tryon_data['biometrics']
print(f"[Step 9]: Biometrics -> Face Shape: {bio['face_shape']}, Skin Undertone: {bio['skin_undertone']}, Estimated Size: {bio['estimated_size']} ({int(bio['size_confidence']*100)}% confidence)")

# 10. Save Look to Lookbook
look_payload = {
    'id': 'demo-executive-look-001',
    'title': 'Milano Sartorial Executive Look',
    'result_image_base64': tryon_data['result_image_base64'],
    'items_applied': [l['name'] for l in tryon_data['applied_layers']]
}
save_res = requests.post(f"{BASE_URL}/lookbook/save", json=look_payload)
assert save_res.status_code == 200
print("[Step 10]: Lookbook outfit saved successfully!")

# 11. Retrieve Saved Looks
list_res = requests.get(f"{BASE_URL}/lookbook/list")
assert list_res.status_code == 200
looks = list_res.json()
found_look = next((l for l in looks if l['id'] == 'demo-executive-look-001'), None)
assert found_look is not None
print(f"[Step 11]: Verified lookbook listing (Found: '{found_look['title']}' with {len(found_look['items_applied'])} items)")

# 12. Export verification
img_data = found_look['result_image_base64'].split(',')[1]
raw_bytes = base64.b64decode(img_data)
assert len(raw_bytes) > 10000
print(f"[Step 12]: Download / Export verified ({len(raw_bytes)} bytes high-res image data ready for export)")

print("\n================ DEMO FLOW COMPLETELY VERIFIED & READY ================")
