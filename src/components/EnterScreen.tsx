import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Power } from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import './EnterScreen.css';

interface EnterScreenProps {
  onEnter: () => void;
}

export default function EnterScreen({ onEnter }: EnterScreenProps) {
  const [isEntering, setIsEntering] = useState(false);

  const handleEnter = () => {
    setIsEntering(true);
    sounds.startDrone();
    // Slight delay for cinematic effect
    setTimeout(() => {
      onEnter();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {!isEntering && (
        <motion.div 
          className="enter-screen"
          exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        >
          <div className="enter-content">
            <h1 className="enter-title"><ScrambleText text="SAI_DEEPAK" /></h1>
            <p className="enter-subtitle"><ScrambleText text="XR & AI Systems Architect" delay={500} /></p>
            
            <button className="enter-btn" onClick={handleEnter}>
              <Power className="power-icon" size={24} />
              <span>Initialize Experience</span>
            </button>
            
            <p className="enter-warning">WARNING: High-performance 3D environment ahead. Headphones recommended.</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const CHARS = '!<>-_\\/[]{}—=+*^?#________';
function ScrambleText({ text, delay = 0 }: { text: string, delay?: number }) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let iteration = 0;
    let interval: number;
    let timeout: number;

    const startAnimation = () => {
      interval = window.setInterval(() => {
        setDisplayText(
          text.split('')
            .map((_, index) => {
              if (index < iteration) {
                return text[index];
              }
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join('')
        );

        if (iteration >= text.length) {
          clearInterval(interval);
        }

        iteration += 1 / 3; 
      }, 30);
    };

    if (delay > 0) {
      timeout = window.setTimeout(startAnimation, delay);
    } else {
      startAnimation();
    }

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [text, delay]);

  return <span>{displayText}</span>;
}
