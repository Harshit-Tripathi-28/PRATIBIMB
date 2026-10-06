import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Database, Target, Share2, Sliders } from 'lucide-react';
import type { DigitalTwin, LatentStateVector } from '../types';

interface SemanticClusterAnchor {
  id: string;
  label: string;
  count: string;
  position: [number, number, number];
  color: string;
  tabTarget: string;
  icon: React.ElementType;
}

interface NeuralSpatialEnvironmentProps {
  twin: DigitalTwin;
  latentState?: LatentStateVector | null;
  onNavigateTab: (tab: string, initialPrompt?: string) => void;
  onInspectTwin?: () => void;
  isHoveredFromParent?: boolean;
  onHoverTwinChange?: (hovered: boolean) => void;
  className?: string;
}

export const NeuralSpatialEnvironment: React.FC<NeuralSpatialEnvironmentProps> = ({
  twin,
  latentState,
  onNavigateTab,
  onInspectTwin,
  className = 'w-full h-full',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [projectedClusters, setProjectedClusters] = useState<
    Array<{
      cluster: SemanticClusterAnchor;
      screenX: number;
      screenY: number;
      visible: boolean;
    }>
  >([]);
  const [hoveredClusterId, setHoveredClusterId] = useState<string | null>(null);
  const hoveredClusterRef = useRef<string | null>(null);

  useEffect(() => {
    hoveredClusterRef.current = hoveredClusterId;
  }, [hoveredClusterId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // =========================================================================
    // 1. SCENE & CAMERA (Vertical safe headroom: camera framed to preserve top space)
    // =========================================================================
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05050a, 0.05);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.04, 4.05);

    // =========================================================================
    // 2. RENDERER
    // =========================================================================
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // =========================================================================
    // 3. CINEMATIC LIGHTING (Electric Indigo, Magenta, Cyan)
    // =========================================================================
    const ambientLight = new THREE.AmbientLight(0x0a0818, 2.6);
    scene.add(ambientLight);

    const magentaLight = new THREE.PointLight(0xc33cff, 4.5, 10);
    magentaLight.position.set(-1.6, 1.2, 2.4);
    scene.add(magentaLight);

    const cyanLight = new THREE.PointLight(0x22d3ee, 4.0, 9);
    cyanLight.position.set(1.6, 0.9, 2.6);
    scene.add(cyanLight);

    const indigoRearLight = new THREE.PointLight(0x6c4dff, 5.5, 12);
    indigoRearLight.position.set(0, 0.2, -2.5);
    scene.add(indigoRearLight);

    const coreLight = new THREE.PointLight(0xffffff, 2.0, 5);
    coreLight.position.set(0, 0.0, 0.8);
    scene.add(coreLight);

    // =========================================================================
    // 4. AMBIENT BACKGROUND PARTICLES
    // =========================================================================
    const bgParticleCount = 750;
    const bgParticleGeo = new THREE.BufferGeometry();
    const bgPositions = new Float32Array(bgParticleCount * 3);
    const bgColors = new Float32Array(bgParticleCount * 3);

    for (let i = 0; i < bgParticleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2.0 * Math.random() - 1.0);
      const r = 1.6 + Math.random() * 3.2;

      bgPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      bgPositions[i * 3 + 1] = r * Math.cos(phi) * 0.8;
      bgPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) * 0.7 - 0.5;

      const pick = Math.random();
      const col = pick > 0.6 ? new THREE.Color(0xc33cff) : pick > 0.3 ? new THREE.Color(0x6c4dff) : new THREE.Color(0x22d3ee);
      const fade = Math.random() * 0.22 + 0.04;

      bgColors[i * 3] = col.r * fade;
      bgColors[i * 3 + 1] = col.g * fade;
      bgColors[i * 3 + 2] = col.b * fade;
    }

    bgParticleGeo.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));
    bgParticleGeo.setAttribute('color', new THREE.BufferAttribute(bgColors, 3));

    const bgMat = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const bgParticles = new THREE.Points(bgParticleGeo, bgMat);
    scene.add(bgParticles);

    // =========================================================================
    // 5. HERO DIGITAL TWIN: SCULPTED VOLUMETRIC HOLOGRAPHIC BUST (6,200 Particles)
    // Vertically placed at y = -0.32 to provide ~60px breathing room from header
    // =========================================================================
    const twinGroup = new THREE.Group();
    twinGroup.position.set(0, -0.32, 0);
    scene.add(twinGroup);

    const twinParticleCount = 6200;
    const twinParticleGeo = new THREE.BufferGeometry();
    const twinPositions = new Float32Array(twinParticleCount * 3);
    const twinOrigPositions = new Float32Array(twinParticleCount * 3);
    const twinColors = new Float32Array(twinParticleCount * 3);
    const twinZones = new Float32Array(twinParticleCount); // 1: head, 2: neck, 3: chest/core, 4: arms, 5: aura

    const colMagenta = new THREE.Color(0xc33cff);
    const colIndigo = new THREE.Color(0x6c4dff);
    const colCyan = new THREE.Color(0x22d3ee);
    const colWhite = new THREE.Color(0xf5f7ff);
    const colAmber = new THREE.Color(0xf59e0b);

    const operationalState = twin.state.operational_state || 'ACTIVE';
    const isGoalAtRisk = operationalState === 'GOAL_AT_RISK';
    const isDeepFocus = operationalState === 'DEEP_FOCUS';

    for (let i = 0; i < twinParticleCount; i++) {
      let x = 0, y = 0, z = 0;
      const zone = Math.random();
      let pColor = colIndigo;

      if (zone < 0.38) {
        // 1. Head, Cranium & Defined Facial Contour (Sculpted Facial Planes)
        twinZones[i] = 1;
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = Math.cbrt(Math.random()) * 0.42;
        const sinPhi = Math.sin(phi);

        x = r * sinPhi * Math.cos(theta) * 0.82;
        y = 1.12 + r * Math.cos(phi) * 1.04;
        z = r * sinPhi * Math.sin(theta) * 0.85;

        // Distinct Facial Planes (Forehead, cheekbones, jawline, chin)
        if (z > 0.05 && Math.abs(x) < 0.24 && y > 0.82 && y < 1.32) {
          // Jaw tapering
          if (y < 0.98) {
            x *= 0.82;
          }
          z *= 0.92;
          pColor = Math.random() > 0.35 ? colWhite : (Math.random() > 0.5 ? colCyan : colMagenta);
        } else {
          pColor = Math.random() > 0.4 ? colMagenta : (Math.random() > 0.5 ? colIndigo : colCyan);
        }
      } else if (zone < 0.48) {
        // 2. Cervical Neck & Spinal Column Transition
        twinZones[i] = 2;
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * 0.14;
        x = Math.cos(angle) * r;
        y = 0.65 + Math.random() * 0.26;
        z = Math.sin(angle) * r;
        pColor = Math.random() > 0.4 ? colMagenta : colCyan;
      } else if (zone < 0.84) {
        // 3. Clavicles, Athletic Shoulders, Dense Ribcage & Consciousness Core
        twinZones[i] = 3;
        const yNorm = Math.random();
        const shoulderWidth = 0.94 * (0.6 + yNorm * 0.45);
        const depth = 0.38 * (0.55 + yNorm * 0.45);
        const angle = Math.random() * Math.PI * 2;
        const r = Math.cbrt(Math.random());

        x = Math.cos(angle) * r * shoulderWidth * 0.78;
        y = -0.4 + yNorm * 1.05;
        z = Math.sin(angle) * r * depth * 0.78;

        if (Math.abs(x) < 0.20 && y > 0.05 && y < 0.52) {
          pColor = isGoalAtRisk
            ? colAmber
            : isDeepFocus
            ? (Math.random() > 0.3 ? colMagenta : colCyan)
            : (Math.random() > 0.35 ? colWhite : colCyan);
        } else {
          pColor = Math.random() > 0.5 ? colIndigo : (Math.random() > 0.5 ? colMagenta : colCyan);
        }
      } else if (zone < 0.94) {
        // 4. Arms & Forearm Streams
        twinZones[i] = 4;
        const side = Math.random() > 0.5 ? 1 : -1;
        const armProg = Math.random();
        const spread = 0.62 + armProg * 0.22;
        const armR = (1 - armProg * 0.3) * 0.11;
        const angle = Math.random() * Math.PI * 2;

        x = side * (spread + Math.cos(angle) * armR);
        y = 0.58 - armProg * 1.05;
        z = Math.sin(angle) * armR;
        pColor = Math.random() > 0.6 ? colIndigo : colMagenta;
      } else {
        // 5. Ambient Luminous Aura
        twinZones[i] = 5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2.0 * Math.random() - 1.0);
        const r = 0.65 + Math.random() * 0.8;
        x = r * Math.sin(phi) * Math.cos(theta);
        y = 0.4 + r * Math.cos(phi) * 0.78;
        z = r * Math.sin(phi) * Math.sin(theta) * 0.55;
        pColor = Math.random() > 0.5 ? colCyan : colMagenta;
      }

      twinPositions[i * 3] = x;
      twinPositions[i * 3 + 1] = y;
      twinPositions[i * 3 + 2] = z;
      twinOrigPositions[i * 3] = x;
      twinOrigPositions[i * 3 + 1] = y;
      twinOrigPositions[i * 3 + 2] = z;

      twinColors[i * 3] = pColor.r;
      twinColors[i * 3 + 1] = pColor.g;
      twinColors[i * 3 + 2] = pColor.b;
    }

    twinParticleGeo.setAttribute('position', new THREE.BufferAttribute(twinPositions, 3));
    twinParticleGeo.setAttribute('color', new THREE.BufferAttribute(twinColors, 3));

    // Glow Texture for particles
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.25, 'rgba(195,60,255,0.95)');
      grad.addColorStop(0.6, 'rgba(108,77,255,0.4)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(pCanvas);

    const twinMat = new THREE.PointsMaterial({
      size: 0.052,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.94,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const twinMesh = new THREE.Points(twinParticleGeo, twinMat);
    twinGroup.add(twinMesh);

    // =========================================================================
    // 6. EMBEDDED INTERNAL CONSCIOUSNESS CORE (Soft, integrated into torso)
    // =========================================================================
    const coreGeo = new THREE.SphereGeometry(0.14, 20, 20);
    const coreMat = new THREE.MeshBasicMaterial({
      color: isGoalAtRisk ? 0xf59e0b : 0xc33cff,
      transparent: true,
      opacity: 0.24,
      blending: THREE.AdditiveBlending,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(0, 0.20, 0.02);
    twinGroup.add(coreMesh);

    // Subtle Outer Hologram Shell
    const shellGeo = new THREE.SphereGeometry(0.46, 20, 20);
    const shellMat = new THREE.MeshBasicMaterial({
      color: 0x6c4dff,
      wireframe: true,
      transparent: true,
      opacity: 0.06,
      blending: THREE.AdditiveBlending,
    });
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    shellMesh.position.set(0, 1.12, 0);
    twinGroup.add(shellMesh);

    // =========================================================================
    // 7. SEMANTIC CLUSTERS ANCHORS (Safe Spatial Coordinates within Center Zone)
    // =========================================================================
    const clusters: SemanticClusterAnchor[] = [
      {
        id: 'memory',
        label: 'Memory Vault',
        count: `${twin.memories.length}`,
        position: [-0.68, 1.15, 0.2], // Top-Left with safe headroom
        color: '#c33cff',
        tabTarget: 'memory',
        icon: Database,
      },
      {
        id: 'goals',
        label: 'Goal Trajectory',
        count: `${twin.goals.length}`,
        position: [0.68, 1.15, 0.2], // Top-Right with safe headroom
        color: '#22d3ee',
        tabTarget: 'goals',
        icon: Target,
      },
      {
        id: 'world',
        label: 'World Model',
        count: `${latentState?.dominant_cluster || 'GNN'}`,
        position: [-0.74, -0.52, 0.2], // Bottom-Left
        color: '#6c4dff',
        tabTarget: 'lifegraph',
        icon: Share2,
      },
      {
        id: 'simulation',
        label: 'Simulation Lab',
        count: 'What-If',
        position: [0.74, -0.52, 0.2], // Bottom-Right
        color: '#f59e0b',
        tabTarget: 'simulation',
        icon: Sliders,
      },
    ];

    // =========================================================================
    // 8. ANIMATION & RENDER LOOP (Responsive to State & Chip Hover)
    // =========================================================================
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentHover = hoveredClusterRef.current;

      // Subtle breathing motion based on state
      const breathSpeed = operationalState === 'DEEP_FOCUS' ? 1.7 : operationalState === 'RECOVERY' ? 0.9 : 1.3;
      const breath = Math.sin(time * breathSpeed) * 0.016;
      twinGroup.position.y = -0.32 + breath;
      twinGroup.rotation.y = Math.sin(time * 0.35) * 0.07;

      // Internal consciousness core pulse
      const coreSpeed = currentHover === 'simulation' ? 3.8 : 2.2;
      const coreScale = 1.0 + Math.sin(time * coreSpeed) * 0.14;
      coreMesh.scale.set(coreScale, coreScale, coreScale);
      coreMat.opacity = 0.22 + Math.sin(time * coreSpeed) * 0.12;

      // Outer head shell slow spin
      shellMesh.rotation.y = time * 0.12;

      // Interactive Particle Reactivity on Hover
      const colors = twinParticleGeo.attributes.color.array as Float32Array;
      if (currentHover) {
        for (let i = 0; i < twinParticleCount; i++) {
          const zone = twinZones[i];
          let boost = 1.0;

          if (currentHover === 'memory' && zone === 1) {
            boost = 1.35 + Math.sin(time * 4.0) * 0.25; // Highlight head cranium
            colors[i * 3] = Math.min(1.0, colMagenta.r * boost);
            colors[i * 3 + 1] = Math.min(1.0, colMagenta.g * boost);
            colors[i * 3 + 2] = Math.min(1.0, colMagenta.b * boost);
          } else if (currentHover === 'goals' && zone === 3) {
            boost = 1.35 + Math.sin(time * 4.0) * 0.25; // Highlight chest trajectory
            colors[i * 3] = Math.min(1.0, colCyan.r * boost);
            colors[i * 3 + 1] = Math.min(1.0, colCyan.g * boost);
            colors[i * 3 + 2] = Math.min(1.0, colCyan.b * boost);
          } else if (currentHover === 'world' && (zone === 2 || zone === 5)) {
            boost = 1.3 + Math.sin(time * 3.5) * 0.25; // Highlight spinal/aura network
            colors[i * 3] = Math.min(1.0, colIndigo.r * boost);
            colors[i * 3 + 1] = Math.min(1.0, colIndigo.g * boost);
            colors[i * 3 + 2] = Math.min(1.0, colIndigo.b * boost);
          }
        }
        twinParticleGeo.attributes.color.needsUpdate = true;
      }

      // Background particle drift
      bgParticles.rotation.y = time * 0.02;

      // Project Semantic Clusters to screen space
      const projected = clusters.map((cluster) => {
        const vec = new THREE.Vector3(...cluster.position);
        vec.project(camera);

        const screenX = ((vec.x + 1) * width) / 2;
        const screenY = ((-vec.y + 1) * height) / 2;
        const visible = vec.z < 1.0;

        return {
          cluster,
          screenX,
          screenY,
          visible,
        };
      });
      setProjectedClusters(projected);

      renderer.render(scene, camera);
    };

    animate();

    // =========================================================================
    // 9. RESIZE HANDLER
    // =========================================================================
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      twinParticleGeo.dispose();
      twinMat.dispose();
      bgParticleGeo.dispose();
      bgMat.dispose();
      particleTexture.dispose();
    };
  }, [twin, latentState]);

  return (
    <div
      ref={containerRef}
      onClick={onInspectTwin}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Projected Semantic Floating Chips */}
      {projectedClusters.map(({ cluster, screenX, screenY, visible }) => {
        if (!visible) return null;
        const isHovered = hoveredClusterId === cluster.id;
        const Icon = cluster.icon;

        return (
          <div
            key={cluster.id}
            onClick={(e) => {
              e.stopPropagation();
              onNavigateTab(cluster.tabTarget);
            }}
            onMouseEnter={() => setHoveredClusterId(cluster.id)}
            onMouseLeave={() => setHoveredClusterId(null)}
            style={{
              transform: `translate(${screenX}px, ${screenY}px) translate(-50%, -50%)`,
            }}
            className="absolute top-0 left-0 pointer-events-auto cursor-pointer z-30 transition-all duration-300 select-none group"
          >
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#0c0a1a]/90 hover:bg-[#161033] border transition-all duration-300 shadow-2xl backdrop-blur-2xl ${
                isHovered
                  ? 'border-violet-400 scale-110 shadow-violet-500/25 ring-1 ring-violet-500/30'
                  : 'border-white/10 hover:border-violet-500/50'
              }`}
            >
              <div
                className="w-6 h-6 rounded-xl flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: `${cluster.color}25` }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: cluster.color }} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-medium text-slate-200 group-hover:text-white transition-colors leading-tight">
                  {cluster.label}
                </span>
                <span className="text-[9px] font-mono text-violet-300 font-semibold leading-tight">
                  {cluster.count}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
