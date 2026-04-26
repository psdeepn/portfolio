import { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RenderTexture, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';
import { sounds } from '../utils/soundEffects';

interface WarpPortalProps {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  previewColor: string;
  position: [number, number, number];
  rotation?: [number, number, number];
}

const vertexShader = `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 pos = position;
    // displace along normal
    float displace = sin(pos.x * 5.0 + uTime) * cos(pos.y * 5.0 + uTime) * 0.1;
    pos += normal * displace;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    float alpha = 0.5 + 0.5 * sin(uTime * 2.0);
    gl_FragColor = vec4(uColor, alpha);
  }
`;

function ProjectPreviewScene({ title, techStack, previewColor }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <>
      <color attach="background" args={['#050510']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} color={previewColor} />
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[1, 0.3, 100, 16]} />
        <meshStandardMaterial color={previewColor} wireframe={true} />
      </mesh>
      <Text position={[0, 2, 0]} fontSize={0.5} color="#ffffff">
        {title}
      </Text>
      <Text position={[0, -2, 0]} fontSize={0.3} color="#00f0ff">
        {techStack.join(' • ')}
      </Text>
    </>
  );
}

export default function WarpPortal({ id, title, description, techStack, previewColor, position, rotation = [0, 0, 0] }: WarpPortalProps) {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const [hovered, setHovered] = useState(false);
  const [isActive, setIsActive] = useState(false); // active if close enough for render texture

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(previewColor) }
  }), [previewColor]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    if (lightRef.current) {
      lightRef.current.intensity = 1 + Math.sin(state.clock.elapsedTime * 2) * 2;
    }
    
    // Distance check for frustum culling
    if (groupRef.current) {
      const dist = camera.position.distanceTo(groupRef.current.position);
      setIsActive(dist < 30);
    }
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
    sounds.init();
    sounds.playHoverSound();
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'default';
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    sounds.init();
    sounds.playExplosionSound();
    // In a real app we'd dispatch a hyper-jump event here tailored to the project
    window.dispatchEvent(new CustomEvent('hyper-jump'));
  };

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <pointLight ref={lightRef} color={previewColor} distance={10} />
      
      {/* Edge Ring */}
      <mesh onPointerOver={handlePointerOver} onPointerOut={handlePointerOut} onClick={handleClick}>
        <ringGeometry args={[2, 2.2, 64]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Portal Inner Surface */}
      <mesh onPointerOver={handlePointerOver} onPointerOut={handlePointerOut} onClick={handleClick}>
        <circleGeometry args={[2, 64]} />
        <meshBasicMaterial transparent opacity={hovered ? 1 : 0.8}>
          {isActive && (
            <RenderTexture attach="map">
              <PerspectiveCamera makeDefault position={[0, 0, 5]} />
              <ProjectPreviewScene title={title} techStack={techStack} previewColor={previewColor} />
            </RenderTexture>
          )}
        </meshBasicMaterial>
      </mesh>
    </group>
  );
}
