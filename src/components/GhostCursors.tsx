import { useGhostCursors } from '../hooks/useGhostCursors';
import { Trail } from '@react-three/drei';

export default function GhostCursors({ currentSection }: { currentSection: string }) {
  const { ghosts } = useGhostCursors(currentSection);

  return (
    <>
      {ghosts.map(ghost => (
        <group key={ghost.id} position={ghost.position}>
          <Trail width={0.3} length={8} decay={1} color={`hsl(${ghost.hue}, 80%, 70%)`}>
            <mesh visible={false}>
              <boxGeometry />
            </mesh>
          </Trail>
          <mesh>
            <sphereGeometry args={[0.05]} />
            <meshBasicMaterial color={`hsl(${ghost.hue}, 80%, 70%)`} transparent opacity={0.8} />
          </mesh>
        </group>
      ))}
    </>
  );
}
