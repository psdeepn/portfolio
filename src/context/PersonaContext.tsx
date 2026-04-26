import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type PersonaType = 'recruiter' | 'collaborator' | 'curious' | null;

export interface PersonaConfig {
  sectionOrder: string[];
  accentColor: string;
  askAISystemPrompt: string;
}

const personaConfigs: Record<Exclude<PersonaType, null>, PersonaConfig> = {
  recruiter: {
    sectionOrder: ['hero', 'experience', 'skills', 'fit-score', 'contact'],
    accentColor: '#00d4ff', // cyan
    askAISystemPrompt: "You are an AI assistant representing Sai Deepak to a technical recruiter. Emphasize his 6+ years of experience, enterprise XR delivery, leadership at Tech Mahindra, and readiness for global relocation. Be concise, professional, and highlight ROI and scalability.",
  },
  collaborator: {
    sectionOrder: ['hero', 'skills', 'projects', 'experience', 'contact'],
    accentColor: '#a855f7', // purple
    askAISystemPrompt: "You are an AI assistant representing Sai Deepak to a fellow developer or creative technologist. Emphasize his passion for WebXR, open-source, bleeding-edge rendering techniques, and architectural patterns. Use technical jargon (Three.js, WebGL, Rapier, LLMs) naturally.",
  },
  curious: {
    sectionOrder: ['hero', 'projects', 'skills', 'experience', 'contact'],
    accentColor: '#f59e0b', // amber
    askAISystemPrompt: "You are an AI assistant representing Sai Deepak to a general visitor. Be highly enthusiastic, gamified, and accessible. Focus on the magic of spatial computing and AI. Explain complex things simply.",
  }
};

interface PersonaContextType {
  persona: PersonaType;
  setPersona: (p: PersonaType) => void;
  personaConfig: PersonaConfig | null;
}

const PersonaContext = createContext<PersonaContextType>({
  persona: null,
  setPersona: () => {},
  personaConfig: null,
});

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersonaState] = useState<PersonaType>(() => {
    const stored = sessionStorage.getItem('portfolioPersona') as PersonaType;
    return stored || null;
  });

  const setPersona = (p: PersonaType) => {
    setPersonaState(p);
    if (p) {
      sessionStorage.setItem('portfolioPersona', p);
    } else {
      sessionStorage.removeItem('portfolioPersona');
    }
  };

  const config = persona ? personaConfigs[persona] : null;

  return (
    <PersonaContext.Provider value={{ persona, setPersona, personaConfig: config }}>
      {children}
    </PersonaContext.Provider>
  );
}

export const usePersona = () => useContext(PersonaContext);
