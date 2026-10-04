import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { AvatarConfig } from '../types';

interface ThreeAvatarCanvasProps {
  config: AvatarConfig;
  className?: string;
  enableOrbit?: boolean;
  showNodes?: boolean;
  nodeData?: {
    goalsCount?: number;
    memoriesCount?: number;
    habitsCount?: number;
    tasksCount?: number;
  };
  interactive?: boolean;
}

export const ThreeAvatarCanvas: React.FC<ThreeAvatarCanvasProps> = ({
  config,
  className = 'w-full h-full min-h-[300px]',
  showNodes = false,
  nodeData = { goalsCount: 0, memoriesCount: 0, habitsCount: 0, tasksCount: 0 },
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

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

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 360;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 4.2);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(2, 3, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.8);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    const warmLight = new THREE.DirectionalLight(0x818cf8, 1.5);
    warmLight.position.set(0, -2, 2);
    scene.add(warmLight);

    // Root avatar group
    const avatarGroup = new THREE.Group();
    scene.add(avatarGroup);

    // Colors from config
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
      metalness: 0.1,
    });

    const hairMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hairHex),
      roughness: 0.6,
      metalness: 0.15,
    });

    const outfitMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(outfitHex),
      roughness: 0.45,
      metalness: 0.2,
    });

    const eyeWhiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.05,
    });

    const eyeIrisMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.1,
      metalness: 0.6,
    });

    const glassFrameMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.8,
    });

    const glassLensMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.9,
      ior: 1.5,
    });

    // 5. Build Head & Face
    const headGroup = new THREE.Group();
    avatarGroup.add(headGroup);

    // Head Base Sphere
    const headGeometry = new THREE.SphereGeometry(0.55, 32, 32);
    headGeometry.scale(1.0, 1.15, 0.98);
    const headMesh = new THREE.Mesh(headGeometry, skinMaterial);
    headMesh.position.y = 0.55;
    headGroup.add(headMesh);

    // Neck
    const neckGeometry = new THREE.CylinderGeometry(0.2, 0.23, 0.3, 24);
    const neckMesh = new THREE.Mesh(neckGeometry, skinMaterial);
    neckMesh.position.y = -0.05;
    avatarGroup.add(neckMesh);

    // Eyes
    const createEye = (xPos: number) => {
      const eyeG = new THREE.Group();
      eyeG.position.set(xPos, 0.62, 0.45);

      const whiteGeo = new THREE.SphereGeometry(0.085, 20, 20);
      whiteGeo.scale(1.0, 0.65, 0.5);
      const whiteMesh = new THREE.Mesh(whiteGeo, eyeWhiteMaterial);
      eyeG.add(whiteMesh);

      const irisGeo = new THREE.SphereGeometry(0.045, 16, 16);
      irisGeo.scale(1.0, 1.0, 0.3);
      const irisMesh = new THREE.Mesh(irisGeo, eyeIrisMaterial);
      irisMesh.position.z = 0.035;
      eyeG.add(irisMesh);

      return eyeG;
    };

    headGroup.add(createEye(-0.18));
    headGroup.add(createEye(0.18));

    // Nose
    const noseGeo = new THREE.ConeGeometry(0.045, 0.12, 16);
    noseGeo.rotateX(Math.PI / 8);
    const noseMesh = new THREE.Mesh(noseGeo, skinMaterial);
    noseMesh.position.set(0, 0.52, 0.52);
    headGroup.add(noseMesh);

    // Mouth / Smile
    const mouthGeo = new THREE.TorusGeometry(0.09, 0.018, 12, 16, Math.PI * 0.7);
    mouthGeo.rotateZ(Math.PI * 1.15);
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0x9f1239, roughness: 0.5 });
    const mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
    mouthMesh.position.set(0, 0.38, 0.48);
    headGroup.add(mouthMesh);

    // Hair Geometries
    const hairStyle = config.hair_style || 'short_clean';
    const hairGroup = new THREE.Group();
    headGroup.add(hairGroup);

    if (hairStyle === 'long_wavy') {
      const topHair = new THREE.Mesh(new THREE.SphereGeometry(0.6, 24, 24), hairMaterial);
      topHair.position.set(0, 0.72, -0.05);
      topHair.scale.set(1.04, 1.02, 1.05);
      hairGroup.add(topHair);

      const leftWave = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.9, 16), hairMaterial);
      leftWave.position.set(-0.48, 0.25, 0.02);
      leftWave.rotation.z = 0.15;
      hairGroup.add(leftWave);

      const rightWave = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.9, 16), hairMaterial);
      rightWave.position.set(0.48, 0.25, 0.02);
      rightWave.rotation.z = -0.15;
      hairGroup.add(rightWave);
    } else if (hairStyle === 'curly') {
      const curlsCount = 18;
      for (let i = 0; i < curlsCount; i++) {
        const phi = Math.acos(-1 + (2 * i) / curlsCount);
        const theta = Math.sqrt(curlsCount * Math.PI) * phi;
        const curlMesh = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), hairMaterial);
        const r = 0.56;
        curlMesh.position.set(
          r * Math.cos(theta) * Math.sin(phi),
          0.62 + r * Math.cos(phi) * 0.7,
          r * Math.sin(theta) * Math.sin(phi) * 0.9
        );
        hairGroup.add(curlMesh);
      }
    } else if (hairStyle === 'buzz' || hairStyle === 'clean') {
      const buzzHair = new THREE.Mesh(new THREE.SphereGeometry(0.58, 24, 24), hairMaterial);
      buzzHair.position.set(0, 0.65, -0.02);
      buzzHair.scale.set(1.02, 1.06, 1.02);
      hairGroup.add(buzzHair);
    } else {
      // Default: short_clean / styled
      const topCap = new THREE.Mesh(new THREE.SphereGeometry(0.59, 24, 24), hairMaterial);
      topCap.position.set(0, 0.7, -0.05);
      topCap.scale.set(1.03, 1.05, 1.04);
      hairGroup.add(topCap);

      const swoop = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.3), hairMaterial);
      swoop.position.set(0.08, 0.95, 0.32);
      swoop.rotation.set(-0.3, 0.15, -0.1);
      hairGroup.add(swoop);
    }

    // Glasses / Eyewear
    if (config.glasses && config.glasses !== 'none') {
      const glassesGroup = new THREE.Group();
      glassesGroup.position.set(0, 0.62, 0.46);

      const makeRim = (xPos: number) => {
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.015, 12, 24), glassFrameMaterial);
        rim.position.x = xPos;
        const lens = new THREE.Mesh(new THREE.CircleGeometry(0.11, 20), glassLensMaterial);
        lens.position.x = xPos;
        glassesGroup.add(rim);
        glassesGroup.add(lens);
      };

      makeRim(-0.2);
      makeRim(0.2);

      const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 8), glassFrameMaterial);
      bridge.rotation.z = Math.PI / 2;
      glassesGroup.add(bridge);

      headGroup.add(glassesGroup);
    }

    // 6. Torso & Shoulders
    const torsoGroup = new THREE.Group();
    avatarGroup.add(torsoGroup);

    const torsoGeo = new THREE.CylinderGeometry(0.38, 0.52, 0.9, 32);
    torsoGeo.scale(1.3, 1.0, 0.7);
    const torsoMesh = new THREE.Mesh(torsoGeo, outfitMaterial);
    torsoMesh.position.y = -0.65;
    torsoGroup.add(torsoMesh);

    // Collar detail
    const collarGeo = new THREE.TorusGeometry(0.26, 0.04, 12, 24);
    collarGeo.rotateX(Math.PI / 2);
    const collarMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(outfitHex).offsetHSL(0, 0, 0.1),
      roughness: 0.4,
    });
    const collarMesh = new THREE.Mesh(collarGeo, collarMat);
    collarMesh.position.set(0, -0.22, 0);
    torsoGroup.add(collarMesh);

    // 7. Aura Ring & Ambient Particles
    const auraGroup = new THREE.Group();
    scene.add(auraGroup);

    // Glowing Halo Ring
    const ringGeo = new THREE.TorusGeometry(1.4, 0.02, 16, 64);
    ringGeo.rotateX(Math.PI / 2.3);
    const ringMat = new THREE.MeshBasicMaterial({
      color: auraHex,
      transparent: true,
      opacity: 0.55,
      wireframe: false,
    });
    const haloRing = new THREE.Mesh(ringGeo, ringMat);
    haloRing.position.set(0, 0.1, 0);
    auraGroup.add(haloRing);

    // Outer faint glow ring
    const outerRingGeo = new THREE.TorusGeometry(1.7, 0.01, 16, 64);
    outerRingGeo.rotateX(Math.PI / 2.1);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: auraHex,
      transparent: true,
      opacity: 0.25,
    });
    const outerHalo = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerHalo.position.set(0, 0.1, 0);
    auraGroup.add(outerHalo);

    // Ambient floating particles
    const particleCount = 35;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 3.5;
      particlePositions[i + 1] = (Math.random() - 0.5) * 3.0 + 0.2;
      particlePositions[i + 2] = (Math.random() - 0.5) * 2.5;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: auraHex,
      size: 0.035,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 8. Surrounding Real Entity Nodes (Goals, Memories, Habits, Tasks)
    const nodesGroup = new THREE.Group();
    if (showNodes) {
      scene.add(nodesGroup);

      const createNodeMesh = (color: number, angle: number, dist: number, yOffset: number) => {
        const nodeG = new THREE.Group();
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        nodeG.position.set(x, yOffset, z);

        const sphereGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const sphereMat = new THREE.MeshStandardMaterial({
          color: color,
          emissive: color,
          emissiveIntensity: 0.4,
          roughness: 0.3,
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        nodeG.add(sphere);

        // Connector line to center
        const lineMat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.35 });
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(-x * 0.8, -yOffset + 0.2, -z * 0.8),
        ]);
        const line = new THREE.Line(lineGeo, lineMat);
        nodeG.add(line);

        return nodeG;
      };

      if ((nodeData.goalsCount || 0) > 0) {
        nodesGroup.add(createNodeMesh(0x38bdf8, 0.4, 1.8, 0.8));
      }
      if ((nodeData.memoriesCount || 0) > 0) {
        nodesGroup.add(createNodeMesh(0xa855f7, 2.2, 1.7, 0.4));
      }
      if ((nodeData.habitsCount || 0) > 0) {
        nodesGroup.add(createNodeMesh(0x10b981, 3.8, 1.75, -0.2));
      }
      if ((nodeData.tasksCount || 0) > 0) {
        nodesGroup.add(createNodeMesh(0xf59e0b, 5.2, 1.8, 0.3));
      }
    }

    // 9. Interactive Mouse Sway
    let targetRotY = 0;
    let targetRotX = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
      const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = mouseX * 0.6;
      targetRotX = mouseY * 0.3;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // 10. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Subtle idle breathing
      const breath = Math.sin(elapsedTime * 1.5) * 0.02;
      headGroup.position.y = breath * 0.5;
      headGroup.rotation.z = Math.sin(elapsedTime * 0.8) * 0.015;
      torsoGroup.scale.set(1.3 + breath * 0.3, 1.0 + breath * 0.2, 0.7);

      // Smooth mouse follow / camera rotation
      avatarGroup.rotation.y += (targetRotY - avatarGroup.rotation.y) * 0.05;
      avatarGroup.rotation.x += (targetRotX - avatarGroup.rotation.x) * 0.05;

      // Aura and ring rotation
      haloRing.rotation.z = elapsedTime * 0.15;
      outerHalo.rotation.z = -elapsedTime * 0.1;
      particleSystem.rotation.y = elapsedTime * 0.04;

      if (showNodes) {
        nodesGroup.rotation.y = Math.sin(elapsedTime * 0.25) * 0.2;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 11. Handle Resizing
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || 360;
      const newHeight = container.clientHeight || 360;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // 12. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [config, showNodes, nodeData.goalsCount, nodeData.memoriesCount, nodeData.habitsCount, nodeData.tasksCount]);

  if (!webglSupported) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 bg-slate-900/60 rounded-3xl border border-slate-800 ${className}`}>
        <div className="w-32 h-32 rounded-full border-2 border-cyan-500/30 flex items-center justify-center bg-cyan-950/20 text-cyan-400 font-mono text-xs">
          2D AVATAR MODE
        </div>
        <p className="text-xs text-slate-500 mt-3">WebGL unavailable · Using lightweight fallback</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center select-none overflow-hidden cursor-grab active:cursor-grabbing ${className}`}
      style={{ touchAction: 'none' }}
    />
  );
};
