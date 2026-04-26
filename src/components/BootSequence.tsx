import { useState, useEffect } from 'react';
import { sounds } from '../utils/soundEffects';
import './BootSequence.css';

const BOOT_LOGS = [
  { text: 'INITIALIZING XR_ENGINE_v2.0...', delay: 200 },
  { text: 'LOADING KERNEL MODULES [OK]', delay: 400 },
  { text: 'ESTABLISHING SECURE CONNECTION...', delay: 700 },
  { text: 'WARNING: UNAUTHORIZED ACCESS DETECTED', delay: 1000, type: 'warning' },
  { text: 'BYPASSING FIREWALL... [SUCCESS]', delay: 1200 },
  { text: 'DECRYPTING NEURAL NETWORK WEIGHTS...', delay: 1600 },
  { text: 'MOUNTING VIRTUAL FILESYSTEM [OK]', delay: 1800 },
  { text: 'INITIALIZING PHYSICS ENGINE (RAPIER) [OK]', delay: 2100 },
  { text: 'ALLOCATING VRAM FOR TEXTURES...', delay: 2400 },
  { text: 'STARTING AUDIO SYNTHESIS [TONE.JS]...', delay: 2600 },
  { text: 'SYSTEM NOMINAL. PREPARING LAUNCH...', delay: 3000 },
];

export default function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [lines, setLines] = useState<typeof BOOT_LOGS>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Play a low frequency startup hum or typing sounds
    sounds.init();
    
    if (currentIndex < BOOT_LOGS.length) {
      const log = BOOT_LOGS[currentIndex];
      const timer = setTimeout(() => {
        sounds.playTypingSound();
        setLines((prev) => [...prev, log]);
        setCurrentIndex((prev) => prev + 1);
      }, log.delay - (currentIndex > 0 ? BOOT_LOGS[currentIndex - 1].delay : 0));
      return () => clearTimeout(timer);
    } else {
      const completeTimer = setTimeout(() => {
        sounds.playClickSound();
        onComplete();
      }, 800); // Wait a bit after the last line
      return () => clearTimeout(completeTimer);
    }
  }, [currentIndex, onComplete]);

  return (
    <div className="boot-sequence-container">
      <div className="boot-overlay" />
      <ul className="boot-log">
        {lines.map((line, i) => (
          <li key={i} className={`boot-line ${line.type || ''}`}>
            {'>'} {line.text}
          </li>
        ))}
        {currentIndex < BOOT_LOGS.length && (
          <li className="boot-line">
            {'>'} <span className="boot-cursor" />
          </li>
        )}
      </ul>
    </div>
  );
}
