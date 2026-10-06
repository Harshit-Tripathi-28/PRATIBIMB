import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { LatentStateVector } from '../types';

interface ChakraCore3DProps {
  operationalState?: string;
  latentState?: LatentStateVector | null;
  activeStageIndex?: number;
  hoveredLayerId?: string | null;
  className?: string;
  isFixedBackground?: boolean;
}

export const ChakraCore3D: React.FC<ChakraCore3DProps> = ({
  operationalState = 'ACTIVE',
  latentState,
  activeStageIndex = 0,
  hoveredLayerId = null,
  className = 'w-full h-full min-h-[460px]',
  isFixedBackground = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

  // Active state refs for animation loop
  const activeStageRef = useRef(activeStageIndex);
  activeStageRef.current = activeStageIndex;

  const hoveredLayerRef = useRef(hoveredLayerId);
  hoveredLayerRef.current = hoveredLayerId;

  const operationalStateRef = useRef(operationalState);
  operationalStateRef.current = operationalState;

  const latentStateRef = useRef(latentState);
  latentStateRef.current = latentState;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera Setup (Centered Viewport Alignment)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.0);

    // 2. Renderer Setup (Calm, cinematic, anti-aliased, 0 background)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.92;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // =========================================================================
    // COLOR PALETTE (Subdued Antique Gold, Deep Crimson, Cosmic Blue, Near-Black)
    // =========================================================================
    const COLOR_ANTIQUE_GOLD = new THREE.Color('#85651D');
    const COLOR_WARM_BRONZE = new THREE.Color('#4F370D');
    const COLOR_DEEP_CRIMSON = new THREE.Color('#4D0915');
    const COLOR_ENERGY_CRIMSON = new THREE.Color('#8C1229');
    const COLOR_RUBY_CORE = new THREE.Color('#C9183E');
    const COLOR_COSMIC_BLUE = new THREE.Color('#10386E');
    const COLOR_CYAN_ACCENT = new THREE.Color('#24788C');
    const COLOR_SOFT_WHITE = new THREE.Color('#D9CFB8');

    // =========================================================================
    // MASTER ROOT (TRUE VIEWPORT & HERO CENTER: (0, 0, 0) AT ALL BREAKPOINTS)
    // =========================================================================
    const masterRoot = new THREE.Group();
    masterRoot.position.set(0, 0, 0);
    scene.add(masterRoot);

    // =========================================================================
    // 1. ATMOSPHERIC 3D CHAKRA HALO (Centered Background Atmosphere — z: -0.15)
    // Scale: ~80% Viewport Height (Radius: 1.42)
    // =========================================================================
    const chakraHaloGroup = new THREE.Group();
    chakraHaloGroup.position.set(0, 0, -0.15);
    masterRoot.add(chakraHaloGroup);

    // 1a. Outer Serrated Blade Rim (Radius 1.42)
    const outerRimGroup = new THREE.Group();
    chakraHaloGroup.add(outerRimGroup);

    const outerRailGeo = new THREE.TorusGeometry(1.42, 0.010, 16, 120);
    const outerRailMat = new THREE.MeshStandardMaterial({
      color: COLOR_ANTIQUE_GOLD,
      metalness: 0.92,
      roughness: 0.42,
      emissive: COLOR_DEEP_CRIMSON,
      emissiveIntensity: 0.08,
    });
    const outerRailMesh = new THREE.Mesh(outerRailGeo, outerRailMat);
    outerRimGroup.add(outerRailMesh);

    // 24 Proportional Serrated Blades framing the Center
    const bladeCount = 24;
    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(0, 0);
    bladeShape.lineTo(0.018, 0.10);
    bladeShape.lineTo(0.003, 0.14);
    bladeShape.lineTo(-0.015, 0.08);
    bladeShape.closePath();

    const bladeExtrudeSettings = {
      steps: 1,
      depth: 0.010,
      bevelEnabled: true,
      bevelThickness: 0.003,
      bevelSize: 0.002,
      bevelSegments: 1,
    };
    const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, bladeExtrudeSettings);
    bladeGeo.center();

    const bladeMat = new THREE.MeshStandardMaterial({
      color: COLOR_WARM_BRONZE,
      metalness: 0.94,
      roughness: 0.46,
      emissive: COLOR_DEEP_CRIMSON,
      emissiveIntensity: 0.07,
    });

    for (let i = 0; i < bladeCount; i++) {
      const angle = (i / bladeCount) * Math.PI * 2;
      const bladeMesh = new THREE.Mesh(bladeGeo, bladeMat);
      const radius = 1.42;
      bladeMesh.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
      bladeMesh.rotation.z = angle - Math.PI / 2 + 0.15;
      outerRimGroup.add(bladeMesh);
    }

    // 1b. Concentric Yantra Arcs (Middle Ring — Radius 1.14)
    const yantraGroup = new THREE.Group();
    chakraHaloGroup.add(yantraGroup);

    const midRailGeo = new THREE.TorusGeometry(1.14, 0.008, 16, 96);
    const midRailMat = new THREE.MeshStandardMaterial({
      color: COLOR_ANTIQUE_GOLD,
      metalness: 0.88,
      roughness: 0.48,
      emissive: COLOR_DEEP_CRIMSON,
      emissiveIntensity: 0.08,
    });
    const midRailMesh = new THREE.Mesh(midRailGeo, midRailMat);
    yantraGroup.add(midRailMesh);

    // 16 Inscribed Yantra Petal Arcs
    const petalCount = 16;
    const yantraCurves: THREE.Line[] = [];
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const arcCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(Math.cos(angle) * 1.14, Math.sin(angle) * 1.14, 0),
        new THREE.Vector3(
          Math.cos(angle + Math.PI / petalCount) * 1.30,
          Math.sin(angle + Math.PI / petalCount) * 1.30,
          0.012
        ),
        new THREE.Vector3(
          Math.cos(angle + (2 * Math.PI) / petalCount) * 1.14,
          Math.sin(angle + (2 * Math.PI) / petalCount) * 1.14,
          0
        )
      );
      const arcGeo = new THREE.BufferGeometry().setFromPoints(arcCurve.getPoints(14));
      const arcMat = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? COLOR_ANTIQUE_GOLD : COLOR_COSMIC_BLUE,
        transparent: true,
        opacity: 0.32,
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      yantraGroup.add(arcLine);
      yantraCurves.push(arcLine);
    }

    // 1c. Inner Counter-Rotating Spoke Lattice (Radius 0.86)
    const innerSpokeGroup = new THREE.Group();
    chakraHaloGroup.add(innerSpokeGroup);

    const innerRailGeo = new THREE.TorusGeometry(0.86, 0.007, 16, 80);
    const innerRailMat = new THREE.MeshStandardMaterial({
      color: COLOR_WARM_BRONZE,
      metalness: 0.9,
      roughness: 0.45,
      emissive: COLOR_ENERGY_CRIMSON,
      emissiveIntensity: 0.08,
    });
    const innerRailMesh = new THREE.Mesh(innerRailGeo, innerRailMat);
    innerSpokeGroup.add(innerRailMesh);

    // 12 Delicate Spoke Struts
    const spokeCount = 12;
    const spokeGeo = new THREE.CylinderGeometry(0.0025, 0.005, 0.86, 6);
    const spokeMat = new THREE.MeshStandardMaterial({
      color: COLOR_ANTIQUE_GOLD,
      metalness: 0.85,
      roughness: 0.5,
      emissive: COLOR_DEEP_CRIMSON,
      emissiveIntensity: 0.06,
    });
    for (let i = 0; i < spokeCount; i++) {
      const a = (i / spokeCount) * Math.PI * 2;
      const spokeMesh = new THREE.Mesh(spokeGeo, spokeMat);
      spokeMesh.position.set((Math.cos(a) * 0.86) / 2, (Math.sin(a) * 0.86) / 2, 0);
      spokeMesh.rotation.z = a + Math.PI / 2;
      innerSpokeGroup.add(spokeMesh);
    }

    // Concentric Hexagram Geometry (Centered at x: 0, y: 0)
    const tri1Shape = new THREE.Shape();
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
      const r = 0.60;
      if (i === 0) tri1Shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else tri1Shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    tri1Shape.closePath();
    const tri1Geo = new THREE.BufferGeometry().setFromPoints(tri1Shape.getPoints());
    const tri1Mat = new THREE.LineBasicMaterial({
      color: COLOR_ANTIQUE_GOLD,
      transparent: true,
      opacity: 0.35,
    });
    const tri1Line = new THREE.Line(tri1Geo, tri1Mat);
    innerSpokeGroup.add(tri1Line);

    const tri2Shape = new THREE.Shape();
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + Math.PI / 2;
      const r = 0.60;
      if (i === 0) tri2Shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else tri2Shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    tri2Shape.closePath();
    const tri2Geo = new THREE.BufferGeometry().setFromPoints(tri2Shape.getPoints());
    const tri2Mat = new THREE.LineBasicMaterial({
      color: COLOR_ENERGY_CRIMSON,
      transparent: true,
      opacity: 0.30,
    });
    const tri2Line = new THREE.Line(tri2Geo, tri2Mat);
    innerSpokeGroup.add(tri2Line);

    // =========================================================================
    // 2. THE DIGITAL TWIN HERO PRESENCE (Exact Co-Center at (0, 0, 0.18))
    // =========================================================================
    const digitalTwinGroup = new THREE.Group();
    digitalTwinGroup.position.set(0, 0, 0.18);
    masterRoot.add(digitalTwinGroup);

    // 2a. Structured Anatomical Neural Point Clustering
    const twinPointsCount = 520;
    const twinPointPositions = new Float32Array(twinPointsCount * 3);
    const twinPointColors = new Float32Array(twinPointsCount * 3);

    let pIdx = 0;

    // Head / Cranial Neural Cortex (150 clustered points at y: +0.42)
    for (let i = 0; i < 150; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 0.17 * Math.cbrt(Math.random());
      const sinPhi = Math.sin(phi);
      twinPointPositions[pIdx * 3] = r * sinPhi * Math.cos(theta);
      twinPointPositions[pIdx * 3 + 1] = 0.42 + r * Math.cos(phi) * 1.12;
      twinPointPositions[pIdx * 3 + 2] = r * sinPhi * Math.sin(theta);

      const isGold = Math.random() > 0.55;
      const col = isGold ? COLOR_ANTIQUE_GOLD : COLOR_RUBY_CORE;
      twinPointColors[pIdx * 3] = col.r;
      twinPointColors[pIdx * 3 + 1] = col.g;
      twinPointColors[pIdx * 3 + 2] = col.b;
      pIdx++;
    }

    // Spine & Central Neural Signal Axis (60 points along y: +0.40 down to -0.40)
    for (let i = 0; i < 60; i++) {
      const t = (i / 60);
      const y = 0.40 - t * 0.80;
      twinPointPositions[pIdx * 3] = (Math.random() - 0.5) * 0.035;
      twinPointPositions[pIdx * 3 + 1] = y;
      twinPointPositions[pIdx * 3 + 2] = (Math.random() - 0.5) * 0.035;

      twinPointColors[pIdx * 3] = COLOR_SOFT_WHITE.r;
      twinPointColors[pIdx * 3 + 1] = COLOR_SOFT_WHITE.g;
      twinPointColors[pIdx * 3 + 2] = COLOR_SOFT_WHITE.b;
      pIdx++;
    }

    // Shoulders, Clavicle & Chest Contours (200 structured volumetric points)
    for (let i = 0; i < 200; i++) {
      const t = Math.random();
      const y = 0.25 - t * 0.58;
      const shoulderSpread = 0.34 * (1.0 - t * 0.48);
      const x = (Math.random() - 0.5) * 2 * shoulderSpread;
      const z = (Math.random() - 0.5) * 0.12;

      twinPointPositions[pIdx * 3] = x;
      twinPointPositions[pIdx * 3 + 1] = y;
      twinPointPositions[pIdx * 3 + 2] = z;

      const isCrimson = Math.random() > 0.45;
      const col = isCrimson ? COLOR_ENERGY_CRIMSON : COLOR_ANTIQUE_GOLD;
      twinPointColors[pIdx * 3] = col.r;
      twinPointColors[pIdx * 3 + 1] = col.g;
      twinPointColors[pIdx * 3 + 2] = col.b;
      pIdx++;
    }

    // Neural Peripheral Filament Contours around Torso (110 points)
    for (let i = 0; i < 110; i++) {
      const a = Math.random() * Math.PI * 2;
      const ringY = 0.26 - Math.random() * 0.65;
      const ringR = 0.24 + Math.random() * 0.10;
      twinPointPositions[pIdx * 3] = Math.cos(a) * ringR;
      twinPointPositions[pIdx * 3 + 1] = ringY;
      twinPointPositions[pIdx * 3 + 2] = Math.sin(a) * 0.07;

      twinPointColors[pIdx * 3] = COLOR_CYAN_ACCENT.r;
      twinPointColors[pIdx * 3 + 1] = COLOR_CYAN_ACCENT.g;
      twinPointColors[pIdx * 3 + 2] = COLOR_CYAN_ACCENT.b;
      pIdx++;
    }

    const twinGeo = new THREE.BufferGeometry();
    twinGeo.setAttribute('position', new THREE.BufferAttribute(twinPointPositions, 3));
    twinGeo.setAttribute('color', new THREE.BufferAttribute(twinPointColors, 3));

    const twinMat = new THREE.PointsMaterial({
      size: 0.030,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
    });
    const twinPointsMesh = new THREE.Points(twinGeo, twinMat);
    digitalTwinGroup.add(twinPointsMesh);

    // 2b. Central Consciousness Nucleus (Centered at (0, 0.06, 0.04))
    const chestCoreGroup = new THREE.Group();
    chestCoreGroup.position.set(0, 0.06, 0.04);
    digitalTwinGroup.add(chestCoreGroup);

    // Glowing Inner Nucleus Sphere
    const innerNucleusGeo = new THREE.SphereGeometry(0.10, 24, 24);
    const innerNucleusMat = new THREE.MeshBasicMaterial({
      color: COLOR_SOFT_WHITE,
      transparent: true,
      opacity: 0.88,
    });
    const innerNucleusMesh = new THREE.Mesh(innerNucleusGeo, innerNucleusMat);
    chestCoreGroup.add(innerNucleusMesh);

    // Ruby Faceted Dodecahedron Core
    const chestDodecaGeo = new THREE.DodecahedronGeometry(0.16, 1);
    const chestDodecaMat = new THREE.MeshBasicMaterial({
      color: COLOR_RUBY_CORE,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const chestDodecaMesh = new THREE.Mesh(chestDodecaGeo, chestDodecaMat);
    chestCoreGroup.add(chestDodecaMesh);

    // Delicate Antique Gold Icosahedron Cage
    const chestIcoGeo = new THREE.IcosahedronGeometry(0.22, 1);
    const chestIcoMat = new THREE.MeshBasicMaterial({
      color: COLOR_ANTIQUE_GOLD,
      wireframe: true,
      transparent: true,
      opacity: 0.40,
    });
    const chestIcoMesh = new THREE.Mesh(chestIcoGeo, chestIcoMat);
    chestCoreGroup.add(chestIcoMesh);

    // =========================================================================
    // 3. FULL-VIEWPORT AMBIENT NEURAL PARTICLE ATMOSPHERE (550 Particles)
    // =========================================================================
    const fullParticleCount = 550;
    const particlePositions = new Float32Array(fullParticleCount * 3);
    const particleBasePos = new Float32Array(fullParticleCount * 3);
    const particleColors = new Float32Array(fullParticleCount * 3);
    const particleVelocities = new Float32Array(fullParticleCount * 3);
    const particleFrequencies = new Float32Array(fullParticleCount * 3);

    for (let i = 0; i < fullParticleCount; i++) {
      let px: number, py: number, pz: number;
      let col: THREE.Color;

      if (i < 385) {
        // 70% Atmospheric Particles distributed across the entire 100% viewport
        px = (Math.random() - 0.5) * 11.6;
        py = (Math.random() - 0.5) * 7.4;
        pz = (Math.random() - 0.5) * 3.6;

        const randChoice = Math.random();
        if (randChoice < 0.35) col = COLOR_COSMIC_BLUE;
        else if (randChoice < 0.65) col = COLOR_CYAN_ACCENT;
        else if (randChoice < 0.85) col = COLOR_ANTIQUE_GOLD;
        else col = COLOR_DEEP_CRIMSON;
      } else if (i < 495) {
        // 20% Midground Intelligence Field (Moderate Density around Central Space)
        px = (Math.random() - 0.5) * 5.2;
        py = (Math.random() - 0.5) * 4.2;
        pz = (Math.random() - 0.5) * 2.2;

        const randChoice = Math.random();
        if (randChoice < 0.4) col = COLOR_ANTIQUE_GOLD;
        else if (randChoice < 0.75) col = COLOR_ENERGY_CRIMSON;
        else col = COLOR_CYAN_ACCENT;
      } else {
        // 10% Structured Halo / Twin Drift Particles (Centered)
        const theta = Math.random() * Math.PI * 2;
        const rad = 0.7 + Math.random() * 1.4;
        px = Math.cos(theta) * rad;
        py = Math.sin(theta) * rad;
        pz = (Math.random() - 0.5) * 0.8;

        col = Math.random() > 0.5 ? COLOR_ANTIQUE_GOLD : COLOR_SOFT_WHITE;
      }

      particlePositions[i * 3] = px;
      particlePositions[i * 3 + 1] = py;
      particlePositions[i * 3 + 2] = pz;

      particleBasePos[i * 3] = px;
      particleBasePos[i * 3 + 1] = py;
      particleBasePos[i * 3 + 2] = pz;

      particleColors[i * 3] = col.r;
      particleColors[i * 3 + 1] = col.g;
      particleColors[i * 3 + 2] = col.b;

      particleVelocities[i * 3] = (Math.random() - 0.5) * 0.0003;
      particleVelocities[i * 3 + 1] = 0.0002 + Math.random() * 0.0004;
      particleVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.0002;

      particleFrequencies[i * 3] = 0.2 + Math.random() * 0.4;
      particleFrequencies[i * 3 + 1] = 0.2 + Math.random() * 0.4;
      particleFrequencies[i * 3 + 2] = 0.2 + Math.random() * 0.4;
    }

    const fullParticleGeo = new THREE.BufferGeometry();
    fullParticleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    fullParticleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const fullParticleMat = new THREE.PointsMaterial({
      size: 0.018,
      vertexColors: true,
      transparent: true,
      opacity: 0.52,
      blending: THREE.AdditiveBlending,
    });
    const fullParticleSystem = new THREE.Points(fullParticleGeo, fullParticleMat);
    scene.add(fullParticleSystem);

    // =========================================================================
    // 4. SUBTLE DYNAMIC NEURAL FILAMENTS
    // =========================================================================
    const filamentPairCount = 28;
    const filamentPositions = new Float32Array(filamentPairCount * 2 * 3);
    const filamentGeo = new THREE.BufferGeometry();
    filamentGeo.setAttribute('position', new THREE.BufferAttribute(filamentPositions, 3));

    const filamentMat = new THREE.LineBasicMaterial({
      color: COLOR_CYAN_ACCENT,
      transparent: true,
      opacity: 0.10,
      blending: THREE.AdditiveBlending,
    });
    const filamentLines = new THREE.LineSegments(filamentGeo, filamentMat);
    scene.add(filamentLines);

    const filamentPairs: [number, number][] = [];
    for (let f = 0; f < filamentPairCount; f++) {
      const p1 = Math.floor(Math.random() * (fullParticleCount - 50));
      const p2 = p1 + 1 + Math.floor(Math.random() * 8);
      filamentPairs.push([p1, p2]);
    }

    // =========================================================================
    // 5. CINEMATIC RESTING LIGHTING
    // =========================================================================
    const coreLight = new THREE.PointLight(COLOR_ENERGY_CRIMSON.getHex(), 1.4, 6);
    coreLight.position.set(0, 0.1, 0.3);
    chestCoreGroup.add(coreLight);

    const warmKeyLight = new THREE.DirectionalLight(COLOR_ANTIQUE_GOLD.getHex(), 0.65);
    warmKeyLight.position.set(2.0, 2.5, 3.0);
    scene.add(warmKeyLight);

    const coolFillLight = new THREE.DirectionalLight(COLOR_COSMIC_BLUE.getHex(), 0.55);
    coolFillLight.position.set(-2.5, -1.8, 1.8);
    scene.add(coolFillLight);

    // =========================================================================
    // 6. MOUSE PARALLAX & RESIZE (Fixed Center (0,0,0) across all screen sizes)
    // =========================================================================
    let targetRotX = 0;
    let targetRotY = 0;
    let targetTwinParallaxX = 0;
    let targetTwinParallaxY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;

      targetRotY = nx * 0.08;
      targetRotX = -ny * 0.06;

      targetTwinParallaxX = nx * 0.04;
      targetTwinParallaxY = ny * 0.03;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      masterRoot.position.set(0, 0, 0);
    };
    window.addEventListener('resize', handleResize);

    // =========================================================================
    // 7. ULTRA-SLOW CALM BREATHING ANIMATION LOOP (0.015 - 0.03 revs/sec)
    // =========================================================================
    let animId: number;
    const clock = new THREE.Clock();

    const render = () => {
      const elapsedTime = clock.getElapsedTime();

      // Outer Rim: ~0.00035 rad/frame (ultra-slow, majestic breathing speed)
      outerRimGroup.rotation.z += 0.00038;

      // Middle Yantra: ~0.00020 rad/frame
      yantraGroup.rotation.z += 0.00022;

      // Inner Spoke Lattice: Counter-clockwise ~0.00045 rad/frame
      innerSpokeGroup.rotation.z -= 0.00048;

      // Digital Twin Cognitive Core rotation & breathing
      chestDodecaMesh.rotation.x = elapsedTime * 0.10;
      chestDodecaMesh.rotation.y = elapsedTime * 0.12;
      chestIcoMesh.rotation.y = -elapsedTime * 0.08;
      chestIcoMesh.rotation.z = elapsedTime * 0.06;

      // Gentle, serene breathing expansion
      const breath = 1.0 + Math.sin(elapsedTime * 0.85) * 0.015;
      chestCoreGroup.scale.set(breath, breath, breath);
      innerNucleusMat.opacity = 0.75 + Math.sin(elapsedTime * 1.0) * 0.10;
      coreLight.intensity = 1.2 + Math.sin(elapsedTime * 0.8) * 0.25;

      // Full-Viewport Ambient Neural Particle Drift
      const partPosAttr = fullParticleGeo.attributes.position as THREE.BufferAttribute;
      const partArray = partPosAttr.array as Float32Array;

      for (let i = 0; i < fullParticleCount; i++) {
        const idx = i * 3;
        const fx = particleFrequencies[idx];
        const fy = particleFrequencies[idx + 1];

        partArray[idx] = particleBasePos[idx] + Math.sin(elapsedTime * fx + i) * 0.06;
        partArray[idx + 1] += particleVelocities[idx + 1];
        partArray[idx + 2] = particleBasePos[idx + 2] + Math.cos(elapsedTime * fy + i) * 0.04;

        if (partArray[idx + 1] > 3.8) {
          partArray[idx + 1] = -3.8;
        }
      }
      partPosAttr.needsUpdate = true;

      // Dynamic Filament line segments
      const filPosAttr = filamentGeo.attributes.position as THREE.BufferAttribute;
      const filArray = filPosAttr.array as Float32Array;
      for (let f = 0; f < filamentPairCount; f++) {
        const [p1, p2] = filamentPairs[f];
        const idx1 = p1 * 3;
        const idx2 = p2 * 3;

        const fIdx = f * 6;
        filArray[fIdx] = partArray[idx1];
        filArray[fIdx + 1] = partArray[idx1 + 1];
        filArray[fIdx + 2] = partArray[idx1 + 2];

        filArray[fIdx + 3] = partArray[idx2];
        filArray[fIdx + 4] = partArray[idx2 + 1];
        filArray[fIdx + 5] = partArray[idx2 + 2];
      }
      filPosAttr.needsUpdate = true;
      filamentMat.opacity = 0.08 + Math.sin(elapsedTime * 0.6) * 0.03;

      // Damped parallax interpolation
      chakraHaloGroup.rotation.x += (targetRotX - chakraHaloGroup.rotation.x) * 0.02;
      chakraHaloGroup.rotation.y += (targetRotY - chakraHaloGroup.rotation.y) * 0.02;

      digitalTwinGroup.position.x += (targetTwinParallaxX - digitalTwinGroup.position.x) * 0.03;
      digitalTwinGroup.position.y += (targetTwinParallaxY - digitalTwinGroup.position.y) * 0.03;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      outerRailGeo.dispose();
      outerRailMat.dispose();
      bladeGeo.dispose();
      bladeMat.dispose();
      midRailGeo.dispose();
      midRailMat.dispose();
      innerRailGeo.dispose();
      innerRailMat.dispose();
      spokeGeo.dispose();
      spokeMat.dispose();
      tri1Geo.dispose();
      tri1Mat.dispose();
      tri2Geo.dispose();
      tri2Mat.dispose();
      twinGeo.dispose();
      twinMat.dispose();
      innerNucleusGeo.dispose();
      innerNucleusMat.dispose();
      chestDodecaGeo.dispose();
      chestDodecaMat.dispose();
      chestIcoGeo.dispose();
      chestIcoMat.dispose();
      fullParticleGeo.dispose();
      fullParticleMat.dispose();
      filamentGeo.dispose();
      filamentMat.dispose();
      yantraCurves.forEach(c => {
        c.geometry.dispose();
        (c.material as THREE.Material).dispose();
      });
    };
  }, []);

  if (!webglSupported) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center p-6 rounded-3xl bg-[#04060C] border border-[#85651D]/30 text-xs font-mono text-[#85651D]">
          [3D Acceleration Offline • Digital Twin State Active]
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${className} ${
        isFixedBackground ? 'fixed inset-0 z-0 pointer-events-none' : ''
      }`}
    />
  );
};
