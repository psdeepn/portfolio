import * as Tone from 'tone';
import { sounds } from './soundEffects';

const sectionChords: Record<string, string[][]> = {
  hero: [['C2','G2','E3'],['A1','E2','C3']],
  skills: [['F2','C3','A3'],['G2','D3','B3']],
  experience: [['D2','A2','F3'],['E2','B2','G3']],
  contact: [['G2','D3','B3'],['C2','G2','E3']]
};

let synth: Tone.PolySynth | null = null;
let currentLoop: Tone.Loop | null = null;
let currentChordIndex = 0;
let isPlaying = false;
let initialized = false;

export const initMusic = async () => {
  if (initialized) return;
  await Tone.start();
  
  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 2, decay: 0.1, sustain: 0.8, release: 4 }
  });

  const filter = new Tone.AutoFilter("4n").start();
  const reverb = new Tone.Reverb(8);
  
  synth.chain(filter, reverb, Tone.Destination);
  synth.volume.value = sounds.isMuted ? -Infinity : -20;
  
  initialized = true;
  
  // Listen for global mute state from soundEffects
  // We can patch sounds.setMuted to also update us
  const originalSetMuted = sounds.setMuted.bind(sounds);
  sounds.setMuted = (muted: boolean) => {
    originalSetMuted(muted);
    if (synth) {
      synth.volume.rampTo(muted ? -Infinity : -20, 0.5);
    }
  };

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseMusic();
    } else {
      resumeMusic();
    }
  });
};

export const switchSection = (section: string) => {
  if (!initialized || !synth) return;
  
  const chords = sectionChords[section] || sectionChords.hero;
  
  if (currentLoop) {
    currentLoop.stop();
    currentLoop.dispose();
  }

  currentChordIndex = 0;
  
  currentLoop = new Tone.Loop((time) => {
    const chord = chords[currentChordIndex % chords.length];
    synth!.triggerAttackRelease(chord, "2m", time);
    currentChordIndex++;
  }, "4m");

  if (isPlaying) {
    Tone.Transport.start();
    currentLoop.start(0);
  }
};

export const pauseMusic = () => {
  if (!initialized) return;
  isPlaying = false;
  Tone.Transport.pause();
  if (synth) synth.releaseAll();
};

export const resumeMusic = () => {
  if (!initialized || sounds.isMuted) return;
  isPlaying = true;
  Tone.Transport.start();
  if (currentLoop && currentLoop.state !== 'started') {
    currentLoop.start(0);
  }
};
