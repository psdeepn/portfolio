import { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { sounds } from '../utils/soundEffects';

interface DayData {
  date: string;
  count: number;
  col: number;
  row: number;
}

export default function GitHubHeatmap({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const [data, setData] = useState<DayData[]>([]);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      const CACHE_KEY = 'github_heatmap_cache';
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { timestamp, days } = JSON.parse(cached);
        if (Date.now() - timestamp < 3600000) {
          setData(days);
          return;
        }
      }

      const token = import.meta.env.VITE_GITHUB_TOKEN;
      if (!token) {
        // Fallback to mock data
        const mockDays: DayData[] = [];
        for (let col = 0; col < 52; col++) {
          for (let row = 0; row < 7; row++) {
            mockDays.push({
              date: `2024-W${col}-D${row}`,
              count: Math.floor(Math.random() * 10),
              col,
              row
            });
          }
        }
        setData(mockDays);
        return;
      }

      try {
        const query = `
          query {
            viewer {
              contributionsCollection {
                contributionCalendar {
                  weeks {
                    contributionDays {
                      contributionCount
                      date
                    }
                  }
                }
              }
            }
          }
        `;
        const res = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers: {
            'Authorization': `bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query })
        });
        const result = await res.json();
        const weeks = result.data.viewer.contributionsCollection.contributionCalendar.weeks;
        
        const days: DayData[] = [];
        weeks.forEach((w: any, col: number) => {
          w.contributionDays.forEach((d: any, row: number) => {
            days.push({ date: d.date, count: d.contributionCount, col, row });
          });
        });

        localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), days }));
        setData(days);
      } catch (err) {
        console.error("GitHub API Error", err);
      }
    };
    loadData();
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const currentHeights = useRef<number[]>([]);

  useEffect(() => {
    if (!meshRef.current || data.length === 0) return;
    currentHeights.current = new Array(data.length).fill(0.01);
    
    data.forEach((day, i) => {
      // Map colors: low=dark teal (#0d2137), high=bright cyan (#00ffff)
      const t = Math.min(day.count / 10, 1); // Normalize 0-10
      const color = new THREE.Color().lerpColors(
        new THREE.Color('#0d2137'), 
        new THREE.Color('#00ffff'), 
        t
      );
      if (day.count === 0) color.set('#040a15'); // empty
      
      meshRef.current!.setColorAt(i, color);
    });
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [data]);

  useFrame(() => {
    if (!meshRef.current || data.length === 0) return;

    let needsUpdate = false;
    data.forEach((day, i) => {
      // Target height based on count
      const targetHeight = Math.max(0.1, Math.min(day.count * 0.2, 2.0));
      // Stagger animation based on column
      
      // We don't have exact time here easily without state.clock, just lerp continuously
      currentHeights.current[i] = THREE.MathUtils.lerp(currentHeights.current[i], targetHeight, 0.05);

      const x = day.col * 0.3 - (52 * 0.3) / 2;
      const z = day.row * 0.3 - (7 * 0.3) / 2;
      const y = currentHeights.current[i] / 2; // Center of box

      dummy.position.set(x, y, z);
      dummy.scale.set(0.25, currentHeights.current[i], 0.25);
      
      if (hoveredIdx === i) {
        dummy.scale.set(0.3, currentHeights.current[i] * 1.2, 0.3);
      }

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      needsUpdate = true;
    });

    if (needsUpdate) {
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    if (e.instanceId !== undefined) {
      setHoveredIdx(e.instanceId);
      document.body.style.cursor = 'pointer';
      if (data[e.instanceId].count > 0) {
        sounds.init();
        sounds.playHoverSound();
      }
    }
  };

  const handlePointerOut = () => {
    setHoveredIdx(null);
    document.body.style.cursor = 'default';
  };

  return (
    <group position={position}>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, data.length || 1]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.1} metalness={0.5} />
      </instancedMesh>

      {hoveredIdx !== null && data[hoveredIdx] && (
        <Html
          position={[
            data[hoveredIdx].col * 0.3 - (52 * 0.3) / 2, 
            currentHeights.current[hoveredIdx] + 0.5, 
            data[hoveredIdx].row * 0.3 - (7 * 0.3) / 2
          ]}
          center
        >
          <div style={{
            background: 'rgba(0, 240, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            padding: '8px 12px',
            borderRadius: '6px',
            color: '#00ffff',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            pointerEvents: 'none'
          }}>
            <strong>{data[hoveredIdx].count}</strong> contributions<br/>
            {data[hoveredIdx].date}
          </div>
        </Html>
      )}
    </group>
  );
}
