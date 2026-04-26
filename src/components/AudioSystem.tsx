/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import './AudioSystem.css';

export default function AudioSystem() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (isPlaying) {
      sounds.setMuted(false);
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Master Gain
        gainNodeRef.current = audioCtxRef.current.createGain();
        gainNodeRef.current.gain.value = 0.05; // Very subtle
        gainNodeRef.current.connect(audioCtxRef.current.destination);

        // Drone Oscillator 1
        const osc1 = audioCtxRef.current.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.value = 55; // Deep bass

        // Drone Oscillator 2
        const osc2 = audioCtxRef.current.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.value = 110; 

        // LFO for pulsing effect
        const lfo = audioCtxRef.current.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1; // Slow pulse
        
        const lfoGain = audioCtxRef.current.createGain();
        lfoGain.gain.value = 0.02;

        lfo.connect(lfoGain.gain);
        
        osc1.connect(gainNodeRef.current);
        osc2.connect(lfoGain);
        lfoGain.connect(gainNodeRef.current);

        osc1.start();
        osc2.start();
        lfo.start();
      } else if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    } else {
      sounds.setMuted(true);
      if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
        audioCtxRef.current.suspend();
      }
    }
  }, [isPlaying]);

  return (
    <button 
      className={`audio-toggle ${isPlaying ? 'active' : ''}`}
      onClick={() => setIsPlaying(!isPlaying)}
      title="Toggle Ambient Audio"
    >
      {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
    </button>
  );
}
