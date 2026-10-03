import os
import cv2
import numpy as np
from typing import List, Optional, Dict
from app.config import settings
from app.models.schemas import CatalogItem

class CatalogService:
    def __init__(self):
        self._catalog_items: Dict[str, CatalogItem] = {}
        self._sample_images: Dict[str, str] = {}
        self._background_images: Dict[str, str] = {}
        self._image_cache: Dict[str, np.ndarray] = {}
        self._initialize_catalog()

    def _initialize_catalog(self):
        # 1. Base Tops (Layer Order = 10, Anchor = torso)
        self.register_item(CatalogItem(
            id="shirt-navy-formal",
            name="Sovereign Tailored Navy Shirt",
            category="tops",
            sub_category="Formal Shirts",
            layer_type="base_top",
            layer_order=10,
            anchor_type="torso",
            scale_multiplier=1.55,
            collar_offset_ratio=0.12,
            brand="Pratibimb Bespoke",
            price=149.00,
            color="Deep Navy Blue",
            style_tags=["Formal", "Executive", "Tailored", "Crisp"],
            image_url="/static/catalog/tops/shirt-navy-formal.png",
            overlay_url=os.path.join(settings.CATALOG_DIR, "tops", "shirt-navy-formal.png"),
            recommended_face_shapes=["Oval", "Square", "Round", "Heart", "Diamond", "Oblong"],
            recommended_undertones=["Warm", "Cool", "Neutral"],
            description="100% Egyptian Giza cotton luxury formal shirt with mother-of-pearl buttons and tailored spread collar."
        ))

        self.register_item(CatalogItem(
            id="tshirt-graphic-black",
            name="Phantom Heavyweight Street T-Shirt",
            category="tops",
            sub_category="T-Shirts",
            layer_type="base_top",
            layer_order=10,
            anchor_type="torso",
            scale_multiplier=1.55,
            collar_offset_ratio=0.12,
            brand="Pratibimb Street",
            price=65.00,
            color="Matte Black",
            style_tags=["Streetwear", "Casual", "Oversized", "Drop-Shoulder"],
            image_url="/static/catalog/tops/tshirt-graphic-black.png",
            overlay_url=os.path.join(settings.CATALOG_DIR, "tops", "tshirt-graphic-black.png"),
            recommended_face_shapes=["Oval", "Square", "Round", "Heart", "Diamond"],
            recommended_undertones=["Warm", "Cool", "Neutral"],
            description="280 GSM heavyweight French terry oversized streetwear tee with signature high-density chest print."
        ))

        # 2. Outerwear (Layer Order = 20, Anchor = torso)
        self.register_item(CatalogItem(
            id="blazer-charcoal-open",
            name="Milano Open-Front Charcoal Blazer",
            category="outerwear",
            sub_category="Blazers",
            layer_type="outerwear",
            layer_order=20,
            anchor_type="torso",
            scale_multiplier=1.70,
            collar_offset_ratio=0.10,
            brand="Pratibimb Sartorial",
            price=289.00,
            color="Charcoal Heather",
            style_tags=["Layering", "Executive", "Bespoke", "Open-Chest"],
            image_url="/static/catalog/outerwear/blazer-charcoal-open.png",
            overlay_url=os.path.join(settings.CATALOG_DIR, "outerwear", "blazer-charcoal-open.png"),
            recommended_face_shapes=["Oval", "Square", "Diamond", "Oblong"],
            recommended_undertones=["Warm", "Cool", "Neutral"],
            description="Italian super-130s wool open blazer engineered for effortless layering over shirts and tees."
        ))

        self.register_item(CatalogItem(
            id="jacket-emerald-bomber",
            name="Velvet Emerald Bomber Jacket",
            category="outerwear",
            sub_category="Jackets",
            layer_type="outerwear",
            layer_order=20,
            anchor_type="torso",
            scale_multiplier=1.65,
            collar_offset_ratio=0.12,
            brand="Pratibimb Atelier",
            price=249.00,
            color="Deep Emerald",
            style_tags=["Luxury", "Evening", "Statement", "Autumn"],
            image_url="/static/catalog/tops/jacket-emerald-bomber.png",
            overlay_url=os.path.join(settings.CATALOG_DIR, "tops", "jacket-emerald-bomber.png"),
            recommended_face_shapes=["Oval", "Square", "Oblong"],
            recommended_undertones=["Cool", "Neutral", "Warm"],
            description="Silk-lined quilted bomber jacket with satin finish and gunmetal hardware."
        ))

        # 3. Accessories (Layer Order = 30, Anchor = torso_neck)
        self.register_item(CatalogItem(
            id="tie-crimson-silk",
            name="Royal Crimson Striped Silk Tie",
            category="accessories",
            sub_category="Ties",
            layer_type="accessory",
            layer_order=30,
            anchor_type="torso_neck",
            scale_multiplier=0.45,
            collar_offset_ratio=0.08,
            brand="Pratibimb Haberdashery",
            price=75.00,
            color="Crimson & Gold",
            style_tags=["Formal", "Silk", "Elegance", "Business"],
            image_url="/static/catalog/accessories/tie-crimson-silk.png",
            overlay_url=os.path.join(settings.CATALOG_DIR, "accessories", "tie-crimson-silk.png"),
            recommended_face_shapes=["Oval", "Square", "Round", "Heart"],
            recommended_undertones=["Warm", "Neutral"],
            description="Handmade jacquard woven pure silk necktie with gold diagonal accents."
        ))

        # 4. Eyewear (Layer Order = 40, Anchor = face_eyes)
        self.register_item(CatalogItem(
            id="glasses-classic-black",
            name="Aura Classic Wayfarer",
            category="glasses",
            sub_category="Eyeglasses",
            layer_type="eyewear",
            layer_order=40,
            anchor_type="face_eyes",
            scale_multiplier=1.05,
            collar_offset_ratio=0.0,
            brand="Pratibimb Luxe",
            price=129.00,
            color="Onyx Black",
            style_tags=["Classic", "Intellectual", "Everyday", "Minimalist"],
            image_url="/static/catalog/glasses/glasses-classic-black.png",
            overlay_url=os.path.join(settings.CATALOG_DIR, "glasses", "glasses-classic-black.png"),
            recommended_face_shapes=["Round", "Oval", "Heart"],
            recommended_undertones=["Warm", "Cool", "Neutral"],
            description="Timeless acetate frames engineered with lightweight composite hinges and anti-reflective lenses."
        ))

        self.register_item(CatalogItem(
            id="glasses-aviator-gold",
            name="Solaris Gold Aviators",
            category="glasses",
            sub_category="Sunglasses",
            layer_type="eyewear",
            layer_order=40,
            anchor_type="face_eyes",
            scale_multiplier=1.05,
            collar_offset_ratio=0.0,
            brand="Pratibimb Luxe",
            price=179.00,
            color="Champagne Gold",
            style_tags=["Luxury", "Vintage", "Statement", "Summer"],
            image_url="/static/catalog/glasses/glasses-aviator-gold.png",
            overlay_url=os.path.join(settings.CATALOG_DIR, "glasses", "glasses-aviator-gold.png"),
            recommended_face_shapes=["Square", "Oval", "Heart", "Diamond"],
            recommended_undertones=["Warm", "Neutral"],
            description="Ultra-thin titanium teardrop wireframe sunglasses with 100% UV polarized gradient tint."
        ))

        self.register_item(CatalogItem(
            id="glasses-cyber-neon",
            name="Neon Cyberpunk Visor",
            category="glasses",
            sub_category="Sunglasses",
            layer_type="eyewear",
            layer_order=40,
            anchor_type="face_eyes",
            scale_multiplier=1.08,
            collar_offset_ratio=0.0,
            brand="Pratibimb Future",
            price=199.00,
            color="Cyan / Magenta",
            style_tags=["Futuristic", "Cyberpunk", "Bold", "Nightlife"],
            image_url="/static/catalog/glasses/glasses-cyber-neon.png",
            overlay_url=os.path.join(settings.CATALOG_DIR, "glasses", "glasses-cyber-neon.png"),
            recommended_face_shapes=["Oval", "Square", "Diamond"],
            recommended_undertones=["Cool", "Neutral"],
            description="Wrap-around continuous single-piece lens with iridescent holographic coating."
        ))

        # 5. Headwear (Layer Order = 50, Anchor = head_top)
        self.register_item(CatalogItem(
            id="hat-fedora-classic",
            name="Savile Row Felt Fedora",
            category="headwear",
            sub_category="Hats",
            layer_type="headwear",
            layer_order=50,
            anchor_type="head_top",
            scale_multiplier=1.25,
            collar_offset_ratio=0.0,
            brand="Pratibimb Millinery",
            price=119.00,
            color="Midnight Black",
            style_tags=["Vintage", "Classic", "Structured", "Statement"],
            image_url="/static/catalog/headwear/hat-fedora-classic.png",
            overlay_url=os.path.join(settings.CATALOG_DIR, "headwear", "hat-fedora-classic.png"),
            recommended_face_shapes=["Oval", "Square", "Round", "Heart", "Diamond"],
            recommended_undertones=["Warm", "Cool", "Neutral"],
            description="Premium wool felt structured fedora with pinch crown and burgundy grosgrain band."
        ))

        # 6. Background Presets
        self._background_presets = [
            {
                "id": "bg-studio-dark",
                "name": "Luxury Studio Dark",
                "color_theme": "#0f172a",
                "image_url": "/static/catalog/backgrounds/bg-studio-dark.jpg",
                "file_path": os.path.join(settings.CATALOG_DIR, "backgrounds", "bg-studio-dark.jpg"),
                "description": "Clean minimalist high-contrast fashion studio gradient backdrop."
            },
            {
                "id": "bg-runway-paris",
                "name": "Parisian Fashion Runway",
                "color_theme": "#3b0764",
                "image_url": "/static/catalog/backgrounds/bg-runway-paris.jpg",
                "file_path": os.path.join(settings.CATALOG_DIR, "backgrounds", "bg-runway-paris.jpg"),
                "description": "Dramatic stage lights, sleek glass catwalk reflections, and soft audience bokeh."
            },
            {
                "id": "bg-cyber-neon",
                "name": "Cyberpunk Neon Loft",
                "color_theme": "#064e3b",
                "image_url": "/static/catalog/backgrounds/bg-cyber-neon.jpg",
                "file_path": os.path.join(settings.CATALOG_DIR, "backgrounds", "bg-cyber-neon.jpg"),
                "description": "Futuristic skyline view with vibrant turquoise and magenta ambient neon glows."
            },
            {
                "id": "bg-penthouse-sunset",
                "name": "Golden Hour Penthouse",
                "color_theme": "#78350f",
                "image_url": "/static/catalog/backgrounds/bg-penthouse-sunset.jpg",
                "file_path": os.path.join(settings.CATALOG_DIR, "backgrounds", "bg-penthouse-sunset.jpg"),
                "description": "Warm golden sunbeams casting through high floor-to-ceiling glass architecture."
            }
        ]

    def register_item(self, item: CatalogItem):
        self._catalog_items[item.id] = item
        # Clear cache entry if re-registering
        if item.id in self._image_cache:
            del self._image_cache[item.id]

    def get_item(self, item_id: str) -> Optional[CatalogItem]:
        return self._catalog_items.get(item_id)

    def get_all_items(self, category: Optional[str] = None) -> List[CatalogItem]:
        items = list(self._catalog_items.values())
        if category:
            items = [item for item in items if item.category.lower() == category.lower() or item.layer_type.lower() == category.lower()]
        return items

    def get_backgrounds(self) -> List[dict]:
        return self._background_presets

    def get_background(self, bg_id: str) -> Optional[dict]:
        for bg in self._background_presets:
            if bg["id"] == bg_id:
                return bg
        return None

    def load_item_image(self, item_id: str) -> Optional[np.ndarray]:
        if item_id in self._image_cache:
            return self._image_cache[item_id]
            
        item = self.get_item(item_id)
        if not item or not os.path.exists(item.overlay_url):
            return None
            
        img = cv2.imread(item.overlay_url, cv2.IMREAD_UNCHANGED)
        if img is not None:
            self._image_cache[item_id] = img
        return img

    def load_background_image(self, bg_id: str) -> Optional[np.ndarray]:
        cache_key = f"bg_{bg_id}"
        if cache_key in self._image_cache:
            return self._image_cache[cache_key]
            
        bg = self.get_background(bg_id)
        if not bg or not os.path.exists(bg["file_path"]):
            return None
            
        img = cv2.imread(bg["file_path"])
        if img is not None:
            self._image_cache[cache_key] = img
        return img

    def get_sample_images(self) -> List[dict]:
        samples = []
        sample_dir = settings.SAMPLES_DIR
        if os.path.exists(sample_dir):
            for fname in os.listdir(sample_dir):
                if fname.lower().endswith((".jpg", ".jpeg", ".png")):
                    sid = os.path.splitext(fname)[0]
                    samples.append({
                        "id": sid,
                        "name": sid.replace("-", " ").title(),
                        "url": f"/static/samples/{fname}",
                        "file_path": os.path.join(sample_dir, fname)
                    })
        return samples

catalog_service = CatalogService()
