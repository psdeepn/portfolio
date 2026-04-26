import { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Users, Eye, ArrowRight } from 'lucide-react';
import { usePersona, type PersonaType } from '../context/PersonaContext';
import { useRecruiter } from '../context/RecruiterContext';
import { sounds } from '../utils/soundEffects';

export default function PersonaSelect({ onComplete }: { onComplete: () => void }) {
  const { setPersona } = usePersona();
  const { setIsRecruiter } = useRecruiter();
  const [hovered, setHovered] = useState<PersonaType>(null);

  const handleSelect = (type: PersonaType) => {
    sounds.init();
    sounds.playClickSound();
    setPersona(type);
    if (type === 'recruiter') {
      setIsRecruiter(true);
    }
    onComplete();
  };

  const handleHover = (type: PersonaType) => {
    setHovered(type);
    sounds.init();
    sounds.playHoverSound();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#02040a', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Outfit, sans-serif' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ textAlign: 'center', marginBottom: '60px' }}
      >
        <h1 style={{ fontSize: '3rem', fontWeight: 700, margin: '0 0 10px 0', background: 'linear-gradient(90deg, #fff, #00f0ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>INITIALIZE CONNECTION</h1>
        <p style={{ color: '#94a3b8', fontSize: '1.2rem', margin: 0, letterSpacing: '2px' }}>SELECT YOUR VIEWPORT PROTOCOL</p>
      </motion.div>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center', padding: '0 20px' }}>
        <PersonaCard
          type="recruiter"
          icon={<Briefcase size={32} />}
          title="RECRUITER / HIRING"
          description="Direct access to ROI, technical stack mapping, and structured career timeline. Disables gamification."
          color="#f5c051"
          hovered={hovered}
          onHover={handleHover}
          onSelect={handleSelect}
        />
        <PersonaCard
          type="collaborator"
          icon={<Users size={32} />}
          title="COLLABORATOR"
          description="Focuses on architecture, system design, and deep technical methodologies. Interactive mode enabled."
          color="#00f0ff"
          hovered={hovered}
          onHover={handleHover}
          onSelect={handleSelect}
        />
        <PersonaCard
          type="curious"
          icon={<Eye size={32} />}
          title="CURIOUS EXPLORER"
          description="Full AAA cinematic experience. Includes all Easter eggs, minigames, and visual spectacles."
          color="#ff4757"
          hovered={hovered}
          onHover={handleHover}
          onSelect={handleSelect}
        />
      </div>
    </div>
  );
}

function PersonaCard({ type, icon, title, description, color, hovered, onHover, onSelect }: any) {
  const isHovered = hovered === type;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -10 }}
      onHoverStart={() => onHover(type)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(type)}
      style={{
        width: '300px',
        background: isHovered ? 'rgba(255, 255, 255, 0.05)' : 'rgba(2, 4, 10, 0.8)',
        border: `1px solid ${isHovered ? color : 'rgba(255, 255, 255, 0.1)'}`,
        borderRadius: '12px',
        padding: '30px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: isHovered ? `0 0 20px ${color}40` : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}
    >
      <div style={{ color: isHovered ? color : '#fff', marginBottom: '20px', transition: 'color 0.3s ease' }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1.2rem', margin: '0 0 15px 0', letterSpacing: '1px' }}>{title}</h3>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 30px 0', flex: 1 }}>{description}</p>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: isHovered ? color : '#64748b', transition: 'color 0.3s ease', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '1px' }}>
        INITIALIZE <ArrowRight size={16} />
      </div>
    </motion.div>
  );
}
