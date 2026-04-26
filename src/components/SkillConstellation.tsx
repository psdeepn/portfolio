import { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Line } from '@react-three/drei';
import * as THREE from 'three';
// @ts-ignore
import * as d3 from 'd3-force-3d';
import { sounds } from '../utils/soundEffects';

const SKILLS_DATA = [
  { id: 'React', category: 'Frontend', prof: 0.95 },
  { id: 'Vue', category: 'Frontend', prof: 0.7 },
  { id: 'Three.js', category: 'Frontend', prof: 0.95 },
  { id: 'WebXR', category: 'Frontend', prof: 0.9 },
  { id: 'CSS/SASS', category: 'Frontend', prof: 0.85 },
  { id: 'Framer Motion', category: 'Frontend', prof: 0.88 },
  
  { id: 'Node.js', category: 'Backend', prof: 0.85 },
  { id: 'Python', category: 'Backend', prof: 0.8 },
  { id: 'GraphQL', category: 'Backend', prof: 0.75 },
  { id: 'PostgreSQL', category: 'Backend', prof: 0.7 },
  { id: 'Redis', category: 'Backend', prof: 0.65 },
  
  { id: 'Docker', category: 'DevOps', prof: 0.8 },
  { id: 'AWS', category: 'DevOps', prof: 0.75 },
  { id: 'CI/CD', category: 'DevOps', prof: 0.8 },
  { id: 'Kubernetes', category: 'DevOps', prof: 0.6 },
  
  { id: 'TypeScript', category: 'Languages', prof: 0.95 },
  { id: 'JavaScript', category: 'Languages', prof: 0.95 },
  { id: 'C#', category: 'Languages', prof: 0.85 },
  { id: 'C++', category: 'Languages', prof: 0.7 },
  
  { id: 'Unity', category: 'Tools', prof: 0.95 },
  { id: 'Unreal Engine', category: 'Tools', prof: 0.85 },
  { id: 'Git', category: 'Tools', prof: 0.9 },
  { id: 'Figma', category: 'Tools', prof: 0.8 },
  { id: 'Blender', category: 'Tools', prof: 0.75 },
  { id: 'OpenAI API', category: 'Tools', prof: 0.9 },
  { id: 'LangChain', category: 'Tools', prof: 0.85 }
];

const CATEGORY_COLORS: Record<string, string> = {
  Frontend: '#00f0ff',
  Backend: '#f5c051',
  DevOps: '#ff4757',
  Languages: '#a855f7',
  Tools: '#10b981'
};

export default function SkillConstellation({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { camera } = useThree();
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  // Initialize Force layout
  const { nodes, links } = useMemo(() => {
    const graphNodes = SKILLS_DATA.map((s) => ({ ...s, x: 0, y: 0, z: 0 }));
    const graphLinks: any[] = [];
    
    // Connect nodes of same category
    for (let i = 0; i < graphNodes.length; i++) {
      for (let j = i + 1; j < graphNodes.length; j++) {
        if (graphNodes[i].category === graphNodes[j].category) {
          graphLinks.push({ source: i, target: j });
        }
      }
    }

    const simulation = d3.forceSimulation(graphNodes)
      .numDimensions(3)
      .force('charge', d3.forceManyBody().strength(-10))
      .force('link', d3.forceLink(graphLinks).distance(3))
      .force('center', d3.forceCenter())
      .stop();

    // Run simulation synchronously
    for (let i = 0; i < 300; i++) simulation.tick();

    return { nodes: graphNodes, links: graphLinks };
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const targetScales = useRef<number[]>(nodes.map(() => 1));
  const currentScales = useRef<number[]>(nodes.map(() => 1));

  useEffect(() => {
    if (!meshRef.current) return;
    
    nodes.forEach((node, i) => {
      dummy.position.set(node.x, node.y, node.z);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      
      const color = new THREE.Color(CATEGORY_COLORS[node.category]);
      meshRef.current!.setColorAt(i, color);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [nodes, dummy]);

  useFrame((state) => {
    if (!meshRef.current) return;

    let needsUpdate = false;
    nodes.forEach((node, i) => {
      const isHovered = hoveredNode === i;
      const targetScale = isHovered ? 1.5 : 1;
      
      // Interpolate scales for "useSpring" feel
      currentScales.current[i] = THREE.MathUtils.lerp(currentScales.current[i], targetScale, 0.1);
      
      if (Math.abs(currentScales.current[i] - targetScale) > 0.01) {
        dummy.position.set(node.x, node.y, node.z);
        // Base size on proficiency
        const baseSize = node.prof * 0.5;
        dummy.scale.setScalar(baseSize * currentScales.current[i]);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
        needsUpdate = true;
      }
    });

    if (needsUpdate) {
      meshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Twinkle emissive intensity
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    if (e.instanceId !== undefined) {
      setHoveredNode(e.instanceId);
      document.body.style.cursor = 'pointer';
      sounds.init();
      sounds.playHoverSound();
    }
  };

  const handlePointerOut = () => {
    setHoveredNode(null);
    document.body.style.cursor = 'default';
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (e.instanceId !== undefined) {
      const node = nodes[e.instanceId];
      // Lerp camera target towards the clicked cluster center
      sounds.init();
      sounds.playClickSound();
      // Since camera logic is handled by Scene scrolling, we can just highlight the node for now
      // True camera lerp would fight with ScrollControls
    }
  };

  return (
    <group position={position}>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, nodes.length]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial roughness={0.2} metalness={0.8} emissive="#ffffff" emissiveIntensity={0.5} />
      </instancedMesh>

      {/* Render Edges */}
      {links.map((link, i) => {
        const source = typeof link.source === 'object' ? link.source : nodes[link.source];
        const target = typeof link.target === 'object' ? link.target : nodes[link.target];
        const isHovered = hoveredNode === source.index || hoveredNode === target.index;
        
        return (
          <Line
            key={i}
            points={[[source.x, source.y, source.z], [target.x, target.y, target.z]]}
            color={isHovered ? CATEGORY_COLORS[source.category] : '#ffffff'}
            opacity={isHovered ? 0.8 : 0.1}
            transparent
            lineWidth={isHovered ? 2 : 1}
          />
        );
      })}

      {/* Render Labels */}
      {nodes.map((node, i) => (
        <Text
          key={i}
          position={[node.x, node.y + (node.prof * 0.5) + 0.3, node.z]}
          fontSize={0.3}
          color={hoveredNode === i ? '#ffffff' : CATEGORY_COLORS[node.category]}
          anchorX="center"
          anchorY="middle"
          occlude
        >
          {node.id}
          {hoveredNode === i ? `\n${(node.prof * 100).toFixed(0)}%` : ''}
        </Text>
      ))}
    </group>
  );
}
