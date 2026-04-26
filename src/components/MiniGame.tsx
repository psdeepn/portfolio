import { useState, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, Sparkles } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { sounds } from '../utils/soundEffects';

interface Target {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}

export default function MiniGame({ isActive, onExit }: { isActive: boolean; onExit: () => void }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [targets, setTargets] = useState<Target[]>([]);
  const { camera } = useThree();

  // Initialize targets
  useEffect(() => {
    if (isActive) {
      setScore(0);
      setTimeLeft(30);
      setGameOver(false);
      spawnTargets();
    }
  }, [isActive]);

  // Timer
  useEffect(() => {
    if (isActive && !gameOver && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameOver) {
      setGameOver(true);
      sounds.playGameOverSound();
    }
  }, [isActive, timeLeft, gameOver]);

  const spawnTargets = () => {
    const newTargets = Array.from({ length: 20 }).map((_, i) => ({
      id: `target-${Date.now()}-${i}`,
      position: [(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, camera.position.z - 20 - Math.random() * 40] as [number, number, number],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [number, number, number],
      scale: Math.random() * 0.5 + 0.5
    }));
    setTargets(newTargets);
  };

  const handleShoot = (id: string, _position: THREE.Vector3) => {
    if (gameOver || !isActive) return;
    
    sounds.playShootSound();
    sounds.playScoreTickSound();
    setScore((s) => s + 100);
    
    // Remove target and spawn a new one
    setTargets((prev) => prev.filter((t) => t.id !== id));
    
    // Create hit effect (handled by individual target component)
    const newTarget = {
      id: `target-${Date.now()}`,
      position: [(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, camera.position.z - 20 - Math.random() * 40] as [number, number, number],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [number, number, number],
      scale: Math.random() * 0.5 + 0.5
    };
    setTargets((prev) => [...prev, newTarget]);
  };

  if (!isActive) return null;

  return (
    <>
      <Html fullscreen zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
        <div className="minigame-hud" style={{ position: 'absolute', top: '100px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '40px', fontFamily: 'monospace', color: '#00f0ff', fontSize: '24px', textShadow: '0 0 10px #00f0ff', pointerEvents: 'none' }}>
          <div>SCORE: {score}</div>
          <div>TIME: {timeLeft}s</div>
        </div>
        
        {/* Crosshair */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: '20px', height: '20px', border: '2px solid rgba(0, 240, 255, 0.5)', borderRadius: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: '4px', height: '4px', backgroundColor: '#00f0ff', borderRadius: '50%', transform: 'translate(-50%, -50%)' }} />
        </div>

        {gameOver && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', backgroundColor: 'rgba(2, 4, 10, 0.9)', padding: '40px', border: '1px solid #00f0ff', borderRadius: '10px', pointerEvents: 'auto' }}>
            <h2 style={{ color: '#ff4757', marginBottom: '20px', fontSize: '40px', textShadow: '0 0 20px #ff4757' }}>SYSTEM CALIBRATION COMPLETE</h2>
            <p style={{ color: '#00f0ff', fontSize: '24px', marginBottom: '30px' }}>FINAL SCORE: {score}</p>
            <button onClick={onExit} style={{ background: 'transparent', border: '1px solid #00f0ff', color: '#00f0ff', padding: '10px 20px', fontSize: '18px', cursor: 'pointer', transition: 'all 0.3s' }} onPointerOver={(e) => (e.currentTarget.style.background = 'rgba(0, 240, 255, 0.2)')} onPointerOut={(e) => (e.currentTarget.style.background = 'transparent')}>
              RETURN TO HUB
            </button>
          </div>
        )}
      </Html>

      {targets.map((t) => (
        <GameTarget key={t.id} target={t} onHit={handleShoot} gameOver={gameOver} />
      ))}
    </>
  );
}

function GameTarget({ target, onHit, gameOver }: { target: Target; onHit: (id: string, pos: THREE.Vector3) => void; gameOver: boolean }) {
  const [destroyed, setDestroyed] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((_state) => {
    if (meshRef.current && !destroyed) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.02;
    }
  });

  if (destroyed) {
    return (
      <group position={target.position}>
        <Sparkles count={30} scale={3} size={5} speed={2} opacity={1} color="#ff4757" />
      </group>
    );
  }

  return (
    <RigidBody type="kinematicPosition" position={target.position} rotation={target.rotation}>
      <mesh
        ref={meshRef}
        scale={target.scale}
        onClick={(e) => {
          e.stopPropagation();
          if (gameOver) return;
          setDestroyed(true);
          onHit(target.id, e.point);
        }}
        onPointerOver={() => { document.body.style.cursor = 'crosshair'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#02040a" wireframe emissive="#ff4757" emissiveIntensity={1} roughness={0.2} metalness={0.8} />
      </mesh>
    </RigidBody>
  );
}
