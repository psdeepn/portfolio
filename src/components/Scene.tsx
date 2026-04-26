/* eslint-disable react-hooks/purity, @typescript-eslint/no-explicit-any */
import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sparkles, Float, MeshDistortMaterial, Environment, Stars, useScroll, Html, Text, Trail } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Noise, DepthOfField, Glitch } from '@react-three/postprocessing';
import { BlendFunction, GlitchMode } from 'postprocessing';
import { Physics, RigidBody, BallCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { sounds } from '../utils/soundEffects';
import { switchSection, initMusic } from '../utils/proceduralMusic';
import { usePersona } from '../context/PersonaContext';
import { useRecruiter } from '../context/RecruiterContext';
import SkillConstellation from './SkillConstellation';
import GitHubHeatmap from './GitHubHeatmap';
import WarpPortal from './WarpPortal';
import GhostCursors from './GhostCursors';
import MiniGame from './MiniGame';

const PROJECTS_DATA = [
  {
    title: 'Project Alpha: Haleon XR',
    subtitle: 'Enterprise Immersive Training',
    description: 'Architected a scalable Unity VR training simulation bridging physical hardware with digital twins.',
    tech: ['Unity', 'C#', 'Oculus SDK']
  },
  {
    title: 'Project Beta: Nexus AI',
    subtitle: 'Intelligent Retail Assistant',
    description: 'Integrated state-of-the-art LLMs into an Unreal Engine environment for real-time customer interaction.',
    tech: ['Unreal Engine', 'Python', 'OpenAI']
  },
  {
    title: 'Project Gamma: Void Canvas',
    subtitle: 'AAA WebGL Architecture',
    description: 'Built a high-performance, scroll-driven cinematic WebXR experience with custom shaders and procedural audio.',
    tech: ['React Three Fiber', 'WebGL', 'TypeScript']
  }
];

export default function Scene() {
  const { personaConfig } = usePersona();
  const { isRecruiter } = useRecruiter();
  const state = useThree();
  const scroll = useScroll();

  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const cameraGroupRef = useRef<THREE.Group>(null);
  const starsRef = useRef<THREE.Points>(null);

  // Interaction States
  const [coreHovered, setCoreHovered] = useState(false);
  const [coreClicked, setCoreClicked] = useState(false);
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [currentSection, setCurrentSection] = useState('hero');

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [stratagemActive, setStratagemActive] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  const [isGameMode, setIsGameMode] = useState(false);

  const coreScale = useRef(1);
  const coreDistort = useRef(0.4);
  const lastPointer = useRef({ x: 0, y: 0 });
  const fogDensity = useRef(0.012);

  // Initialize music on first mount or interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      initMusic();
      window.removeEventListener('click', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    return () => window.removeEventListener('click', handleFirstInteraction);
  }, []);

  useEffect(() => {
    switchSection(currentSection);
  }, [currentSection]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);

    const sequence: string[] = [];
    const target = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowDown', 'ArrowDown'];
    
    const handleKeyDown = (e: KeyboardEvent) => {
      sequence.push(e.key);
      if (sequence.length > target.length) sequence.shift();
      if (sequence.join(',') === target.join(',')) {
        setStratagemActive(true);
        sounds.init();
        sounds.playExplosionSound();
        // Change body class for UI
        document.body.classList.add('stratagem-active');
        setTimeout(() => {
          setStratagemActive(false);
          document.body.classList.remove('stratagem-active');
        }, 5000);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleWarp = () => {
      setIsWarping(true);
      setTimeout(() => setIsWarping(false), 1500); // Warp duration
    };
    window.addEventListener('hyper-jump', handleWarp);

    const handleMiniGameToggle = () => setIsGameMode(true);
    window.addEventListener('toggle-minigame', handleMiniGameToggle);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hyper-jump', handleWarp);
      window.removeEventListener('toggle-minigame', handleMiniGameToggle);
    };
  }, []);

  // Animate interactions

  const handleCoreClick = () => {
    sounds.init();
    sounds.playClickSound();
    setCoreClicked(true);
    setTimeout(() => setCoreClicked(false), 500);
  };

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Smooth interpolations for Core
    const targetCoreScale = coreClicked ? 1.5 : (coreHovered ? 1.2 : 1);
    const targetCoreDistort = coreClicked ? 1.0 : (coreHovered ? 0.6 : 0.4);
    coreScale.current = THREE.MathUtils.lerp(coreScale.current, targetCoreScale, 0.1);
    coreDistort.current = THREE.MathUtils.lerp(coreDistort.current, targetCoreDistort, 0.1);

    if (coreRef.current) {
      coreRef.current.rotation.x = Math.sin(t / 4) / 2;
      coreRef.current.rotation.y = t * 0.2;
      coreRef.current.scale.setScalar(coreScale.current);
      // Update distort uniform
      (coreRef.current.material as any).distort = coreDistort.current;
    }
    
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.1;
      ringRef.current.rotation.x = Math.cos(t / 2) * 0.1;
      ringRef.current.scale.setScalar(coreHovered ? 1.1 : 1);
    }
    
    // Scroll-based camera Z-axis flying
    const targetZ = -scroll.offset * 60;
    const scrollDelta = scroll.delta; // Speed of scrolling
    sounds.updateDroneFilter(scrollDelta);

    // Determine current section
    const numSections = personaConfig ? personaConfig.sectionOrder.length : 5;
    const sectionIndex = Math.min(Math.floor(scroll.offset * numSections), numSections - 1);
    const newSection = personaConfig ? personaConfig.sectionOrder[sectionIndex] : ['hero', 'skills', 'experience', 'projects', 'contact'][sectionIndex];
    if (newSection !== currentSection) {
      setCurrentSection(newSection);
    }

    // Cursor-reactive fog
    const dx = state.pointer.x - lastPointer.current.x;
    const dy = state.pointer.y - lastPointer.current.y;
    const pointerSpeed = Math.hypot(dx, dy);
    lastPointer.current = { x: state.pointer.x, y: state.pointer.y };

    fogDensity.current = THREE.MathUtils.lerp(fogDensity.current, 0.012 + pointerSpeed * 0.04, 0.1);
    if (state.scene.fog instanceof THREE.FogExp2) {
      state.scene.fog.density = fogDensity.current;
      const targetColorMap: Record<string, string> = {
        hero: '#0a0a2e',
        skills: '#001a33',
        experience: '#1a0d00',
        projects: '#0d2137',
        contact: '#0d001a',
        'fit-score': '#0d2137'
      };
      const targetColorHex = targetColorMap[currentSection] || '#0a0a2e';
      const targetColor = new THREE.Color(targetColorHex);
      state.scene.fog.color.lerp(targetColor, 0.02);
    }
    
    if (cameraGroupRef.current) {
      cameraGroupRef.current.position.z = THREE.MathUtils.lerp(
        cameraGroupRef.current.position.z, 
        targetZ, 
        0.05
      );
      
      // Add pointer sway to the camera group, pulled towards center if hovering
      const targetX = coreHovered ? 0 : (state.pointer.x * Math.PI) / 10;
      const targetY = coreHovered ? 0 : (state.pointer.y * Math.PI) / 10;
      
      cameraGroupRef.current.position.x = THREE.MathUtils.lerp(cameraGroupRef.current.position.x, targetX, 0.05);
      cameraGroupRef.current.position.y = THREE.MathUtils.lerp(cameraGroupRef.current.position.y, targetY, 0.05);
    }

    // Warp Speed effect on Stars based on scrollDelta
    if (starsRef.current) {
      // Scale Z of stars to simulate stretching
      const targetZScale = 1 + scrollDelta * 200; 
      starsRef.current.scale.z = THREE.MathUtils.lerp(starsRef.current.scale.z, targetZScale, 0.1);
      starsRef.current.position.z += scrollDelta * 100;
      // Loop stars position
      if (starsRef.current.position.z > 50) starsRef.current.position.z = -50;
      if (starsRef.current.position.z < -50) starsRef.current.position.z = 50;
    }
  });

  return (
    <>
      <color attach="background" args={[stratagemActive ? '#2a2000' : '#02040a']} />
      {!stratagemActive && <fogExp2 attach="fog" color="#0a0a2e" density={0.012} />}
      {stratagemActive && <fog attach="fog" args={['#ffd700', 5, 25]} />}

      <ambientLight intensity={stratagemActive ? 2 : 0.5} color={stratagemActive ? '#ff0000' : '#ffffff'} />
      <directionalLight position={[10, 10, 5]} intensity={1} color={stratagemActive ? '#ff0000' : '#00f0ff'} />
      <pointLight position={[-10, -10, -5]} intensity={1} color="#00f0ff" />
      <spotLight position={[0, 5, 0]} angle={0.3} penumbra={1} intensity={stratagemActive ? 5 : 2} color={stratagemActive ? '#ffd700' : '#f5c051'} />

      {/* Global Stars */}
      <group ref={starsRef as any}>
        <Stars radius={100} depth={50} count={isMobile ? 1500 : 5000} factor={4} saturation={0} fade speed={isWarping ? 30 : (stratagemActive ? 5 : 1)} />
      </group>

      <GhostCursors currentSection={currentSection} />

      <group ref={cameraGroupRef as any}>
        {/* The view camera logic was handled by moving the group instead. */}
        {/* Actually, it's easier to just let default camera sit at [0,0,5] and move the whole world backwards? 
            No, cameraGroupRef is empty. R3F default camera is not inside this group. 
            Wait, I need to move the actual camera! 
        */}
        <CameraUpdater targetZ={0} scroll={scroll} coreHovered={coreHovered} isWarping={isWarping} />
      </group>

      {/* LEVEL 1: HERO CORE (z=0) */}
      <group position={isMobile ? [0, 3, -4] : [3, 0, -1]}>
        <Sparkles count={isMobile ? 30 : 100} scale={12} size={2} speed={0.4} opacity={0.4} color="#00f0ff" />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <group 
            onPointerOver={() => { setCoreHovered(true); document.body.style.cursor = 'crosshair'; sounds.init(); sounds.playHoverSound(); }}
            onPointerOut={() => { setCoreHovered(false); document.body.style.cursor = 'default'; }}
            onClick={handleCoreClick}
          >
            <mesh ref={coreRef as any}>
              <icosahedronGeometry args={[1, 4]} />
              <MeshDistortMaterial color="#000000" emissive="#00f0ff" emissiveIntensity={0.5} distort={0.4} speed={2} wireframe />
            </mesh>
            <mesh>
              <sphereGeometry args={[1.5, 32, 32]} />
              <meshPhysicalMaterial color="#ffffff" transmission={1} opacity={0.2} transparent roughness={0} />
            </mesh>
            <mesh ref={ringRef as any} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[2.5, 0.02, 16, 100]} />
              <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={2} />
            </mesh>
          </group>
        </Float>
      </group>

      {/* LEVEL 2: TIMELINE PATHWAY (z=-20) */}
      <group position={[0, -2, -20]}>
        <GitHubHeatmap position={[0, -2, 0]} />
        <Sparkles count={50} scale={[10, 2, 20]} size={3} speed={0.2} opacity={0.5} color="#f5c051" />
        {[...Array(5)].map((_, i) => (
          <mesh key={i} position={[0, 0, i * 4 - 8]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[4, 0.01, 16, 100]} />
            <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.5} />
          </mesh>
        ))}
      </group>

      {/* LEVEL 3: SKILLS CONSTELLATION (z=-40) */}
      <group position={[0, 0, -40]}>
        <SkillConstellation position={[isMobile ? 0 : 3, 0, 0]} />
        <Sparkles count={isMobile ? 50 : 100} scale={15} size={1.5} speed={0.1} color="#ffffff" />
      </group>

      {/* LEVEL 4: PROJECT WARP PORTALS (z=-60) */}
      <group position={[0, 0, -60]}>
        {PROJECTS_DATA.map((data, i) => {
          const colors = ['#00f0ff', '#f5c051', '#ff4757'];
          const positions: [number, number, number][] = [
            [isMobile ? 0 : -4, isMobile ? 3 : 2, 0],
            [isMobile ? 0 : 4, isMobile ? 0 : -2, -5],
            [isMobile ? 0 : 0, isMobile ? -3 : 4, -10]
          ];
          return (
            <WarpPortal 
              key={i} 
              id={`proj-${i}`}
              title={data.title}
              description={data.description}
              techStack={data.tech}
              previewColor={colors[i % colors.length]}
              position={positions[i % positions.length]}
            />
          );
        })}
      </group>

      {/* PROFILE ELEMENTS & EMPTY SPACE FILLERS */}
      {!isGameMode ? (
        <AsteroidField isMobile={isMobile} />
      ) : (
        <Physics gravity={[0, 0, 0]}>
          <PointerCollider />
          <MiniGame isActive={isGameMode} onExit={() => setIsGameMode(false)} />
        </Physics>
      )}
      <XRHeadset />
      <NeuralNet />
      
      {/* THE ARCHITECT - PROCEDURAL CHARACTER */}
      <ProceduralCharacter />

      {/* EASTER EGG */}
      {stratagemActive && <OrbitalStrike />}

      {/* FINAL SCENE: HOLOGRAPHIC EARTH (z=-80) */}
      <HolographicEarth />

      <Environment preset="city" />

      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.5} mipmapBlur />
        <Noise opacity={0.03} />
        <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={new THREE.Vector2(0.002, 0.002)} radialModulation={false} modulationOffset={0} />
        {isWarping && <Glitch delay={new THREE.Vector2(0.1, 0.5)} duration={new THREE.Vector2(0.1, 0.3)} strength={new THREE.Vector2(0.3, 0.8)} mode={GlitchMode.SPORADIC} active />}
      </EffectComposer>
    </>
  );
}

// Extracted Component to fix the Camera properly
function CameraUpdater({ scroll, coreHovered, isWarping }: { scroll: any, targetZ: number, coreHovered: boolean, isWarping: boolean }) {
  useFrame((state) => {
    const targetZ = -scroll.offset * 80 + 5; // offset 5 for view distance
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, isWarping ? 0.2 : 0.05);
    
    const targetX = coreHovered ? 0 : (state.pointer.x * Math.PI) / 10;
    const targetY = coreHovered ? 0 : (state.pointer.y * Math.PI) / 10;
    
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.05);
    
    // Hyper-Jump FOV warp effect
    const cam = state.camera as THREE.PerspectiveCamera;
    const targetFov = isWarping ? 130 : 75;
    cam.fov = THREE.MathUtils.lerp(cam.fov, targetFov, 0.1);
    cam.updateProjectionMatrix();

    state.camera.lookAt(0, 0, state.camera.position.z - 5);
  });
  return null;
}

// Extracted Hologram component for isolated hover state
function ProjectHologram({ index, data, isHovered, isSelected, anySelected, onHover, onClick }: { index: number, data: any, isHovered: boolean, isSelected: boolean, anySelected: boolean, onHover: (v: boolean) => void, onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetPos = useRef(new THREE.Vector3((index - 1) * 4, 0, 0));
  const targetRot = useRef(new THREE.Euler(0.2, (index - 1) * 0.5, 0));
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Scale logic
    let targetScale = isSelected ? 2 : (isHovered && !anySelected ? 1.2 : 1);
    if (anySelected && !isSelected) targetScale = 0.5; // Shrink others
    
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

    // Position and Rotation logic
    if (isSelected) {
      // Move exactly to camera's local space within the group (-60 offset)
      const camLocalZ = state.camera.position.z + 60;
      targetPos.current.set(state.camera.position.x, state.camera.position.y, camLocalZ - 4);
      targetRot.current.set(state.camera.rotation.x, state.camera.rotation.y, state.camera.rotation.z);
    } else {
      // Return to original layout
      targetPos.current.set((index - 1) * 4, (anySelected ? (Math.abs(index - 1) * -2) : 0), (anySelected ? -5 : 0));
      targetRot.current.set(0.2, (index - 1) * 0.5, 0);
    }

    meshRef.current.position.lerp(targetPos.current, 0.08);
    
    // Lerp rotation manually or use quaternion
    const currentQuat = new THREE.Quaternion().setFromEuler(meshRef.current.rotation);
    const targetQuat = new THREE.Quaternion().setFromEuler(targetRot.current);
    currentQuat.slerp(targetQuat, 0.08);
    meshRef.current.rotation.setFromQuaternion(currentQuat);
  });

  return (
    <Float speed={isSelected ? 0 : (isHovered ? 0 : 2)} rotationIntensity={isSelected ? 0 : (isHovered ? 0 : 0.2)} floatIntensity={isSelected ? 0 : (isHovered ? 0 : 0.5)}>
      <mesh 
        ref={meshRef as any}
        onPointerOver={() => { onHover(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { onHover(false); document.body.style.cursor = 'default'; }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        <planeGeometry args={[2.5, 3.5]} />
        <meshPhysicalMaterial 
          color={(isHovered || isSelected) ? "#00f0ff" : "#02040a"} 
          transmission={(isHovered || isSelected) ? 0.2 : 0.9} 
          opacity={anySelected && !isSelected ? 0.3 : 1} 
          transparent 
          roughness={0.1}
          metalness={0.8}
          clearcoat={1}
          emissive={(isHovered || isSelected) ? "#00f0ff" : "#000000"}
          emissiveIntensity={(isHovered || isSelected) ? 0.2 : 0}
        />
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(2.5, 3.5)]} />
          <lineBasicMaterial color={(isHovered || isSelected) ? "#ffffff" : "#00f0ff"} transparent opacity={anySelected && !isSelected ? 0.1 : 1} />
        </lineSegments>

        {/* 3D Title on the plane (Only show when not fully expanded, or maybe always) */}
        {!isSelected && (
          <Text 
            position={[0, -1, 0.1]} 
            fontSize={0.2} 
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            maxWidth={2}
            textAlign="center"
          >
            {data.title.split(': ')[1] || data.title}
          </Text>
        )}

        {/* Dynamic 3D Showcase object */}
        {index === 0 && <MiniVRHeadset />}
        {index === 1 && <MiniGamingMonitor />}
        {index === 2 && <MiniGamingKeyboard />}

        {/* HTML Detail Modal when selected */}
        {isSelected && (
          <Html transform position={[0, 0, 0.2]} distanceFactor={1.5}>
            <div className="hologram-modal glass-panel">
              <button className="close-btn" onClick={(e) => { e.stopPropagation(); onClick(); }}>×</button>
              <h2>{data.title}</h2>
              <p className="subtitle text-gradient-cyan">{data.subtitle}</p>
              <p className="desc">{data.description}</p>
              <div className="tech-stack">
                {data.tech.map((t: string) => <span key={t} className="tech-tag">{t}</span>)}
              </div>
            </div>
          </Html>
        )}
      </mesh>
    </Float>
  );
}

// -- GAMING PERIPHERALS 3D MODELS --

function MiniVRHeadset() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => { if(ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.5; });
  return (
    <group ref={ref as any} scale={0.4} position={[0, 0.5, 0.5]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 1.5, 1]} />
        <meshPhysicalMaterial color="#02040a" metalness={0.9} roughness={0.1} clearcoat={1} />
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(3, 1.5, 1)]} />
          <lineBasicMaterial color="#00f0ff" />
        </lineSegments>
      </mesh>
      <mesh position={[0, 0, -1.5]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.2, 16, 50]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-0.6, 0, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.1, 32]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.6, 0, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.1, 32]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

function MiniGamingMonitor() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => { if(ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.5; });
  return (
    <group ref={ref as any} scale={0.5} position={[0, 0, 0.5]}>
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[4, 2.5, 0.2]} />
        <meshPhysicalMaterial color="#02040a" metalness={0.8} roughness={0.2} />
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(4, 2.5, 0.2)]} />
          <lineBasicMaterial color="#f5c051" />
        </lineSegments>
      </mesh>
      <mesh position={[0, 1, 0.11]}>
        <planeGeometry args={[3.8, 2.3]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.2} />
      </mesh>
      <mesh position={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.1, 0.1, 1, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[1.5, 0.1, 1]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  );
}

function MiniGamingKeyboard() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => { if(ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.5; });
  return (
    <group ref={ref as any} scale={0.5} position={[0, 0.5, 0.5]} rotation={[0.4, 0, 0]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4, 0.2, 1.5]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <group position={[-1.8, 0.1, -0.6]}>
        {Array.from({length: 40}).map((_, i) => (
          <mesh key={i} position={[(i % 10) * 0.4, 0.05, Math.floor(i / 10) * 0.4]}>
            <boxGeometry args={[0.3, 0.1, 0.3]} />
            <meshStandardMaterial color="#02040a" emissive={i % 3 === 0 ? "#00f0ff" : (i % 2 === 0 ? "#ff00ff" : "#f5c051")} emissiveIntensity={1} />
          </mesh>
        ))}
      </group>
      {/* Mini mouse */}
      <mesh position={[2.5, 0.1, 0]}>
        <boxGeometry args={[0.6, 0.3, 1]} />
        <meshStandardMaterial color="#222" />
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(0.6, 0.3, 1)]} />
          <lineBasicMaterial color="#00f0ff" />
        </lineSegments>
      </mesh>
    </group>
  );
}

// -- NEW PROFILE 3D ELEMENTS --

function PointerCollider() {
  const ref = useRef<any>(null);
  useFrame(({ pointer, viewport, camera }) => {
    if (ref.current) {
      const vec = new THREE.Vector3((pointer.x * viewport.width) / 2, (pointer.y * viewport.height) / 2, camera.position.z - 40);
      ref.current.setNextKinematicTranslation(vec);
    }
  });
  return (
    <RigidBody position={[0, 0, -40]} type="kinematicPosition" colliders={false} ref={ref}>
      <BallCollider args={[5]} />
      <Trail width={5} length={15} color="#00f0ff" attenuation={(t) => t * t}>
        <mesh visible={false}>
          <boxGeometry />
        </mesh>
      </Trail>
    </RigidBody>
  );
}

function Asteroid({ ast, index }: { ast: any, index: number }) {
  const [destroyed, setDestroyed] = useState(false);

  if (destroyed) {
    return (
      <group position={ast.position}>
        <Sparkles count={20} scale={2} size={4} speed={2} opacity={0.8} color="#f5c051" />
      </group>
    );
  }

  return (
    <RigidBody type="dynamic" position={ast.position} rotation={ast.rotation} linearDamping={0.5} angularDamping={0.5}>
      <mesh 
        scale={ast.scale}
        onClick={(e) => {
          e.stopPropagation();
          setDestroyed(true);
          sounds.init();
          sounds.playExplosionSound();
        }}
        onPointerOver={() => { document.body.style.cursor = 'crosshair'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#02040a" wireframe={index % 3 === 0} emissive={index % 5 === 0 ? "#00f0ff" : "#000000"} emissiveIntensity={0.5} roughness={0.2} metalness={0.8} />
      </mesh>
    </RigidBody>
  );
}

function AsteroidField({ isMobile }: { isMobile: boolean }) {
  const asteroids = useMemo(() => 
    Array.from({ length: isMobile ? 50 : 150 }).map(() => ({
      position: [(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, -Math.random() * 80] as [number, number, number],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [number, number, number],
      scale: Math.random() * 0.5 + 0.1
    })),
    [isMobile]
  );

  return (
    <Physics gravity={[0, 0, 0]}>
      <PointerCollider />
      {asteroids.map((ast, i) => (
        <Asteroid key={i} ast={ast} index={i} />
      ))}
    </Physics>
  );
}

function XRHeadset() {
  return (
    <group position={[0, 0, -10]}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <group rotation={[0.2, -0.4, 0]}>
          {/* Main Visor */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[3, 1.5, 1]} />
            <meshPhysicalMaterial color="#02040a" metalness={0.9} roughness={0.1} clearcoat={1} />
            <lineSegments>
              <edgesGeometry args={[new THREE.BoxGeometry(3, 1.5, 1)]} />
              <lineBasicMaterial color="#00f0ff" />
            </lineSegments>
          </mesh>
          {/* Strap/Halo */}
          <mesh position={[0, 0, -1.5]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.5, 0.2, 16, 50]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          {/* Lenses */}
          <mesh position={[-0.6, 0, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.1, 32]} />
            <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={2} />
          </mesh>
          <mesh position={[0.6, 0, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.1, 32]} />
            <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={2} />
          </mesh>
        </group>
      </Float>
    </group>
  );
}

function NeuralNet() {
  const netRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (netRef.current) {
      netRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      netRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <group position={[0, 0, -30]}>
      <Float speed={1} rotationIntensity={1} floatIntensity={2}>
        <mesh ref={netRef as any}>
          <torusKnotGeometry args={[3, 0.4, 100, 16]} />
          <meshPhysicalMaterial color="#f5c051" wireframe emissive="#f5c051" emissiveIntensity={0.5} />
        </mesh>
      </Float>
    </group>
  );
}

function OrbitalStrike() {
  const laserRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (laserRef.current) {
      laserRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 50) * 0.2;
      laserRef.current.scale.z = 1 + Math.sin(state.clock.elapsedTime * 50) * 0.2;
    }
    // Screen shake
    state.camera.position.x += (Math.random() - 0.5) * 0.5;
    state.camera.position.y += (Math.random() - 0.5) * 0.5;
  });

  return (
    <group position={[0, 0, -10]}>
      <mesh ref={laserRef as any}>
        <cylinderGeometry args={[2, 2, 100, 32]} />
        <meshBasicMaterial color="#ffd700" transparent opacity={0.8} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[3, 3, 100, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

function ProceduralCharacter() {
  const groupRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const t = state.clock.getElapsedTime();
    
    // Position character in front of camera
    const camZ = state.camera.position.z;
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, camZ - 8, 0.1);
    groupRef.current.position.x = Math.sin(t * 0.5) * 1.5 + 2; // Hover on the right
    groupRef.current.position.y = Math.cos(t * 0.4) * 0.5;

    // Gentle floating rotation
    groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.2 - 0.2;
    groupRef.current.rotation.x = Math.cos(t * 0.5) * 0.1;

    // Limb animation (swimming/floating motion)
    if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 2) * 0.2;
    if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t * 2 + Math.PI) * 0.2;
    if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t * 1.5) * 0.2;
    if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(t * 1.5 + Math.PI) * 0.2;
  });

  const glassMaterial = (
    <meshPhysicalMaterial 
      color="#00f0ff" 
      transmission={0.8} 
      opacity={1} 
      transparent 
      roughness={0.1} 
      metalness={0.5} 
      clearcoat={1} 
      emissive="#00f0ff" 
      emissiveIntensity={0.2}
    />
  );

  return (
    <group ref={groupRef as any}>
      {/* Head */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        {glassMaterial}
      </mesh>
      {/* Torso */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.8, 1.2, 0.3]} />
        {glassMaterial}
      </mesh>
      {/* Left Arm */}
      <mesh ref={leftArmRef as any} position={[-0.6, 0.6, 0]}>
        <boxGeometry args={[0.2, 1, 0.2]} />
        {glassMaterial}
      </mesh>
      {/* Right Arm */}
      <mesh ref={rightArmRef as any} position={[0.6, 0.6, 0]}>
        <boxGeometry args={[0.2, 1, 0.2]} />
        {glassMaterial}
      </mesh>
      {/* Left Leg */}
      <mesh ref={leftLegRef as any} position={[-0.2, -0.8, 0]}>
        <boxGeometry args={[0.25, 1.2, 0.25]} />
        {glassMaterial}
      </mesh>
      {/* Right Leg */}
      <mesh ref={rightLegRef as any} position={[0.2, -0.8, 0]}>
        <boxGeometry args={[0.25, 1.2, 0.25]} />
        {glassMaterial}
      </mesh>
    </group>
  );
}

function HolographicEarth() {
  const earthRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      earthRef.current.rotation.x = 0.2;
    }
  });

  return (
    <group position={[0, -2, -80]}>
      <Float speed={1} rotationIntensity={0} floatIntensity={1}>
        <mesh ref={earthRef as any}>
          <sphereGeometry args={[4, 32, 32]} />
          <meshPhysicalMaterial 
            color="#00f0ff" 
            wireframe 
            emissive="#00f0ff" 
            emissiveIntensity={0.2}
            transparent
            opacity={0.3}
          />
        </mesh>
        <mesh scale={0.98}>
          <sphereGeometry args={[4, 32, 32]} />
          <meshBasicMaterial color="#02040a" transparent opacity={0.8} />
        </mesh>
        {/* Core light */}
        <pointLight color="#00f0ff" intensity={2} distance={10} />
      </Float>
      {/* Surrounding orbit rings */}
      <mesh rotation={[Math.PI / 2.2, 0, 0]}>
        <torusGeometry args={[5, 0.02, 16, 100]} />
        <meshBasicMaterial color="#f5c051" transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[Math.PI / 1.8, 0, 0]}>
        <torusGeometry args={[6, 0.01, 16, 100]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

