import { useState, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader, ScrollControls, Scroll } from '@react-three/drei';
import { AnimatePresence } from 'framer-motion';
import Scene from './components/Scene';
import Overlay from './components/Overlay';
import Cursor from './components/Cursor';
import Terminal from './components/Terminal';
import EnterScreen from './components/EnterScreen';
import AskAI from './components/AskAI';
import BootSequence from './components/BootSequence';
import AudioControls from './components/AudioControls';
import PersonaSelect from './components/PersonaSelect';
import { sounds } from './utils/soundEffects';
import './App.css';

function App() {
  const [personaSelected, setPersonaSelected] = useState(false);
  const [booted, setBooted] = useState(false);
  const [started, setStarted] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  useEffect(() => {
    if (!started) return;
    
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.btn-premium') || target.closest('.glass-panel') || target.closest('.contact-link') || target.closest('button')) {
        sounds.init();
        // Simple debounce so it doesn't spam too hard
        sounds.playHoverSound();
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a')) {
        sounds.init();
        sounds.playClickSound();
      }
    };

    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('click', handleClick);
    };
  }, [started]);

  return (
    <>
      <Cursor />
      <Terminal />
      
      {!personaSelected && <PersonaSelect onComplete={() => setPersonaSelected(true)} />}
      
      {personaSelected && !booted && <BootSequence onComplete={() => setBooted(true)} />}
      
      {booted && !started && <EnterScreen onEnter={() => setStarted(true)} />}

      {started && (
        <>
          <AudioControls />
          <div className="canvas-container">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
              <Suspense fallback={null}>
                {/* 5 pages of scrolling content */}
                <ScrollControls pages={6} damping={0.15} distance={1.2}>
                  <Scene />
                  <Scroll html style={{ width: '100vw', height: '100vh' }}>
                    <Overlay onOpenAI={() => setIsAIOpen(true)} />
                  </Scroll>
                </ScrollControls>
              </Suspense>
            </Canvas>
          </div>
          
          <AnimatePresence>
            {isAIOpen && <AskAI onClose={() => setIsAIOpen(false)} />}
          </AnimatePresence>
        </>
      )}

      <Loader 
        containerStyles={{ background: '#02040a', zIndex: 999999 }}
        innerStyles={{ background: 'rgba(255, 255, 255, 0.1)', width: '300px', height: '4px', borderRadius: '2px' }}
        barStyles={{ background: '#00f0ff', height: '4px', borderRadius: '2px' }}
        dataStyles={{ color: '#00f0ff', fontFamily: 'Outfit, sans-serif', fontSize: '14px', letterSpacing: '2px', fontWeight: 600 }}
      />
    </>
  );
}

export default App;
