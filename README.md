# Pratibimb (प्रतिबिंब) — AI Virtual Mirror & Smart Dressing Room

Pratibimb is an end-to-end AI-powered Virtual Mirror, Eyewear & Apparel Fitting, Biometric Profiling, and Luxury Dressing Room web platform.

---

## 🚀 Key Features

### 1. 🪞 Live AI Smart Mirror (Real-Time Camera Stream)
- Live webcam streaming with real-time biometric tracking.
- Dynamic 3D roll angle and interpupillary scale tracking for glasses and sunglasses.
- Upper torso alignment for formal shirts, designer streetwear tees, and jackets.
- Real-time precision sliders for size scale, horizontal offset, and vertical position.
- High-res instant snapshot capture with shutter effects and confetti.

### 2. 👗 High-Precision Studio Virtual Try-On
- Upload your own high-resolution portrait or choose from preloaded authentic sample models.
- Side-by-side Before / After comparison slider and "Hold for Original" preview.
- Toggle Landmark Skeleton mesh overlay.
- Dynamic background replacement (Luxury Studio, Parisian Runway, Cyberpunk Neon, Sunset Penthouse).
- 4K HD export & direct save to Lookbook.

### 3. 🧬 Biometric Intelligence & Sizing Engine
- **Face Shape Classification**: Accurately classifies facial geometry into *Oval, Square, Round, Heart, Diamond, or Oblong* with tailored frame styling recommendations.
- **Colorimetry & Undertone Analysis**: Samples facial pixels to determine *Warm, Cool, or Neutral* undertone, complete with a personalized flattering palette.
- **Anthropometric Sizing**: Measures shoulder-to-shoulder span and chest breadth to recommend apparel fit (*XS, S, M, L, XL, XXL*) with a calculated confidence index.

### 4. 🛍️ Virtual Wardrobe & Custom Garment Uploader
- Designer catalog categorized by Eyewear, Formal Shirts, Heavyweight T-Shirts, and Outerwear.
- Custom Garment Uploader: Upload your own transparent PNG clothing or accessories to try them on immediately.

### 5. 📖 Virtual Lookbook Gallery
- Persisted collection of your saved virtual try-on looks.
- Full HD inspection modal with applied item breakdown and one-click image export.

---

## 🛠️ Architecture & Tech Stack

### Backend
- **FastAPI**: Asynchronous high-performance Python web framework.
- **OpenCV & Computer Vision**: Haar cascade classifiers, multi-scale geometric face/eye/torso feature tracking, GrabCut foreground segmentation, and alpha blending.
- **MediaPipe Geometry Models**: Structural landmark indexing and 3D pose anchors.
- **Pillow & NumPy**: Pixel manipulation, affine perspective transformation, and color space analytics.

### Frontend
- **React 19 + TypeScript**: Modern component architecture.
- **Vite**: Lightning-fast build tooling and HMR.
- **Tailwind CSS v4**: Dark cinematic glassmorphism UI with custom cyber neon styling.
- **Lucide Icons & Canvas Confetti**: Interactive tactile UI feedback.

---

## 🏃 Quick Start

### 1. Launch Everything (Windows)
Double-click `start_servers.bat` or run:
```bash
.\start_servers.bat
```

### 2. Run Manually

#### Backend
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at: [http://localhost:8000/docs](http://localhost:8000/docs)

#### Frontend
```bash
cd frontend
npm run dev
```
Access the application at: [http://localhost:5173](http://localhost:5173)

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/tryon/process` | Processes full static image try-on (garment, glasses, background, biometrics) |
| `POST` | `/api/stream/frame` | Single frame live webcam mirror processing |
| `WS` | `/api/stream/ws` | High-throughput WebSocket live video stream |
| `GET` | `/api/catalog/items` | Retrieve apparel and eyewear catalog |
| `POST` | `/api/catalog/upload-item` | Upload custom user garment or glasses |
| `GET` | `/api/catalog/backgrounds`| List studio staging backgrounds |
| `GET` | `/api/catalog/samples` | List sample portrait models |
| `POST` | `/api/analysis/biometrics`| Extract biometric face shape, undertone, and sizing |
| `GET` | `/api/lookbook/list` | Retrieve saved looks |
| `POST` | `/api/lookbook/save` | Save new outfit creation |
| `DELETE`| `/api/lookbook/delete/{id}` | Remove saved look |
