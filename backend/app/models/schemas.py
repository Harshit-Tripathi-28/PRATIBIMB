from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

LayerType = Literal['base_top', 'outerwear', 'accessory', 'eyewear', 'headwear', 'background']
AnchorType = Literal['torso', 'torso_neck', 'face_eyes', 'head_top', 'background']

class SelectedLayerItem(BaseModel):
    id: str
    layer_type: LayerType
    custom_base64: Optional[str] = None
    adjust_scale: Optional[float] = None
    adjust_offset_x: Optional[float] = None
    adjust_offset_y: Optional[float] = None

class CatalogItem(BaseModel):
    id: str
    name: str
    category: str  # glasses, tops, outerwear, accessories, headwear, backgrounds
    sub_category: Optional[str] = None
    layer_type: LayerType = 'base_top'
    layer_order: int = 10  # 10=base_top, 20=outerwear, 30=accessory, 40=eyewear, 50=headwear
    anchor_type: AnchorType = 'torso'
    scale_multiplier: float = 1.0
    collar_offset_ratio: float = 0.12
    brand: Optional[str] = "Pratibimb Studio"
    price: Optional[float] = 49.99
    color: Optional[str] = "Black"
    style_tags: List[str] = []
    image_url: str
    overlay_url: str
    recommended_face_shapes: List[str] = []
    recommended_undertones: List[str] = []
    description: Optional[str] = ""

class TryOnRequest(BaseModel):
    user_image_base64: Optional[str] = None
    sample_id: Optional[str] = None
    # Multi-layer items stack
    items: Optional[List[SelectedLayerItem]] = None
    # Backward compatibility fields
    glasses_id: Optional[str] = None
    garment_id: Optional[str] = None
    background_id: Optional[str] = None
    custom_garment_base64: Optional[str] = None
    custom_glasses_base64: Optional[str] = None
    adjust_scale: float = Field(default=1.0, ge=0.5, le=2.0)
    adjust_offset_y: float = Field(default=0.0, ge=-100.0, le=100.0)
    adjust_offset_x: float = Field(default=0.0, ge=-100.0, le=100.0)
    enable_segmentation: bool = True
    draw_landmarks: bool = False

class BiometricAnalysisResult(BaseModel):
    face_detected: bool
    face_shape: Optional[str] = "Oval"
    face_proportions: Dict[str, float] = {}
    skin_tone_hex: Optional[str] = "#e0ac69"
    skin_undertone: Optional[str] = "Warm"
    estimated_size: Optional[str] = "M"
    size_confidence: float = 0.88
    measurements_cm: Dict[str, float] = {}
    style_recommendations: List[str] = []
    flattering_colors: List[str] = []
    best_eyewear_shapes: List[str] = []

class AppliedLayerInfo(BaseModel):
    id: str
    name: str
    layer_type: str
    layer_order: int
    anchor: str

class TryOnResponse(BaseModel):
    success: bool
    result_image_base64: str
    face_mesh_detected: bool = False
    pose_detected: bool = False
    processing_time_ms: float
    biometrics: Optional[BiometricAnalysisResult] = None
    applied_items: Dict[str, Any] = {}
    applied_layers: List[AppliedLayerInfo] = []
    validation_warnings: List[str] = []
    error: Optional[str] = None

class LiveFrameRequest(BaseModel):
    frame_base64: str
    items: Optional[List[SelectedLayerItem]] = None
    glasses_id: Optional[str] = None
    garment_id: Optional[str] = None
    background_id: Optional[str] = None
    adjust_scale: float = 1.0
    adjust_offset_y: float = 0.0
    adjust_offset_x: float = 0.0

class SavedLook(BaseModel):
    id: Optional[str] = None
    title: str
    created_at: Optional[str] = None
    result_image_base64: str
    items_applied: List[str] = []
    notes: Optional[str] = None
