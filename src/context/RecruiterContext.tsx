import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface RecruiterContextType {
  isRecruiter: boolean;
  setIsRecruiter: (value: boolean) => void;
}

const RecruiterContext = createContext<RecruiterContextType>({
  isRecruiter: false,
  setIsRecruiter: () => {},
});

export function RecruiterProvider({ children }: { children: ReactNode }) {
  const [isRecruiter, setIsRecruiter] = useState(false);

  useEffect(() => {
    // Check session storage first
    const stored = sessionStorage.getItem('portfolioMode');
    if (stored === 'recruiter') {
      setIsRecruiter(true);
      return;
    }

    // Check URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'recruiter') {
      setIsRecruiter(true);
      sessionStorage.setItem('portfolioMode', 'recruiter');
      return;
    }

    // Check Referrer
    const referrer = document.referrer.toLowerCase();
    if (
      referrer.includes('linkedin') ||
      referrer.includes('greenhouse') ||
      referrer.includes('lever') ||
      referrer.includes('workday')
    ) {
      setIsRecruiter(true);
      sessionStorage.setItem('portfolioMode', 'recruiter');
    }
  }, []);

  const handleSetRecruiter = (val: boolean) => {
    setIsRecruiter(val);
    sessionStorage.setItem('portfolioMode', val ? 'recruiter' : 'full');
  };

  return (
    <RecruiterContext.Provider value={{ isRecruiter, setIsRecruiter: handleSetRecruiter }}>
      {children}
    </RecruiterContext.Provider>
  );
}

export const useRecruiter = () => useContext(RecruiterContext);
