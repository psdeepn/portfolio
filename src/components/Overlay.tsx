import { motion } from 'framer-motion';
import { Terminal, BrainCircuit, Globe2, Zap, ShieldCheck, Crosshair, MessageSquare, Briefcase } from 'lucide-react';
import { useScroll } from '@react-three/drei';
import { sounds } from '../utils/soundEffects';
import { useRecruiter } from '../context/RecruiterContext';
import ARCard from './ARCard';
import './Overlay.css';

interface OverlayProps {
  onOpenAI: () => void;
}

const Overlay = ({ onOpenAI }: OverlayProps) => {
  const scroll = useScroll();
  const { isRecruiter } = useRecruiter();

  const scrollToJD = () => {
    if (scroll && scroll.el) {
      // JD is the 4th chapter (index 3). Each page is 100vh.
      scroll.el.scrollTo({ top: window.innerHeight * 3, behavior: 'smooth' });
    }
  };

  const handleHyperJump = () => {
    sounds.init();
    sounds.playExplosionSound();
    window.dispatchEvent(new CustomEvent('hyper-jump'));
    
    if (scroll && scroll.el) {
      setTimeout(() => {
        scroll.el.scrollTo({ top: scroll.el.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <>
      {isRecruiter && (
        <div className="recruiter-nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '60px', background: 'rgba(2, 4, 10, 0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #f5c051', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', fontFamily: 'Outfit, sans-serif' }}>
          <div style={{ color: '#f5c051', fontWeight: 700, letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Briefcase size={20} /> RECRUITER MODE ACTIVE
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="#" style={{ color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>RESUME.PDF</a>
            <a href="https://www.linkedin.com/in/psdeepn/" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>LINKEDIN</a>
            <a href="#" style={{ color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>GITHUB</a>
          </div>
        </div>
      )}

      <div className="overlay-container">
        
        {/* LEVEL 1: HERO */}
        <section className="chapter hero-chapter">
          <div className="container">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1 }}
              className="hero-content"
            >
              <div className="status-badge pulse-border">
                <span className="pulse-dot"></span>
                System Online • Available for Global Deployment
              </div>
              
              <h1 className="hero-title">
                <span className="text-gradient">Sai Deepak</span>
                <br />
                <span className="text-gradient-cyan">XR & AI Systems Architect</span>
              </h1>
              
              <p className="hero-subtitle typewriter">
                &gt; Architecting immersive real-time 3D experiences.<br/>
                &gt; Integrating AI systems into enterprise XR.<br/>
                &gt; Building the future of spatial computing.
              </p>
              
              <div className="hero-actions">
                <button className="btn-premium btn-primary" onClick={scrollToJD}>
                  <Crosshair size={18} />
                  Initialize JD Radar
                </button>
                {!isRecruiter && (
                  <button className="btn-premium" onClick={() => window.dispatchEvent(new Event('toggle-minigame'))}>
                    <Crosshair size={18} />
                    Asteroid Defense
                  </button>
                )}
                <button className="btn-premium" onClick={onOpenAI}>
                  <MessageSquare size={18} />
                  Ask AI About Sai
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* LEVEL 2: ABOUT / IDENTITY */}
        <section className="chapter about-chapter">
          <div className="container">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="glass-panel about-card about-card-solid"
            >
              <div className="card-header">
                <BrainCircuit className="accent-icon" />
                <h2>Identity Protocol</h2>
              </div>
              <div className="card-body">
                <p>
                  I don't just write code. I build <strong>digital universes</strong>.
                  With 6+ years at the intersection of Reality and Data, 
                  I specialize in Unity, Unreal Engine, WebXR, and LLM Integration.
                </p>
                <p>
                  Currently leading immersive retail and enterprise training at 
                  <strong> Tech Mahindra (Haleon Project)</strong>.
                </p>
                
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-value text-gradient-cyan">6+</span>
                    <span className="stat-label">Years Exp</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value text-gradient-gold">AAA</span>
                    <span className="stat-label">Standards</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value text-gradient-cyan">100%</span>
                    <span className="stat-label">Execution</span>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="radar-title">Skill Profiling</h3>
                  <SkillRadar />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* LEVEL 3: TIMELINE */}
        <section className="chapter experience-chapter">
           <div className="container">
              <h2 className="chapter-title text-gradient">Mission Progression</h2>
              
              <div className="timeline">
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="timeline-item glass-panel"
                >
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h3>Senior XR Developer <span className="role-tag">Associate</span></h3>
                    <h4>Tech Mahindra</h4>
                    <span className="timeline-date">2022 - Present</span>
                    <ul className="timeline-bullets">
                      <li>Built and deployed interactive XR applications for healthcare and retail use cases</li>
                      <li>Developed real-time 3D systems using Unity for training, simulations, and product visualization</li>
                      <li>Optimized performance, improving responsiveness and reducing load times across devices</li>
                      <li>Designed responsive UI systems adaptable to multiple screen sizes and resolutions</li>
                      <li>Delivered WebGL applications with smooth performance and optimized asset pipelines</li>
                      <li>Collaborated with cross-functional teams to deliver production-grade applications</li>
                    </ul>

                    <div className="key-projects">
                      <h5 className="key-projects-title">Key Projects</h5>
                      
                      <div className="project-entry">
                        <h6>Medical Training Module</h6>
                        <p>Developed an interactive 3D medical experience showcasing real-time simulations and user interaction. Focused on clarity, usability, and performance for training environments.</p>
                      </div>

                      <div className="project-entry">
                        <h6>Retail Product Experience (WebGL)</h6>
                        <p>Built an immersive product visualization experience with interactive UI and smooth navigation, optimized for web deployment across devices.</p>
                      </div>

                      <div className="project-entry">
                        <h6>Interactive UI System</h6>
                        <p>Designed reusable UI components with animations, transitions, and responsive layouts for consistent user experience across XR and WebGL platforms.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="timeline-item glass-panel"
                >
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h3>Games Developer</h3>
                    <h4>7Seas Entertainment</h4>
                    <span className="timeline-date">2019 - 2022</span>
                    <ul className="timeline-bullets">
                      <li>Developed Android & iOS games using Unity</li>
                      <li>Built gameplay systems, UI/UX, and core mechanics</li>
                      <li>Implemented monetization systems including ad integrations</li>
                      <li>Worked on AR/VR prototypes and interactive experiences</li>
                      <li>Contributed across full product lifecycle from prototyping to release</li>
                    </ul>
                  </div>
                </motion.div>
              </div>
           </div>
        </section>

        {/* LEVEL 4: JD RADAR SCANNER */}
        <section id="jd-scanner" className="chapter fit-score-chapter">
          <div className="container">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass-panel radar-scanner"
            >
              <div className="radar-header">
                <Crosshair className="spin-icon" />
                <h2>Recruiter Target Lock</h2>
              </div>
              
              <div className="radar-body">
                <div className="radar-screen">
                   <div className="radar-sweep"></div>
                   <div className="target-node locked">95% Match</div>
                </div>
                
                <div className="match-details">
                  <div className="match-row">
                    <ShieldCheck size={16} color="#00f0ff" />
                    <span>Senior XR Developer — Unity</span>
                  </div>
                  <div className="match-row">
                    <ShieldCheck size={16} color="#00f0ff" />
                    <span>AI System & LLM</span>
                  </div>
                  <div className="match-row">
                    <ShieldCheck size={16} color="#00f0ff" />
                    <span>Ready to Relocate</span>
                  </div>
                </div>
              </div>
              
              <div className="radar-footer">
                <button 
                  className="btn-premium btn-primary w-full text-center" 
                  style={{justifyContent: 'center'}}
                  onClick={() => {
                    sounds.init();
                    sounds.playClickSound();
                    window.dispatchEvent(new CustomEvent('open-terminal', { detail: 'resume' }));
                  }}
                >
                  <Zap size={18} />
                  EXTRACT RESUME [PDF]
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* LEVEL 5: FOOTER */}
        <section className="chapter contact-chapter">
          <div className="container text-center">
            <h2 className="chapter-title text-gradient">System Readiness: 100%</h2>
            <p className="contact-subtitle">Currently interviewing for global opportunities.</p>
            
            <div className="contact-links">
              <a href="https://www.linkedin.com/in/psdeepn/" target="_blank" rel="noopener noreferrer" className="contact-link glass-panel">
                <Terminal size={18} />
                LinkedIn
              </a>
              <a href="mailto:psdeepn@gmail.com" className="contact-link glass-panel">
                <Globe2 size={18} />
                psdeepn@gmail.com
              </a>
              <a href="mailto:psdeepn@outlook.com" className="contact-link glass-panel">
                <Globe2 size={18} />
                psdeepn@outlook.com
              </a>
            </div>
            
            <ARCard />
            
            <p className="copyright">WARNING: DO NOT HIRE UNLESS PREPARED FOR RAPID SCALING.</p>
          </div>
        </section>
      </div>

      {/* Floating Hyper-Jump Button */}
      {!isRecruiter && (
        <button 
          className="hyper-jump-btn" 
          onClick={handleHyperJump}
          title="HYPER-JUMP TO CONTACT"
        >
          <Zap size={24} />
        </button>
      )}
    </>
  );
};

// Custom SVG Radar Chart for Skills
const radarData = [
  { label: 'Unity/C#', value: 95 },
  { label: 'Unreal/C++', value: 85 },
  { label: 'WebXR/React', value: 90 },
  { label: 'AI Systems', value: 88 },
  { label: 'Architecture', value: 92 },
];

function SkillRadar() {
  const size = 200;
  const center = size / 2;
  const radius = size * 0.35;
  const numPoints = radarData.length;
  const angleStep = (Math.PI * 2) / numPoints;

  // Calculate polygon points based on values
  const dataPoints = radarData.map((d, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = radius * (d.value / 100);
    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
  }).join(' ');

  // Base web grid
  const baseWeb = [0.25, 0.5, 0.75, 1].map(scale => {
    return radarData.map((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = radius * scale;
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    }).join(' ');
  });

  return (
    <div className="radar-chart-container">
      <svg viewBox={`0 0 ${size} ${size}`} className="radar-svg">
        {/* Draw Web */}
        {baseWeb.map((points, idx) => (
          <polygon key={idx} points={points} fill="none" stroke="rgba(0, 240, 255, 0.1)" strokeWidth="1" />
        ))}
        {/* Draw Axes */}
        {radarData.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          return (
            <line 
              key={`axis-${i}`}
              x1={center} y1={center} 
              x2={center + radius * Math.cos(angle)} 
              y2={center + radius * Math.sin(angle)} 
              stroke="rgba(0, 240, 255, 0.2)" strokeWidth="1" 
            />
          );
        })}
        {/* Draw Data Area */}
        <polygon 
          points={dataPoints} 
          fill="rgba(0, 240, 255, 0.2)" 
          stroke="#00f0ff" 
          strokeWidth="2" 
        />
        {/* Draw Points */}
        {radarData.map((d, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const r = radius * (d.value / 100);
          return (
            <circle 
              key={`pt-${i}`}
              cx={center + r * Math.cos(angle)} 
              cy={center + r * Math.sin(angle)} 
              r="3" 
              fill="#f5c051" 
            />
          );
        })}
        {/* Draw Labels */}
        {radarData.map((d, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const labelR = radius + 20;
          return (
            <text 
              key={`label-${i}`}
              x={center + labelR * Math.cos(angle)} 
              y={center + labelR * Math.sin(angle)} 
              fill="#94a3b8" 
              fontSize="10" 
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export default Overlay;
