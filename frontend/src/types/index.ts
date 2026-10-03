export type LayerType = 'base_top' | 'outerwear' | 'accessory' | 'eyewear' | 'headwear' | 'background';
export type AnchorType = 'torso' | 'torso_neck' | 'face_eyes' | 'head_top' | 'background';

export interface SelectedLayerItem {
  id: string;
  layer_type: LayerType;
  custom_base64?: string;
  adjust_scale?: number;
  adjust_offset_x?: number;
  adjust_offset_y?: number;
}

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  sub_category?: string;
  layer_type: LayerType;
  layer_order: number;
  anchor_type: AnchorType;
  scale_multiplier?: number;
  collar_offset_ratio?: number;
  brand?: string;
  price?: number;
  color?: string;
  style_tags: string[];
  image_url: string;
  overlay_url: string;
  recommended_face_shapes?: string[];
  recommended_undertones?: string[];
  description?: string;
}

export interface BackgroundPreset {
  id: string;
  name: string;
  color_theme: string;
  image_url: string;
  description: string;
}

export interface SampleImage {
  id: string;
  name: string;
  url: string;
  file_path: string;
}

export interface BiometricAnalysis {
  face_detected: boolean;
  face_shape: 'Oval' | 'Square' | 'Round' | 'Heart' | 'Diamond' | 'Oblong' | string;
  face_proportions: Record<string, number>;
  skin_tone_hex: string;
  skin_undertone: 'Warm' | 'Cool' | 'Neutral' | string;
  estimated_size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | string;
  size_confidence: number;
  measurements_cm: Record<string, number>;
  style_recommendations: string[];
  flattering_colors: string[];
  best_eyewear_shapes: string[];
}

export interface AppliedLayerInfo {
  id: string;
  name: string;
  layer_type: string;
  layer_order: number;
  anchor: string;
}

export interface TryOnResponse {
  success: boolean;
  result_image_base64: string;
  face_mesh_detected: boolean;
  pose_detected: boolean;
  processing_time_ms: number;
  biometrics?: BiometricAnalysis;
  applied_items: Record<string, string>;
  applied_layers: AppliedLayerInfo[];
  validation_warnings?: string[];
  error?: string;
}

export interface SavedLook {
  id: string;
  title: string;
  created_at: string;
  result_image_base64: string;
  items_applied: string[];
  notes?: string;
}
