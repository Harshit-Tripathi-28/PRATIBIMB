import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { AvatarConfig } from '../types';

export interface ConstellationNodeData {
  goalsCount?: number;
  goalsSummary?: string;
  tasksCount?: number;
  tasksSummary?: string;
  memoriesCount?: number;
  memoriesSummary?: string;
  habitsCount?: number;
  habitsSummary?: string;
  focusText?: string;
  skillsCount?: number;
}

interface ThreeAvatarCanvasProps {
  config: AvatarConfig;
  className?: string;
  enableOrbit?: boolean;
  showNodes?: boolean;
  nodeData?: ConstellationNodeData;
  interactive?: boolean;
  onNodeClick?: (nodeType: 'goals' | 'tasks' | 'memory' | 'habits' | 'avatar' | 'chat') => void;
}

export const ThreeAvatarCanvas: React.FC<ThreeAvatarCanvasProps> = ({
  config,
  className = 'w-full h-full min-h-[300px]',
  showNodes = false,
  nodeData = { goalsCount: 0, memoriesCount: 0, habitsCount: 0, tasksCount: 0 },
  onNodeClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [hoveredNode, setHoveredNode] = useState<{ title: string; subtitle: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // 1. Scene Setup
    const scene = new THREE.Scene();

    // 2. Camera Setup (Comfortable framing: ~12% larger visual presence, centered)
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0, 0.22, 3.75);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;
    container.appendChild(renderer.domElement);

    // 4. Cinematic Studio Lighting with Enhanced Separation
    const ambientLight = new THREE.AmbientLight(0xe2e8f0, 1.35);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff8f0, 2.4);
    keyLight.position.set(2.4, 3.6, 3.2);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.8);
    rimLight.position.set(-2.8, 2.5, -2.4);
    scene.add(rimLight);

    const backGlowLight = new THREE.DirectionalLight(0x818cf8, 1.4);
    backGlowLight.position.set(0, 1.5, -2.8);
    scene.add(backGlowLight);

    const warmFill = new THREE.DirectionalLight(0x818cf8, 1.15);
    warmFill.position.set(0.4, -1.8, 2.4);
    scene.add(warmFill);

    // Root avatar group
    const avatarGroup = new THREE.Group();
    scene.add(avatarGroup);

    // Colors
    const skinHex = config.skin_tone || '#E0B394';
    const hairHex = config.hair_color || '#2C221E';
    const outfitHex = config.outfit_color || '#0F172A';
    const auraColorMap: Record<string, number> = {
      cyan: 0x06b6d4,
      violet: 0x8b5cf6,
      amber: 0xf59e0b,
      emerald: 0x10b981,
      rose: 0xf43f5e,
      obsidian: 0x64748b,
    };
    const auraHex = auraColorMap[config.aura_color || 'cyan'] || 0x06b6d4;

    // Materials
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(skinHex),
      roughness: 0.55,
      metalness: 0.05,
    });

    const hairMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hairHex),
      roughness: 0.62,
      metalness: 0.08,
    });

    const outfitMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(outfitHex),
      roughness: 0.65,
      metalness: 0.12,
    });

    const trimMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(outfitHex).offsetHSL(0.02, 0.08, 0.16),
      roughness: 0.45,
      metalness: 0.22,
    });

    const accentMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(auraHex),
      roughness: 0.3,
      metalness: 0.4,
      emissive: new THREE.Color(auraHex),
      emissiveIntensity: 0.3,
    });

    const eyeWhiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.2,
      metalness: 0.02,
    });

    const eyeIrisMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.15,
      metalness: 0.3,
    });

    const browMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hairHex).offsetHSL(0, -0.05, -0.05),
      roughness: 0.7,
    });

    const mouthMaterial = new THREE.MeshStandardMaterial({
      color: 0xbe123c,
      roughness: 0.45,
    });

    const glassFrameMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.8,
    });

    const glassLensMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.3,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.92,
      ior: 1.5,
    });

    // ==========================================
    // 5. Stylized Head & Facial Features
    // ==========================================
    const headGroup = new THREE.Group();
    avatarGroup.add(headGroup);

    // Head Base (Proportionate, clean curvature)
    const headGeometry = new THREE.SphereGeometry(0.48, 36, 36);
    headGeometry.scale(1.0, 1.14, 0.94);
    const headMesh = new THREE.Mesh(headGeometry, skinMaterial);
    headMesh.position.y = 0.5;
    headGroup.add(headMesh);

    // Natural Neck
    const neckGeometry = new THREE.CylinderGeometry(0.16, 0.20, 0.26, 32);
    const neckMesh = new THREE.Mesh(neckGeometry, skinMaterial);
    neckMesh.position.y = -0.02;
    avatarGroup.add(neckMesh);

    // Mood adjustments
    const currentMood = config.mood || 'focused';
    const browAngle = currentMood === 'focused' ? 0.18 : currentMood === 'analytical' ? 0.05 : 0.12;

    // Symmetrical Eyes with Sclera, Iris, and Specular Highlight
    const createEye = (xPos: number) => {
      const eyeG = new THREE.Group();
      eyeG.position.set(xPos, 0.54, 0.41);

      // Sclera
      const whiteGeo = new THREE.SphereGeometry(0.07, 24, 24);
      whiteGeo.scale(1.0, 0.7, 0.45);
      const whiteMesh = new THREE.Mesh(whiteGeo, eyeWhiteMaterial);
      eyeG.add(whiteMesh);

      // Iris
      const irisGeo = new THREE.SphereGeometry(0.038, 20, 20);
      irisGeo.scale(1.0, 1.0, 0.25);
      const irisMesh = new THREE.Mesh(irisGeo, eyeIrisMaterial);
      irisMesh.position.set(0, 0, 0.028);
      eyeG.add(irisMesh);

      // Specular Highlight
      const highlightGeo = new THREE.SphereGeometry(0.011, 10, 10);
      const highlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const highlightMesh = new THREE.Mesh(highlightGeo, highlightMat);
      highlightMesh.position.set(0.012, 0.012, 0.038);
      eyeG.add(highlightMesh);

      // Eyebrow (Strictly ABOVE the eyes with visible forehead)
      const browGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.11, 12);
      browGeo.rotateZ(xPos < 0 ? -browAngle : browAngle);
      const browMesh = new THREE.Mesh(browGeo, browMaterial);
      browMesh.position.set(0, 0.08, 0.025);
      eyeG.add(browMesh);

      return eyeG;
    };

    headGroup.add(createEye(-0.15));
    headGroup.add(createEye(0.15));

    // Subtle Natural Nose
    const noseGeo = new THREE.SphereGeometry(0.035, 16, 16);
    noseGeo.scale(1.0, 1.2, 0.8);
    const noseMesh = new THREE.Mesh(noseGeo, skinMaterial);
    noseMesh.position.set(0, 0.46, 0.46);
    headGroup.add(noseMesh);

    // Smile / Expression
    const mouthGeo = new THREE.TorusGeometry(
      currentMood === 'optimistic' ? 0.072 : 0.065, 
      0.013, 12, 20, Math.PI * (currentMood === 'optimistic' ? 0.7 : 0.62)
    );
    mouthGeo.rotateZ(Math.PI * 1.17);
    const mouthMesh = new THREE.Mesh(mouthGeo, mouthMaterial);
    mouthMesh.position.set(0, 0.36, 0.44);
    headGroup.add(mouthMesh);

    // ==========================================
    // 6. Volumetric Hair Geometry (Exposing Forehead)
    // ==========================================
    const hairStyle = config.hair_style || 'short_clean';
    const hairGroup = new THREE.Group();
    headGroup.add(hairGroup);

    if (hairStyle === 'long_wavy') {
      // Crown with visible forehead
      const topHair = new THREE.Mesh(new THREE.SphereGeometry(0.505, 28, 28), hairMaterial);
      topHair.position.set(0, 0.65, -0.05);
      topHair.scale.set(1.03, 1.04, 1.05);
      hairGroup.add(topHair);

      // Back & Shoulder Flowing locks
      const backFlow = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, 0.85, 24), hairMaterial);
      backFlow.position.set(0, 0.15, -0.22);
      backFlow.rotation.x = 0.08;
      hairGroup.add(backFlow);

      // Side strands behind the ears
      const leftTress = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.72, 16), hairMaterial);
      leftTress.position.set(-0.41, 0.26, 0.04);
      leftTress.rotation.z = 0.1;
      hairGroup.add(leftTress);

      const rightTress = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.72, 16), hairMaterial);
      rightTress.position.set(0.41, 0.26, 0.04);
      rightTress.rotation.z = -0.1;
      hairGroup.add(rightTress);
    } else if (hairStyle === 'curly' || hairStyle === 'curly_fade') {
      // Clustered Volumetric Curls (Exposing forehead)
      const baseCap = new THREE.Mesh(new THREE.SphereGeometry(0.50, 24, 24), hairMaterial);
      baseCap.position.set(0, 0.65, -0.03);
      baseCap.scale.set(1.02, 1.02, 1.03);
      hairGroup.add(baseCap);

      const curlsCount = 18;
      for (let i = 0; i < curlsCount; i++) {
        const phi = Math.acos(-1 + (2 * i) / curlsCount);
        const theta = Math.sqrt(curlsCount * Math.PI) * phi;
        const curlMesh = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), hairMaterial);
        const r = 0.47;
        curlMesh.position.set(
          r * Math.cos(theta) * Math.sin(phi),
          0.66 + r * Math.cos(phi) * 0.6,
          r * Math.sin(theta) * Math.sin(phi) * 0.78 - 0.04
        );
        hairGroup.add(curlMesh);
      }
    } else if (hairStyle === 'buzz' || hairStyle === 'clean') {
      // Clean Close-Cut Buzz
      const buzzHair = new THREE.Mesh(new THREE.SphereGeometry(0.495, 28, 28), hairMaterial);
      buzzHair.position.set(0, 0.57, -0.02);
      buzzHair.scale.set(1.015, 1.025, 1.015);
      hairGroup.add(buzzHair);
    } else if (hairStyle === 'textured' || hairStyle === 'textured_quiff') {
      // Modern Textured Quiff
      const topCap = new THREE.Mesh(new THREE.SphereGeometry(0.50, 28, 28), hairMaterial);
      topCap.position.set(0, 0.64, -0.04);
      topCap.scale.set(1.02, 1.03, 1.03);
      hairGroup.add(topCap);

      // Layered crown locks
      const lock1 = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 14), hairMaterial);
      lock1.scale.set(1.2, 0.8, 1.0);
      lock1.position.set(-0.05, 0.95, 0.14);
      lock1.rotation.set(-0.2, 0.1, -0.05);
      hairGroup.add(lock1);

      const lock2 = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 14), hairMaterial);
      lock2.scale.set(1.1, 0.7, 0.9);
      lock2.position.set(0.12, 0.93, 0.12);
      lock2.rotation.set(-0.22, -0.15, 0.08);
      hairGroup.add(lock2);
    } else {
      // Default: Short Clean Side-part (High hairline, visible forehead)
      const topCap = new THREE.Mesh(new THREE.SphereGeometry(0.50, 28, 28), hairMaterial);
      topCap.position.set(0, 0.63, -0.04);
      topCap.scale.set(1.02, 1.03, 1.03);
      hairGroup.add(topCap);

      const sideSweep = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.38, 16), hairMaterial);
      sideSweep.scale.set(1.2, 0.5, 0.8);
      sideSweep.position.set(0.08, 0.91, 0.14);
      sideSweep.rotation.set(-0.25, 0.2, -0.12);
      hairGroup.add(sideSweep);
    }

    // ==========================================
    // 7. Eyewear & Accessories
    // ==========================================
    if (config.glasses && config.glasses !== 'none') {
      const glassesGroup = new THREE.Group();
      glassesGroup.position.set(0, 0.54, 0.42);

      if (config.glasses === 'cyber') {
        // Cyber Visor Band
        const visorGeo = new THREE.BoxGeometry(0.48, 0.08, 0.12);
        const visorMesh = new THREE.Mesh(visorGeo, glassLensMaterial);
        visorMesh.position.set(0, 0, 0.02);
        glassesGroup.add(visorMesh);

        const visorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.09, 0.04), glassFrameMaterial);
        visorFrame.position.set(0, 0, -0.02);
        glassesGroup.add(visorFrame);
      } else if (config.glasses === 'round_wire') {
        // Round Wire Glasses
        const makeRound = (xPos: number) => {
          const rim = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.008, 12, 24), glassFrameMaterial);
          rim.position.x = xPos;
          const lens = new THREE.Mesh(new THREE.CircleGeometry(0.085, 20), glassLensMaterial);
          lens.position.x = xPos;
          glassesGroup.add(rim);
          glassesGroup.add(lens);
        };
        makeRound(-0.15);
        makeRound(0.15);
        const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.12, 8), glassFrameMaterial);
        bridge.rotation.z = Math.PI / 2;
        glassesGroup.add(bridge);
      } else {
        // Classic Modern Rectangular Frames
        const makeClassic = (xPos: number) => {
          const rim = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.011, 12, 24), glassFrameMaterial);
          rim.position.x = xPos;
          const lens = new THREE.Mesh(new THREE.CircleGeometry(0.085, 20), glassLensMaterial);
          lens.position.x = xPos;
          glassesGroup.add(rim);
          glassesGroup.add(lens);
        };
        makeClassic(-0.15);
        makeClassic(0.15);
        const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.11, 8), glassFrameMaterial);
        bridge.rotation.z = Math.PI / 2;
        glassesGroup.add(bridge);
      }

      headGroup.add(glassesGroup);
    }

    // ==========================================
    // 8. Style & Outfit Geometry Silhouettes
    // ==========================================
    const torsoGroup = new THREE.Group();
    avatarGroup.add(torsoGroup);

    const outfitStyle = config.outfit_style || 'tech_minimal';

    // Base Torso Geometry
    const torsoGeo = new THREE.CylinderGeometry(0.32, 0.44, 0.82, 32);
    torsoGeo.scale(1.26, 1.0, 0.68);
    const torsoMesh = new THREE.Mesh(torsoGeo, outfitMaterial);
    torsoMesh.position.y = -0.60;
    torsoGroup.add(torsoMesh);

    // Style Specific Trims
    if (outfitStyle === 'architect_blazer') {
      // Structured Blazer Lapels
      const lapelLeft = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55, 0.06), trimMaterial);
      lapelLeft.position.set(-0.18, -0.48, 0.24);
      lapelLeft.rotation.set(0.1, 0.1, -0.2);
      torsoGroup.add(lapelLeft);

      const lapelRight = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55, 0.06), trimMaterial);
      lapelRight.position.set(0.18, -0.48, 0.24);
      lapelRight.rotation.set(0.1, -0.1, 0.2);
      torsoGroup.add(lapelRight);
    } else if (outfitStyle === 'cyber_tactical') {
      // High Tactical Collar with Accent Line
      const tacticalCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.18, 28), trimMaterial);
      tacticalCollar.position.set(0, -0.16, 0);
      torsoGroup.add(tacticalCollar);

      const accentStrip = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.4, 0.02), accentMaterial);
      accentStrip.position.set(0, -0.48, 0.28);
      torsoGroup.add(accentStrip);
    } else if (outfitStyle === 'zen_flow') {
      // Relaxed Flow Drape
      const drapeLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.6, 16), trimMaterial);
      drapeLeft.position.set(-0.14, -0.5, 0.18);
      drapeLeft.rotation.z = -0.15;
      torsoGroup.add(drapeLeft);

      const drapeRight = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.6, 16), trimMaterial);
      drapeRight.position.set(0.14, -0.5, 0.18);
      drapeRight.rotation.z = 0.15;
      torsoGroup.add(drapeRight);
    } else {
      // Default: Tech Minimalist (illuminated chest indicator & collar)
      const collarGeo = new THREE.TorusGeometry(0.21, 0.032, 12, 28);
      collarGeo.rotateX(Math.PI / 2);
      const collarMesh = new THREE.Mesh(collarGeo, trimMaterial);
      collarMesh.position.set(0, -0.19, 0);
      torsoGroup.add(collarMesh);

      const lightLine = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.015, 0.01), accentMaterial);
      lightLine.position.set(0, -0.38, 0.28);
      torsoGroup.add(lightLine);
    }

    // Shoulder Caps
    const leftShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 16), outfitMaterial);
    leftShoulder.scale.set(1.0, 1.05, 0.88);
    leftShoulder.position.set(-0.49, -0.42, 0);
    torsoGroup.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 16), outfitMaterial);
    rightShoulder.scale.set(1.0, 1.05, 0.88);
    rightShoulder.position.set(0.49, -0.42, 0);
    torsoGroup.add(rightShoulder);

    // ==========================================
    // 9. Spatial Background Depth & Studio Floor
    // ==========================================
    const auraGroup = new THREE.Group();
    scene.add(auraGroup);

    // Soft studio base glow disk
    const groundGlowGeo = new THREE.CircleGeometry(1.4, 32);
    groundGlowGeo.rotateX(-Math.PI / 2);
    const groundGlowMat = new THREE.MeshBasicMaterial({
      color: auraHex,
      transparent: true,
      opacity: 0.18,
    });
    const groundGlow = new THREE.Mesh(groundGlowGeo, groundGlowMat);
    groundGlow.position.set(0, -1.02, 0);
    auraGroup.add(groundGlow);

    // Subtle floor contour ring
    const baseRingGeo = new THREE.TorusGeometry(1.4, 0.006, 12, 64);
    baseRingGeo.rotateX(Math.PI / 2);
    const baseRingMat = new THREE.MeshBasicMaterial({
      color: auraHex,
      transparent: true,
      opacity: 0.35,
    });
    const baseRing = new THREE.Mesh(baseRingGeo, baseRingMat);
    baseRing.position.set(0, -1.02, 0);
    auraGroup.add(baseRing);

    // Faint subtle spatial perspective grid
    const floorGrid = new THREE.GridHelper(5.5, 14, auraHex, 0x1e293b);
    floorGrid.position.set(0, -1.025, 0);
    (floorGrid.material as THREE.Material).transparent = true;
    (floorGrid.material as THREE.Material).opacity = 0.14;
    auraGroup.add(floorGrid);

    // Faint atmospheric back glow disc
    const backHaloGeo = new THREE.CircleGeometry(1.65, 32);
    const backHaloMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.06,
    });
    const backHalo = new THREE.Mesh(backHaloGeo, backHaloMat);
    backHalo.position.set(0, 0.35, -1.2);
    scene.add(backHalo);

    // Layer 1: Midground ambient floating particles
    const particleCount = 28;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 3.4;
      particlePositions[i + 1] = (Math.random() - 0.5) * 2.8 + 0.1;
      particlePositions[i + 2] = (Math.random() - 0.5) * 2.2;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: auraHex,
      size: 0.02,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Layer 2: Distant faint depth particles
    const distantCount = 24;
    const distantGeo = new THREE.BufferGeometry();
    const distantPositions = new Float32Array(distantCount * 3);

    for (let i = 0; i < distantCount * 3; i += 3) {
      distantPositions[i] = (Math.random() - 0.5) * 4.8;
      distantPositions[i + 1] = (Math.random() - 0.5) * 3.6 + 0.1;
      distantPositions[i + 2] = -1.2 - Math.random() * 1.8;
    }

    distantGeo.setAttribute('position', new THREE.BufferAttribute(distantPositions, 3));
    const distantMat = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: 0.014,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
    });
    const distantParticleSystem = new THREE.Points(distantGeo, distantMat);
    scene.add(distantParticleSystem);

    // ==========================================
    // 10. Digital Twin Constellation (REAL Entities Only)
    // ==========================================
    const nodesGroup = new THREE.Group();
    const interactiveMeshes: { mesh: THREE.Mesh; type: 'goals' | 'tasks' | 'memory' | 'habits' | 'avatar' | 'chat'; title: string; subtitle: string }[] = [];

    if (showNodes) {
      scene.add(nodesGroup);

      const createConstellationNode = (
        type: 'goals' | 'tasks' | 'memory' | 'habits' | 'avatar' | 'chat',
        color: number,
        angle: number,
        dist: number,
        yOffset: number,
        title: string,
        subtitle: string
      ) => {
        const nodeG = new THREE.Group();
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        nodeG.position.set(x, yOffset, z);

        // Core Sphere
        const sphereGeo = new THREE.SphereGeometry(0.09, 20, 20);
        const sphereMat = new THREE.MeshStandardMaterial({
          color: color,
          emissive: color,
          emissiveIntensity: 0.4,
          roughness: 0.25,
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        nodeG.add(sphere);

        // Halo
        const haloGeo = new THREE.SphereGeometry(0.13, 16, 16);
        const haloMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.25 });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        nodeG.add(halo);

        // Thin Connector Line to Center
        const lineMat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.25 });
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(-x * 0.85, -yOffset + 0.15, -z * 0.85),
        ]);
        const line = new THREE.Line(lineGeo, lineMat);
        nodeG.add(line);

        nodesGroup.add(nodeG);
        interactiveMeshes.push({ mesh: sphere, type, title, subtitle });
      };

      // Only render nodes for REAL existing data
      if ((nodeData.goalsCount || 0) > 0) {
        createConstellationNode(
          'goals',
          0x38bdf8,
          0.45,
          1.7,
          0.6,
          'Active Goals',
          nodeData.goalsSummary || `${nodeData.goalsCount} Strategic Goals`
        );
      }

      if ((nodeData.memoriesCount || 0) > 0) {
        createConstellationNode(
          'memory',
          0xa855f7,
          2.15,
          1.6,
          0.25,
          'Memory Vault',
          nodeData.memoriesSummary || `${nodeData.memoriesCount} Memories Indexed`
        );
      }

      if ((nodeData.habitsCount || 0) > 0) {
        createConstellationNode(
          'habits',
          0xf59e0b,
          3.85,
          1.65,
          -0.15,
          'Daily Rituals',
          nodeData.habitsSummary || `${nodeData.habitsCount} Habits Tracked`
        );
      }

      if ((nodeData.tasksCount || 0) > 0) {
        createConstellationNode(
          'tasks',
          0x10b981,
          5.15,
          1.7,
          0.2,
          'Pending Tasks',
          nodeData.tasksSummary || `${nodeData.tasksCount} Tasks in Queue`
        );
      }
    }

    // ==========================================
    // 11. Mouse Sway & Raycasting Interaction
    // ==========================================
    let targetRotY = 0;
    let targetRotX = 0;
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
      const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = mouseX * 0.4;
      targetRotX = mouseY * 0.18;

      if (showNodes && interactiveMeshes.length > 0) {
        mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouseVector, camera);

        const intersects = raycaster.intersectObjects(interactiveMeshes.map(m => m.mesh));
        if (intersects.length > 0) {
          const hit = interactiveMeshes.find(m => m.mesh === intersects[0].object);
          if (hit) {
            setHoveredNode({
              title: hit.title,
              subtitle: hit.subtitle,
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            });
            container.style.cursor = 'pointer';
            return;
          }
        }
        setHoveredNode(null);
        container.style.cursor = 'grab';
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!showNodes || !onNodeClick || interactiveMeshes.length === 0) return;
      const rect = container.getBoundingClientRect();
      mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseVector, camera);

      const intersects = raycaster.intersectObjects(interactiveMeshes.map(m => m.mesh));
      if (intersects.length > 0) {
        const hit = interactiveMeshes.find(m => m.mesh === intersects[0].object);
        if (hit) {
          onNodeClick(hit.type);
        }
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);

    // ==========================================
    // 12. Micro-Animation Loop
    // ==========================================
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle natural breathing
      const breath = Math.sin(elapsedTime * 1.4) * 0.012;
      headGroup.position.y = breath * 0.35;
      headGroup.rotation.z = Math.sin(elapsedTime * 0.7) * 0.008;
      torsoGroup.scale.set(1.26 + breath * 0.12, 1.0 + breath * 0.12, 0.68);

      // Smooth mouse follow
      avatarGroup.rotation.y += (targetRotY - avatarGroup.rotation.y) * 0.045;
      avatarGroup.rotation.x += (targetRotX - avatarGroup.rotation.x) * 0.045;

      // Slow particle & constellation drift
      particleSystem.rotation.y = elapsedTime * 0.02;
      distantParticleSystem.rotation.y = -elapsedTime * 0.012;
      baseRing.rotation.z = elapsedTime * 0.04;

      if (showNodes) {
        nodesGroup.rotation.y = Math.sin(elapsedTime * 0.2) * 0.12;
      }

      renderer.render(scene, camera);
    };

    animate();

    // ==========================================
    // 13. Resize Handler
    // ==========================================
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || 400;
      const newHeight = container.clientHeight || 400;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // ==========================================
    // 14. Cleanup
    // ==========================================
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [
    config.skin_tone,
    config.hair_style,
    config.hair_color,
    config.outfit_style,
    config.outfit_color,
    config.glasses,
    config.mood,
    config.aura_color,
    showNodes,
    nodeData.goalsCount,
    nodeData.memoriesCount,
    nodeData.habitsCount,
    nodeData.tasksCount,
  ]);

  if (!webglSupported) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 bg-slate-900/60 rounded-3xl border border-slate-800 ${className}`}>
        <div className="w-28 h-28 rounded-full border border-cyan-500/30 flex items-center justify-center bg-cyan-950/20 text-cyan-400 font-mono text-xs">
          2D DIGITAL TWIN
        </div>
        <p className="text-xs text-slate-500 mt-3">WebGL inactive · Running lightweight 2D mode</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center select-none overflow-hidden cursor-grab active:cursor-grabbing ${className}`}
      style={{ touchAction: 'none' }}
    >
      {/* Floating Constellation Hover Tooltip */}
      {hoveredNode && (
        <div 
          className="absolute pointer-events-none z-30 px-3 py-1.5 rounded-xl bg-slate-900/95 border border-cyan-500/40 text-xs shadow-2xl backdrop-blur-md transform -translate-x-1/2 -translate-y-full animate-fadeIn"
          style={{ left: `${hoveredNode.x}px`, top: `${hoveredNode.y - 12}px` }}
        >
          <div className="font-bold text-white text-[11px]">{hoveredNode.title}</div>
          <div className="text-[10px] text-cyan-300">{hoveredNode.subtitle}</div>
        </div>
      )}
    </div>
  );
};
