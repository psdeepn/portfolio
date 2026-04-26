import { useState, useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface GhostCursor {
  id: string;
  position: THREE.Vector3;
  hue: number;
  section: string;
  lastUpdate: number;
}

export function useGhostCursors(currentSection: string) {
  const [ghosts, setGhosts] = useState<Record<string, GhostCursor>>({});
  const ws = useRef<WebSocket | null>(null);
  const { camera, pointer } = useThree();
  const hue = useRef(Math.floor(Math.random() * 360));
  const lastSend = useRef(0);
  const myId = useRef(Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    let storedHue = sessionStorage.getItem('cursorHue');
    if (!storedHue) {
      sessionStorage.setItem('cursorHue', hue.current.toString());
    } else {
      hue.current = parseInt(storedHue, 10);
    }

    // Connect to local or production worker. We'll use a placeholder for now since it's not deployed.
    // In production: 'wss://portfolio-cursor-relay.YOUR_SUBDOMAIN.workers.dev'
    ws.current = new WebSocket('ws://localhost:8787');

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.visitorId === myId.current) return;
        
        // Unproject the received NDC coordinates to 3D world space
        const pos = new THREE.Vector3(data.x, data.y, 0.5);
        pos.unproject(camera);
        // We want the cursor to float in front of the camera, maybe z = camera.position.z - 20
        const dir = pos.sub(camera.position).normalize();
        const distance = 20; // Distance from camera
        const finalPos = camera.position.clone().add(dir.multiplyScalar(distance));

        setGhosts(prev => ({
          ...prev,
          [data.visitorId]: {
            id: data.visitorId,
            position: finalPos,
            hue: data.hue,
            section: data.section,
            lastUpdate: Date.now()
          }
        }));
      } catch (e) {}
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [camera]);

  useFrame(() => {
    const now = Date.now();
    // Throttle to max 10/sec (100ms)
    if (now - lastSend.current > 100 && ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        visitorId: myId.current,
        x: pointer.x,
        y: pointer.y,
        hue: hue.current,
        section: currentSection
      }));
      lastSend.current = now;
    }

    // Cleanup old ghosts (no updates for 3s)
    setGhosts(prev => {
      let changed = false;
      const next = { ...prev };
      for (const id in next) {
        if (now - next[id].lastUpdate > 3000) {
          delete next[id];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  });

  // Cap rendered ghosts at 15
  const ghostArray = Object.values(ghosts).slice(0, 15);
  return { ghosts: ghostArray };
}
