import type {
  CatalogItem,
  BackgroundPreset,
  SampleImage,
  TryOnResponse,
  BiometricAnalysis,
  SavedLook,
  SelectedLayerItem,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = {
  // Catalog APIs
  async getCatalogItems(category?: string): Promise<CatalogItem[]> {
    const url = category ? `${API_BASE_URL}/catalog/items?category=${category}` : `${API_BASE_URL}/catalog/items`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch catalog items');
    return res.json();
  },

  async getBackgrounds(): Promise<BackgroundPreset[]> {
    const res = await fetch(`${API_BASE_URL}/catalog/backgrounds`);
    if (!res.ok) throw new Error('Failed to fetch backgrounds');
    return res.json();
  },

  async getSamples(): Promise<SampleImage[]> {
    const res = await fetch(`${API_BASE_URL}/catalog/samples`);
    if (!res.ok) throw new Error('Failed to fetch samples');
    return res.json();
  },

  async uploadCustomItem(formData: FormData): Promise<CatalogItem> {
    const res = await fetch(`${API_BASE_URL}/catalog/upload-item`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload custom garment');
    return res.json();
  },

  // Try-On Engine API (Supports multi-layer stack and single items)
  async processTryOn(params: {
    user_image_base64?: string;
    sample_id?: string;
    items?: SelectedLayerItem[];
    glasses_id?: string;
    garment_id?: string;
    background_id?: string;
    custom_garment_base64?: string;
    custom_glasses_base64?: string;
    adjust_scale?: number;
    adjust_offset_x?: number;
    adjust_offset_y?: number;
    draw_landmarks?: boolean;
  }): Promise<TryOnResponse> {
    const res = await fetch(`${API_BASE_URL}/tryon/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adjust_scale: 1.0,
        adjust_offset_x: 0.0,
        adjust_offset_y: 0.0,
        draw_landmarks: false,
        ...params,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Try-on processing failed' }));
      throw new Error(err.detail || 'Try-on processing failed');
    }
    return res.json();
  },

  // Biometrics & AI Analysis API
  async analyzeBiometrics(params: { user_image_base64?: string; sample_id?: string }): Promise<BiometricAnalysis> {
    const res = await fetch(`${API_BASE_URL}/analysis/biometrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Biometric analysis failed');
    return res.json();
  },

  // Lookbook APIs
  async getSavedLooks(): Promise<SavedLook[]> {
    const res = await fetch(`${API_BASE_URL}/lookbook/list`);
    if (!res.ok) throw new Error('Failed to fetch lookbook');
    return res.json();
  },

  async saveLook(look: Partial<SavedLook>): Promise<SavedLook> {
    const res = await fetch(`${API_BASE_URL}/lookbook/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(look),
    });
    if (!res.ok) throw new Error('Failed to save look');
    return res.json();
  },

  async deleteLook(lookId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/lookbook/delete/${lookId}`, {
      method: 'DELETE',
    });
    return res.ok;
  },

  getWebSocketUrl(): string {
    const wsBase = API_BASE_URL.replace(/^http/, 'ws');
    return `${wsBase}/stream/ws`;
  }
};
