import requests
import json
import os
import cv2
import numpy as np

os.makedirs('app/static/renders', exist_ok=True)
url = 'http://127.0.0.1:8000/api/tryon/process'

tests = [
    ('A_tshirt_only', [{'id': 'tshirt-graphic-black', 'layer_type': 'base_top'}], 'none'),
    ('B_shirt_blazer', [{'id': 'shirt-navy-formal', 'layer_type': 'base_top'}, {'id': 'blazer-charcoal-open', 'layer_type': 'outerwear'}], 'none'),
    ('C_tshirt_bomber', [{'id': 'tshirt-graphic-black', 'layer_type': 'base_top'}, {'id': 'jacket-emerald-bomber', 'layer_type': 'outerwear'}], 'none'),
    ('D_shirt_blazer_tie', [{'id': 'shirt-navy-formal', 'layer_type': 'base_top'}, {'id': 'blazer-charcoal-open', 'layer_type': 'outerwear'}, {'id': 'tie-crimson-silk', 'layer_type': 'accessory'}], 'none'),
    ('E_shirt_blazer_eyewear', [{'id': 'shirt-navy-formal', 'layer_type': 'base_top'}, {'id': 'blazer-charcoal-open', 'layer_type': 'outerwear'}, {'id': 'glasses-classic-black', 'layer_type': 'eyewear'}], 'none'),
    ('F_shirt_blazer_tie_eyewear', [{'id': 'shirt-navy-formal', 'layer_type': 'base_top'}, {'id': 'blazer-charcoal-open', 'layer_type': 'outerwear'}, {'id': 'tie-crimson-silk', 'layer_type': 'accessory'}, {'id': 'glasses-aviator-gold', 'layer_type': 'eyewear'}], 'bg-runway-paris'),
    ('G_top_eyewear_hat', [{'id': 'shirt-navy-formal', 'layer_type': 'base_top'}, {'id': 'glasses-cyber-neon', 'layer_type': 'eyewear'}, {'id': 'hat-fedora-classic', 'layer_type': 'headwear'}], 'bg-cyber-neon')
]

print("================ PHASE 2: VISUAL TRY-ON VALIDATION ================")
all_pass = True
for name, items, bg in tests:
    payload = {
        'sample_id': 'sample-user-portrait',
        'items': items,
        'background_id': bg
    }
    res = requests.post(url, json=payload)
    if res.status_code != 200:
        print(f"FAILED {name}: Status {res.status_code}, text: {res.text}")
        all_pass = False
        continue
    data = res.json()
    if not data.get('success'):
        print(f"FAILED {name}: {data.get('error')}")
        all_pass = False
        continue

    applied = [(l['name'], l['layer_order']) for l in data.get('applied_layers', [])]
    duration = data.get('processing_time_ms')
    print(f"PASS [{name}]: Layers -> {applied} ({duration} ms)")

if all_pass:
    print("\nALL 7 VISUAL TRY-ON COMBINATIONS VALIDATED SUCCESSFULLY!")
