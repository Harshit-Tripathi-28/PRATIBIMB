import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { OperationalStateType, LatentStateVector } from '../types';

export interface NeuralCore3DProps {
  operationalState?: OperationalStateType;
  latentState?: LatentStateVector | null;
  memoriesCount?: number;
  goalsCount?: number;
  tasksCount?: number;
  hoveredSubsystem?: string | null;
  onSubsystemClick?: (subsystemId: string) => void;
  onCoreClick?: () => void;
  className?: string;
  interactive?: boolean;
}

export const NeuralCore3D: React.FC<NeuralCore3DProps> = ({
  operationalState = 'ACTIVE',
  latentState,
  memoriesCount = 12,
  goalsCount = 4,
  tasksCount = 8,
  hoveredSubsystem = null,
  onSubsystemClick,
  onCoreClick,
  className = 'w-full h-full min-h-[420px]',
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [hoveredNodeInfo, setHoveredNodeInfo] = useState<{ id: string; label: string; x: number; y: number } | null>(null);

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

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // 1. Scene Setup
    const scene = new THREE.Scene();

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.6);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Master Group
    const coreRoot = new THREE.Group();
    scene.add(coreRoot);

    // =========================================================================
    // COLOR PALETTE (Crimson + Cosmic Blue + Void + Accent Cyan)
    // =========================================================================
    const COLOR_DEEP_CRIMSON = new THREE.Color('#8B0F24');
    const COLOR_ENERGY_CRIMSON = new THREE.Color('#E51D48');
    const COLOR_BRIGHT_CORE = new THREE.Color('#FF365C');
    const COLOR_ORANGE_CORE = new THREE.Color('#FF6B35');
    const COLOR_COSMIC_BLUE = new THREE.Color('#1E7BFF');
    const COLOR_DEEP_BLUE = new THREE.Color('#123B73');
    const COLOR_CYAN_ACCENT = new THREE.Color('#48D7FF');
    const COLOR_SOFT_WHITE = new THREE.Color('#F4F7FF');

    // =========================================================================
    // 1. CENTRAL NUCLEUS (Layered 3D Latent Core)
    // =========================================================================
    const nucleusGroup = new THREE.Group();
    coreRoot.add(nucleusGroup);

    // 1a. Inner Glowing Core Sphere
    const innerGeo = new THREE.SphereGeometry(0.38, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: COLOR_BRIGHT_CORE,
      transparent: true,
      opacity: 0.92,
    });
    const innerCoreMesh = new THREE.Mesh(innerGeo, innerMat);
    nucleusGroup.add(innerCoreMesh);

    // 1b. Soft Crimson Energy Corona
    const coronaGeo = new THREE.SphereGeometry(0.55, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: COLOR_ENERGY_CRIMSON,
      transparent: true,
      opacity: 0.28,
      wireframe: true,
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    nucleusGroup.add(coronaMesh);

    // 1c. Cyan/Blue Inner Quantum Shell
    const quantumShellGeo = new THREE.IcosahedronGeometry(0.72, 2);
    const quantumShellMat = new THREE.MeshBasicMaterial({
      color: COLOR_CYAN_ACCENT,
      transparent: true,
      opacity: 0.16,
      wireframe: true,
    });
    const quantumShellMesh = new THREE.Mesh(quantumShellGeo, quantumShellMat);
    nucleusGroup.add(quantumShellMesh);

    // 1d. Central Point Light
    const coreLight = new THREE.PointLight(COLOR_ENERGY_CRIMSON.getHex(), 3.5, 8);
    coreLight.position.set(0, 0, 0);
    nucleusGroup.add(coreLight);

    const blueLight = new THREE.PointLight(COLOR_COSMIC_BLUE.getHex(), 2.0, 10);
    blueLight.position.set(0, 0.5, 0.5);
    nucleusGroup.add(blueLight);

    // =========================================================================
    // 2. RADIAL NEURAL FILAMENTS (Curved Neural Pathways)
    // =========================================================================
    const filamentsGroup = new THREE.Group();
    coreRoot.add(filamentsGroup);

    const filamentCurves: THREE.CatmullRomCurve3[] = [];
    const filamentMeshGroup = new THREE.Group();
    filamentsGroup.add(filamentMeshGroup);

    const numFilaments = 12 + Math.min(memoriesCount, 16);
    for (let i = 0; i < numFilaments; i++) {
      const theta = (i / numFilaments) * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.7;
      const radiusOut = 1.6 + Math.random() * 0.6;

      const p0 = new THREE.Vector3(
        Math.cos(theta) * 0.25,
        Math.sin(phi) * 0.25,
        Math.sin(theta) * 0.25
      );
      const p1 = new THREE.Vector3(
        Math.cos(theta + 0.3) * (radiusOut * 0.5),
        Math.sin(phi + 0.2) * (radiusOut * 0.5),
        Math.sin(theta + 0.3) * (radiusOut * 0.5)
      );
      const p2 = new THREE.Vector3(
        Math.cos(theta) * radiusOut,
        Math.sin(phi) * radiusOut,
        Math.sin(theta) * radiusOut
      );

      const curve = new THREE.CatmullRomCurve3([p0, p1, p2]);
      filamentCurves.push(curve);

      const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.008 + (i % 3 === 0 ? 0.006 : 0), 6, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? COLOR_ENERGY_CRIMSON : COLOR_COSMIC_BLUE,
        transparent: true,
        opacity: 0.35 + (i % 3 === 0 ? 0.25 : 0),
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      filamentMeshGroup.add(tubeMesh);
    }

    // =========================================================================
    // 3. ORBITAL RINGS & MECHANISMS (Multi-Speed Spatial Geometry)
    // =========================================================================
    const orbitalGroup = new THREE.Group();
    coreRoot.add(orbitalGroup);

    interface RingDef {
      mesh: THREE.Mesh;
      rotSpeedX: number;
      rotSpeedY: number;
      rotSpeedZ: number;
    }
    const orbitalRings: RingDef[] = [];

    // Ring 1: Inner Fast Crimson Orbit
    const ring1Geo = new THREE.TorusGeometry(1.15, 0.012, 8, 80);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: COLOR_BRIGHT_CORE,
      transparent: true,
      opacity: 0.65,
    });
    const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1Mesh.rotation.x = Math.PI / 3.5;
    orbitalGroup.add(ring1Mesh);
    orbitalRings.push({ mesh: ring1Mesh, rotSpeedX: 0.003, rotSpeedY: 0.006, rotSpeedZ: 0.002 });

    // Ring 2: Mid Cosmic Blue Segmented Ring
    const ring2Geo = new THREE.TorusGeometry(1.55, 0.014, 8, 90);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: COLOR_COSMIC_BLUE,
      transparent: true,
      opacity: 0.55,
      wireframe: true,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.y = Math.PI / 4;
    ring2Mesh.rotation.z = Math.PI / 6;
    orbitalGroup.add(ring2Mesh);
    orbitalRings.push({ mesh: ring2Mesh, rotSpeedX: -0.004, rotSpeedY: -0.002, rotSpeedZ: 0.003 });

    // Ring 3: Outer Horizon Trajectory Ring (Forward-facing Prediction Ring)
    const ring3Geo = new THREE.TorusGeometry(2.05, 0.01, 8, 100);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: COLOR_CYAN_ACCENT,
      transparent: true,
      opacity: 0.4,
    });
    const ring3Mesh = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3Mesh.rotation.x = -Math.PI / 5;
    ring3Mesh.rotation.y = Math.PI / 3;
    orbitalGroup.add(ring3Mesh);
    orbitalRings.push({ mesh: ring3Mesh, rotSpeedX: 0.002, rotSpeedY: -0.004, rotSpeedZ: -0.001 });

    // Ring 4: Large Tilted Equatorial Field Ring
    const ring4Geo = new THREE.TorusGeometry(2.45, 0.008, 6, 120);
    const ring4Mat = new THREE.MeshBasicMaterial({
      color: COLOR_DEEP_BLUE,
      transparent: true,
      opacity: 0.45,
    });
    const ring4Mesh = new THREE.Mesh(ring4Geo, ring4Mat);
    ring4Mesh.rotation.x = Math.PI / 2.2;
    orbitalGroup.add(ring4Mesh);
    orbitalRings.push({ mesh: ring4Mesh, rotSpeedX: 0.001, rotSpeedY: 0.002, rotSpeedZ: 0.004 });

    // =========================================================================
    // 4. VOLUMETRIC SYNAPTIC PARTICLES & COSMIC ENERGY FIELD
    // =========================================================================
    const particleCount = 450;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);
    const particleSpeeds = new Float32Array(particleCount);
    const particleOriginals = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      const radius = 0.45 + Math.pow(Math.random(), 1.6) * 2.3;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);

      const sinPhi = Math.sin(phi);
      const x = radius * sinPhi * Math.cos(theta);
      const y = radius * sinPhi * Math.sin(theta);
      const z = radius * Math.cos(phi);

      particlePositions[idx] = x;
      particlePositions[idx + 1] = y;
      particlePositions[idx + 2] = z;

      particleOriginals[idx] = x;
      particleOriginals[idx + 1] = y;
      particleOriginals[idx + 2] = z;

      particleSpeeds[i] = 0.2 + Math.random() * 0.8;
      particleScales[i] = 1.0 + Math.random() * 2.0;

      // Color selection (60% Crimson/Red, 35% Cosmic Blue, 5% Cyan/White)
      const rVal = Math.random();
      let c = COLOR_ENERGY_CRIMSON;
      if (rVal < 0.4) c = COLOR_BRIGHT_CORE;
      else if (rVal < 0.75) c = COLOR_COSMIC_BLUE;
      else if (rVal < 0.9) c = COLOR_CYAN_ACCENT;
      else c = COLOR_SOFT_WHITE;

      particleColors[idx] = c.r;
      particleColors[idx + 1] = c.g;
      particleColors[idx + 2] = c.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.038,
      vertexColors: true,
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    coreRoot.add(particleSystem);

    // =========================================================================
    // 5. SPATIAL INFORMATION NODES (8 Core Subsystems)
    // =========================================================================
    interface SubsystemNode {
      id: string;
      label: string;
      sub: string;
      color: THREE.Color;
      pos: THREE.Vector3;
      mesh: THREE.Mesh;
      glowMesh: THREE.Mesh;
      line: THREE.Line;
    }

    const subsystemDefs = [
      { id: 'memory', label: 'MEMORY', sub: `${memoriesCount} Vectors`, color: COLOR_ENERGY_CRIMSON, pos: new THREE.Vector3(-1.75, 1.1, 0.4) },
      { id: 'goals', label: 'GOALS', sub: `${goalsCount} Horizons`, color: COLOR_BRIGHT_CORE, pos: new THREE.Vector3(1.75, 1.15, 0.3) },
      { id: 'world', label: 'WORLD GNN', sub: 'Causal Graph', color: COLOR_COSMIC_BLUE, pos: new THREE.Vector3(-1.95, -0.7, 0.6) },
      { id: 'behavior', label: 'BEHAVIOR', sub: 'Focus & Rhythm', color: COLOR_ORANGE_CORE, pos: new THREE.Vector3(1.85, -0.75, 0.5) },
      { id: 'state', label: 'STATE 64D', sub: operationalState, color: COLOR_BRIGHT_CORE, pos: new THREE.Vector3(0, 1.85, -0.2) },
      { id: 'prediction', label: 'PREDICTION', sub: 'Horizon T+1', color: COLOR_CYAN_ACCENT, pos: new THREE.Vector3(0, -1.9, 0.4) },
      { id: 'cognition', label: 'COGNITION', sub: 'Multi-Hop AI', color: COLOR_COSMIC_BLUE, pos: new THREE.Vector3(-1.3, -1.4, -0.5) },
      { id: 'simulation', label: 'SIMULATION', sub: 'Future Lab', color: COLOR_CYAN_ACCENT, pos: new THREE.Vector3(1.35, -1.35, -0.4) },
    ];

    const nodesGroup = new THREE.Group();
    coreRoot.add(nodesGroup);

    const spatialNodes: SubsystemNode[] = subsystemDefs.map((def) => {
      // Node Core Sphere
      const nGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const nMat = new THREE.MeshBasicMaterial({ color: def.color });
      const nMesh = new THREE.Mesh(nGeo, nMat);
      nMesh.position.copy(def.pos);
      nodesGroup.add(nMesh);

      // Node Glow Halo
      const gGeo = new THREE.SphereGeometry(0.14, 16, 16);
      const gMat = new THREE.MeshBasicMaterial({
        color: def.color,
        transparent: true,
        opacity: 0.3,
        wireframe: true,
      });
      const gMesh = new THREE.Mesh(gGeo, gMat);
      gMesh.position.copy(def.pos);
      nodesGroup.add(gMesh);

      // Connection Filament to Core
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        def.pos,
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: def.color,
        transparent: true,
        opacity: 0.35,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      nodesGroup.add(line);

      return {
        id: def.id,
        label: def.label,
        sub: def.sub,
        color: def.color,
        pos: def.pos,
        mesh: nMesh,
        glowMesh: gMesh,
        line,
      };
    });

    // =========================================================================
    // 6. RAYCASTING & INTERACTION
    // =========================================================================
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);

    const handleMouseMove = (event: MouseEvent) => {
      if (!interactive) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Check hit against spatial node meshes
      const nodeMeshes = spatialNodes.map((n) => n.mesh);
      const intersects = raycaster.intersectObjects(nodeMeshes);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const hitNode = spatialNodes.find((n) => n.mesh === hitMesh);
        if (hitNode) {
          const vector = hitNode.pos.clone().project(camera);
          const screenX = (vector.x * 0.5 + 0.5) * rect.width;
          const screenY = (-(vector.y * 0.5) + 0.5) * rect.height;
          setHoveredNodeInfo({
            id: hitNode.id,
            label: `${hitNode.label} • ${hitNode.sub}`,
            x: screenX,
            y: screenY,
          });
          renderer.domElement.style.cursor = 'pointer';
          return;
        }
      }

      // Check hit against core nucleus
      const coreIntersects = raycaster.intersectObject(innerCoreMesh);
      if (coreIntersects.length > 0) {
        renderer.domElement.style.cursor = 'pointer';
        setHoveredNodeInfo({
          id: 'core',
          label: 'LATENT CORE • Click to Inspect Representation',
          x: rect.width / 2,
          y: rect.height / 2,
        });
        return;
      }

      renderer.domElement.style.cursor = 'default';
      setHoveredNodeInfo(null);
    };

    const handleClick = (_event: MouseEvent) => {
      if (!interactive) return;
      raycaster.setFromCamera(mouse, camera);

      const nodeMeshes = spatialNodes.map((n) => n.mesh);
      const intersects = raycaster.intersectObjects(nodeMeshes);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const hitNode = spatialNodes.find((n) => n.mesh === hitMesh);
        if (hitNode && onSubsystemClick) {
          onSubsystemClick(hitNode.id);
          return;
        }
      }

      const coreIntersects = raycaster.intersectObject(innerCoreMesh);
      if (coreIntersects.length > 0 && onCoreClick) {
        onCoreClick();
      }
    };

    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('click', handleClick);

    // =========================================================================
    // 7. ANIMATION LOOP (State-Driven Organic Evolution)
    // =========================================================================
    let animId: number;
    let clock = new THREE.Clock();

    const render = () => {
      const time = clock.getElapsedTime();

      // State Dynamics Modifiers
      let speedFactor = 1.0;
      let corePulseFreq = 2.0;
      let coreExpansion = 1.0;

      switch (operationalState) {
        case 'DEEP_FOCUS':
          speedFactor = 1.35;
          corePulseFreq = 3.2;
          coreExpansion = 0.88; // Concentrates energy inward
          break;
        case 'PROJECT_ACCELERATING':
          speedFactor = 1.5;
          corePulseFreq = 2.8;
          coreExpansion = 1.15; // Expands outward
          break;
        case 'GOAL_AT_RISK':
          speedFactor = 1.2;
          corePulseFreq = 4.0; // Rapid crimson alert pulse
          break;
        case 'RECOVERY':
          speedFactor = 0.65;
          corePulseFreq = 1.2;
          coreExpansion = 0.95;
          break;
        case 'IDLE':
          speedFactor = 0.5;
          corePulseFreq = 1.0;
          break;
        default:
          speedFactor = 1.0;
          corePulseFreq = 2.0;
      }

      // 1. Organic Breathing Motion for Nucleus
      const breath = 1.0 + Math.sin(time * corePulseFreq) * 0.08 * coreExpansion;
      innerCoreMesh.scale.set(breath, breath, breath);
      coronaMesh.scale.set(breath * 1.05, breath * 1.05, breath * 1.05);
      coronaMesh.rotation.y = time * 0.25 * speedFactor;
      coronaMesh.rotation.z = time * 0.15 * speedFactor;

      quantumShellMesh.scale.set(breath * 1.1, breath * 1.1, breath * 1.1);
      quantumShellMesh.rotation.x = -time * 0.3 * speedFactor;
      quantumShellMesh.rotation.y = time * 0.2 * speedFactor;

      // 2. Multi-speed Orbital Rings Rotation
      orbitalRings.forEach((r, idx) => {
        r.mesh.rotation.x += r.rotSpeedX * speedFactor;
        r.mesh.rotation.y += r.rotSpeedY * speedFactor;
        r.mesh.rotation.z += r.rotSpeedZ * speedFactor;

        // Subtle wobble
        r.mesh.position.y = Math.sin(time * 1.2 + idx) * 0.03;
      });

      // 3. Radial Neural Filaments Breathing & Gentle Sway
      filamentMeshGroup.rotation.y = time * 0.08 * speedFactor;
      filamentMeshGroup.rotation.x = Math.sin(time * 0.5) * 0.06;

      // 4. Particle Field Dynamics
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        const ox = particleOriginals[idx];
        const oy = particleOriginals[idx + 1];
        const oz = particleOriginals[idx + 2];
        const pSpeed = particleSpeeds[i] * speedFactor;

        // Radial orbit and pulse
        const angle = time * 0.3 * pSpeed + i;
        const radiusNoise = 1.0 + Math.sin(time * pSpeed * 2.0 + i) * 0.06;

        positions[idx] = (ox * Math.cos(angle * 0.2) - oz * Math.sin(angle * 0.2)) * radiusNoise;
        positions[idx + 1] = oy + Math.sin(time * pSpeed + i) * 0.05;
        positions[idx + 2] = (ox * Math.sin(angle * 0.2) + oz * Math.cos(angle * 0.2)) * radiusNoise;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // 5. Highlight Subsystems
      spatialNodes.forEach((node) => {
        const isHovered = hoveredSubsystem === node.id || hoveredNodeInfo?.id === node.id;
        const targetScale = isHovered ? 1.6 : 1.0 + Math.sin(time * 2.5 + node.pos.x) * 0.12;
        node.glowMesh.scale.set(targetScale, targetScale, targetScale);
        (node.line.material as THREE.LineBasicMaterial).opacity = isHovered ? 0.85 : 0.3;
      });

      // 6. Subtle Master Group Floating Motion
      coreRoot.position.y = Math.sin(time * 0.8) * 0.06;
      coreRoot.rotation.y = time * 0.04 * speedFactor;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(render);
    };

    render();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 400;
      const newH = container.clientHeight || 400;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('click', handleClick);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [operationalState, memoriesCount, goalsCount, tasksCount, hoveredSubsystem, interactive]);

  if (!webglSupported) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 rounded-3xl bg-[#04060C] border border-[#E51D48]/30 text-center ${className}`}>
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#8B0F24] via-[#E51D48] to-[#1E7BFF] animate-pulse mb-3" />
        <span className="text-xs font-mono text-[#FF365C] font-bold">NEURAL CORE ACTIVE</span>
        <span className="text-[11px] text-slate-400 mt-1">WebGL Fallback 2D Energy Representation</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className} select-none flex items-center justify-center`}>
      {/* ThreeJS WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Floating Tooltip for Interactive Node Hover */}
      {hoveredNodeInfo && (
        <div
          className="absolute z-20 pointer-events-none px-3 py-1.5 rounded-xl bg-[#070A12]/90 border border-[#E51D48]/40 shadow-xl shadow-red-950/40 backdrop-blur-xl transition-transform -translate-x-1/2 -translate-y-full text-[11px] font-mono text-white flex items-center gap-2"
          style={{ left: `${hoveredNodeInfo.x}px`, top: `${hoveredNodeInfo.y - 12}px` }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF365C] animate-pulse" />
          <span>{hoveredNodeInfo.label}</span>
        </div>
      )}

      {/* Ambient Radial Deep Glow Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none flex items-center justify-center">
        <div className="w-[85%] h-[85%] bg-gradient-radial from-[#E51D48]/12 via-[#123B73]/10 to-transparent rounded-full blur-[90px]" />
      </div>
    </div>
  );
};
