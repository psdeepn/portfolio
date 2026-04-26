/* eslint-disable react-hooks/purity */
import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Bot } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { sounds } from '../utils/soundEffects';
import * as THREE from 'three';
import './AskAI.css';

interface AskAIProps {
  onClose: () => void;
}

type Message = {
  role: 'user' | 'ai';
  text: string | ReactNode;
};

const SUGGESTED_PROMPTS = [
  "Tell me about the Haleon project",
  "What is your XR Tech Stack?",
  "Are you open to relocation?",
  "What was your biggest impact?",
];

function AICore({ isTyping }: { isTyping: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!groupRef.current || !ringRef.current) return;
    
    // Base rotation
    groupRef.current.rotation.y += isTyping ? 0.1 : 0.01;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.2;
    
    // Ring rotation
    ringRef.current.rotation.z -= isTyping ? 0.05 : 0.005;
    ringRef.current.rotation.x = Math.PI / 2 + (isTyping ? Math.sin(state.clock.elapsedTime * 10) * 0.1 : 0);
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={groupRef as any}>
        <mesh>
          <icosahedronGeometry args={[1, 2]} />
          <meshPhysicalMaterial 
            color={isTyping ? "#f5c051" : "#00f0ff"} 
            emissive={isTyping ? "#f5c051" : "#00f0ff"}
            emissiveIntensity={isTyping ? 2 : 0.5}
            wireframe 
          />
        </mesh>
        <mesh ref={ringRef as any} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.05, 16, 50]} />
          <meshStandardMaterial 
            color={isTyping ? "#f5c051" : "#ffffff"} 
            emissive={isTyping ? "#f5c051" : "#00f0ff"}
            emissiveIntensity={isTyping ? 1 : 0.2}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function AskAI({ onClose }: AskAIProps) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'ai', 
      text: 'Initializing Sai_AI Protocol. I am equipped to discuss Sai Deepak\'s XR capabilities, architectural decisions, and relocation readiness. Ask me anything or select a prompt below.' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle typing sound loop
  useEffect(() => {
    if (isTyping) {
      typingIntervalRef.current = window.setInterval(() => {
        sounds.playTypingSound();
      }, 100);
    } else {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    }
    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, [isTyping]);

  const handleSend = (textOverride?: string) => {
    sounds.init(); // Initialize audio context on first interaction
    
    const userMsg = textOverride || input.trim();
    if (!userMsg) return;
    
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    // Advanced NLP Engine (Streaming Mock)
    setTimeout(() => {
      let rawResponse = '';
      const lower = userMsg.toLowerCase();
      
      if (/haleon|tech mahindra|project|work|impact/i.test(lower)) {
        rawResponse = 'At Tech Mahindra (Haleon Project), Sai engineered a massive enterprise XR architecture resulting in a 40% increase in training retention, ultra-low latency physics synchronization, and seamless integration of LLMs for procedural NPCs. He builds systems that scale globally, not just shiny demos.';
      } else if (/stack|tech|skills|unity|unreal|tools/i.test(lower)) {
        rawResponse = 'His core arsenal includes the best of the best: Unity (DOTS/URP), Unreal Engine 5, WebXR / React Three Fiber, Python / AI Integration, and C# / C++.';
      } else if (/relocate|visa|location|where|aus|can|ger|sg/i.test(lower)) {
        rawResponse = 'Sai is fully prepped for immediate global deployment. Target zones: Australia, Canada, Germany, Singapore. He is also highly experienced in leading remote, distributed teams.';
      } else if (/contact|hire|email|reach|phone/i.test(lower)) {
        rawResponse = 'Ready to bring AAA capabilities to your team? Initialize a secure email channel to sai.deepak@example.com.';
      } else if (/hello|hi|hey|greetings/i.test(lower)) {
        rawResponse = 'System nominal. How can I assist you with evaluating Sai Deepak today?';
      } else {
        rawResponse = 'My semantic analysis indicates you are evaluating elite technical talent. Sai Deepak is an XR systems architect capable of delivering AAA product experiences. What specific domain (Enterprise, Retail, WebXR) are you hiring for?';
      }

      setIsTyping(false);
      
      const words = rawResponse.split(' ');
      setMessages(prev => [...prev, { role: 'ai', text: '' }]);
      
      let i = 0;
      const streamInterval = setInterval(() => {
        if (i < words.length) {
          setMessages(prev => {
            const newMsgs = [...prev];
            // Clone the last message to avoid mutating state directly
            const lastMsg = { ...newMsgs[newMsgs.length - 1] };
            lastMsg.text = (lastMsg.text as string) + (i === 0 ? '' : ' ') + words[i];
            newMsgs[newMsgs.length - 1] = lastMsg;
            return newMsgs;
          });
          sounds.playTypingSound();
          i++;
        } else {
          clearInterval(streamInterval);
          sounds.playClickSound();
        }
      }, 70);

    }, 800 + Math.random() * 400);
  };

  return (
    <motion.div 
      className="ask-ai-overlay"
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <div className="ask-ai-header">
        <div className="ai-title">
          <Bot size={20} className="ai-icon" />
          <span>SAI_AI // TARGET_LOCKED</span>
        </div>
        <button className="close-btn" onClick={onClose}><X size={20} /></button>
      </div>

      <div className="ai-avatar-container">
        <Canvas camera={{ position: [0, 0, 4] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#00f0ff" />
          <AICore isTyping={isTyping} />
        </Canvas>
      </div>

      <div className="ask-ai-body">
        {messages.map((msg, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={idx} 
            className={`chat-bubble ${msg.role}`}
          >
            {msg.text}
          </motion.div>
        ))}
        
        {isTyping && (
          <div className="chat-bubble ai typing">
            <span className="dot"></span><span className="dot"></span><span className="dot"></span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="ask-ai-suggestions">
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <button 
            key={i} 
            className="suggestion-chip" 
            onClick={() => handleSend(prompt)}
            onMouseEnter={() => { sounds.init(); sounds.playHoverSound(); }}
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="ask-ai-footer">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Enter query parameters..." 
        />
        <button onClick={() => handleSend()}><Send size={18} /></button>
      </div>
    </motion.div>
  );
}
