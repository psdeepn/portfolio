import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function AudioControls() {
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    sounds.setMuted(newMutedState);
    if (!newMutedState) {
      sounds.playClickSound();
    }
  };

  return (
    <button
      onClick={toggleMute}
      style={{
        position: 'fixed',
        top: '30px',
        right: '30px',
        zIndex: 9999,
        background: 'rgba(0, 240, 255, 0.1)',
        border: '1px solid rgba(0, 240, 255, 0.3)',
        borderRadius: '50%',
        width: '45px',
        height: '45px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#00f0ff',
        cursor: 'pointer',
        backdropFilter: 'blur(5px)',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(0, 240, 255, 0.2)';
        e.currentTarget.style.transform = 'scale(1.1)';
        if (!isMuted) sounds.playHoverSound();
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
      title={isMuted ? "Unmute Audio" : "Mute Audio"}
    >
      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
    </button>
  );
}
