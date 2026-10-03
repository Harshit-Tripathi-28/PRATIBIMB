import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from app.config import settings

def ensure_assets():
    """Generates supplementary catalog items and backdrop presets if missing."""
    os.makedirs(os.path.join(settings.CATALOG_DIR, "glasses"), exist_ok=True)
    os.makedirs(os.path.join(settings.CATALOG_DIR, "tops"), exist_ok=True)
    os.makedirs(os.path.join(settings.CATALOG_DIR, "outerwear"), exist_ok=True)
    os.makedirs(os.path.join(settings.CATALOG_DIR, "accessories"), exist_ok=True)
    os.makedirs(os.path.join(settings.CATALOG_DIR, "headwear"), exist_ok=True)
    os.makedirs(os.path.join(settings.CATALOG_DIR, "backgrounds"), exist_ok=True)
    
    # 1. Gold Aviators
    aviator_path = os.path.join(settings.CATALOG_DIR, "glasses", "glasses-aviator-gold.png")
    if not os.path.exists(aviator_path):
        w, h = 800, 360
        img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        gold = (212, 175, 55, 255)
        lens_tint = (40, 30, 20, 160)
        draw.polygon([(120, 100), (360, 100), (340, 290), (190, 310), (120, 230)], fill=lens_tint, outline=gold, width=8)
        draw.polygon([(440, 100), (680, 100), (680, 230), (610, 310), (460, 290)], fill=lens_tint, outline=gold, width=8)
        draw.line([(340, 110), (460, 110)], fill=gold, width=7)
        draw.line([(330, 145), (470, 145)], fill=gold, width=5)
        draw.line([(120, 120), (30, 90)], fill=gold, width=6)
        draw.line([(680, 120), (770, 90)], fill=gold, width=6)
        img.save(aviator_path, "PNG")

    # 2. Cyberpunk Neon Visor
    cyber_path = os.path.join(settings.CATALOG_DIR, "glasses", "glasses-cyber-neon.png")
    if not os.path.exists(cyber_path):
        w, h = 800, 320
        img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        cyan = (0, 240, 255, 255)
        pink = (255, 0, 128, 255)
        lens_cyber = (15, 23, 42, 220)
        draw.polygon([(100, 80), (700, 80), (660, 240), (400, 280), (140, 240)], fill=lens_cyber, outline=cyan, width=6)
        draw.line([(130, 95), (670, 95)], fill=pink, width=4)
        draw.line([(160, 220), (400, 260)], fill=cyan, width=4)
        draw.line([(400, 260), (640, 220)], fill=cyan, width=4)
        draw.polygon([(100, 80), (40, 70), (40, 140), (100, 120)], fill=(30, 41, 59, 255), outline=cyan, width=3)
        draw.polygon([(700, 80), (760, 70), (760, 140), (700, 120)], fill=(30, 41, 59, 255), outline=pink, width=3)
        img.save(cyber_path, "PNG")

    # 3. Emerald Bomber Jacket (Outerwear)
    bomber_path = os.path.join(settings.CATALOG_DIR, "tops", "jacket-emerald-bomber.png")
    if not os.path.exists(bomber_path):
        w, h = 800, 900
        img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        emerald = (6, 78, 59, 255)
        dark_emerald = (4, 47, 46, 255)
        trim_black = (15, 23, 42, 255)
        zip_silver = (203, 213, 225, 255)
        torso_pts = [(250, 120), (550, 120), (760, 360), (680, 520), (600, 440), (600, 840), (200, 840), (200, 440), (120, 520), (40, 360)]
        draw.polygon(torso_pts, fill=emerald, outline=dark_emerald, width=6)
        draw.polygon([(300, 110), (500, 110), (460, 190), (340, 190)], fill=trim_black)
        draw.line([(400, 190), (400, 840)], fill=zip_silver, width=6)
        draw.rectangle([(200, 800), (600, 840)], fill=trim_black)
        img.save(bomber_path, "PNG")

    # 4. Tailored Charcoal Open Blazer (Outerwear - With open center chest so base shirts show underneath)
    blazer_path = os.path.join(settings.CATALOG_DIR, "outerwear", "blazer-charcoal-open.png")
    if not os.path.exists(blazer_path):
        w, h = 900, 1000
        img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        charcoal = (30, 41, 59, 255)
        lapel_dark = (15, 23, 42, 255)
        pinstripe = (51, 65, 85, 255)
        
        # Left Jacket Panel & Sleeve
        left_pts = [(240, 100), (360, 100), (330, 480), (370, 750), (200, 920), (120, 920), (160, 480), (60, 560), (20, 380)]
        draw.polygon(left_pts, fill=charcoal, outline=pinstripe, width=4)
        
        # Right Jacket Panel & Sleeve
        right_pts = [(660, 100), (540, 100), (570, 480), (530, 750), (700, 920), (780, 920), (740, 480), (840, 560), (880, 380)]
        draw.polygon(right_pts, fill=charcoal, outline=pinstripe, width=4)
        
        # Left Peak Lapel
        draw.polygon([(260, 100), (360, 220), (310, 360), (340, 480), (280, 400), (250, 160)], fill=lapel_dark, outline=pinstripe, width=3)
        # Right Peak Lapel
        draw.polygon([(640, 100), (540, 220), (590, 360), (560, 480), (620, 400), (650, 160)], fill=lapel_dark, outline=pinstripe, width=3)
        
        # Single Horn Button at center lower waist
        draw.ellipse([(435, 740), (465, 770)], fill=(10, 15, 30, 255), outline=(100, 116, 139, 255), width=2)
        
        # Pocket Flaps
        draw.polygon([(150, 680), (260, 680), (255, 715), (155, 715)], fill=lapel_dark, outline=pinstripe, width=2)
        draw.polygon([(640, 680), (750, 680), (745, 715), (645, 715)], fill=lapel_dark, outline=pinstripe, width=2)
        
        img.save(blazer_path, "PNG")

    # 5. Crimson Silk Tie (Accessory - Drapes vertically from collar knot)
    tie_path = os.path.join(settings.CATALOG_DIR, "accessories", "tie-crimson-silk.png")
    if not os.path.exists(tie_path):
        w, h = 400, 800
        img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        crimson = (159, 18, 57, 255)
        dark_crimson = (136, 19, 55, 255)
        stripe_gold = (217, 119, 6, 255)
        
        # Knot triangle
        draw.polygon([(160, 40), (240, 40), (225, 110), (175, 110)], fill=dark_crimson, outline=(76, 5, 25, 255), width=3)
        
        # Tie body blade
        blade_pts = [(175, 110), (225, 110), (255, 680), (200, 760), (145, 680)]
        draw.polygon(blade_pts, fill=crimson, outline=(76, 5, 25, 255), width=3)
        
        # Diagonal silk stripes
        for y_pos in range(160, 680, 70):
            draw.line([(150, y_pos), (250, y_pos - 40)], fill=stripe_gold, width=4)
            
        img.save(tie_path, "PNG")

    # 6. Classic Fedora Hat (Headwear - Placed above forehead)
    hat_path = os.path.join(settings.CATALOG_DIR, "headwear", "hat-fedora-classic.png")
    if not os.path.exists(hat_path):
        w, h = 900, 450
        img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        felt_black = (15, 23, 42, 255)
        band_burgundy = (136, 19, 55, 255)
        feather_cyan = (6, 182, 212, 255)
        
        # Wide curved brim ellipse
        draw.ellipse([(60, 240), (840, 360)], fill=felt_black, outline=(51, 65, 85, 255), width=4)
        
        # Crown dome with pinch
        crown_pts = [(240, 270), (220, 100), (330, 80), (450, 110), (570, 80), (680, 100), (660, 270)]
        draw.polygon(crown_pts, fill=felt_black, outline=(51, 65, 85, 255), width=4)
        
        # Silk Ribbon Band
        draw.polygon([(230, 240), (670, 240), (665, 275), (235, 275)], fill=band_burgundy)
        
        # Small accent feather
        draw.polygon([(260, 240), (230, 140), (275, 230)], fill=feather_cyan)
        
        img.save(hat_path, "PNG")

    # 7. Background Presets
    bg_defs = [
        ("bg-studio-dark.jpg", (15, 23, 42), (2, 6, 23)),
        ("bg-runway-paris.jpg", (59, 7, 100), (15, 23, 42)),
        ("bg-cyber-neon.jpg", (4, 120, 87), (15, 23, 42)),
        ("bg-penthouse-sunset.jpg", (180, 83, 9), (30, 27, 75))
    ]
    
    for fname, col1, col2 in bg_defs:
        bg_path = os.path.join(settings.CATALOG_DIR, "backgrounds", fname)
        if not os.path.exists(bg_path):
            w, h = 1280, 960
            img = Image.new("RGB", (w, h), col1)
            draw = ImageDraw.Draw(img)
            for y in range(h):
                factor = y / float(h)
                r = int(col1[0] * (1 - factor) + col2[0] * factor)
                g = int(col1[1] * (1 - factor) + col2[1] * factor)
                b = int(col1[2] * (1 - factor) + col2[2] * factor)
                draw.line([(0, y), (w, y)], fill=(r, g, b))
                
            for x in range(0, w, 80):
                draw.line([(x, 0), (x, h)], fill=(255, 255, 255, 8), width=1)
            img.save(bg_path, "JPEG", quality=90)

if __name__ == "__main__":
    ensure_assets()
