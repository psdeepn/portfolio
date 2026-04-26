import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, X } from 'lucide-react';
import './Terminal.css';

export default function Terminal() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{ type: 'input' | 'output'; text: string }[]>([
    { type: 'output', text: 'SAI_DEEPAK_OS v3.1.4 [Authorized Personnel Only]' },
    { type: 'output', text: 'Type "help" for available commands.' },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleOpenTerminal = (e: any) => {
      setIsOpen(true);
      const cmd = e.detail;
      if (cmd) {
        setTimeout(() => {
          processCommand(cmd);
        }, 300); // slight delay for animation
      }
    };
    window.addEventListener('open-terminal', handleOpenTerminal as EventListener);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-terminal', handleOpenTerminal as EventListener);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const processCommand = (commandToProcess: string) => {
    const cmd = commandToProcess.trim().toLowerCase();
    const newHistory = [...history, { type: 'input' as const, text: `> ${commandToProcess}` }];
    
    let outputText = '';
    if (cmd === 'help') {
      outputText = 'Commands: help, clear, whoami, hire, resume';
    } else if (cmd === 'clear') {
      setHistory([]);
      setInput('');
      return;
    } else if (cmd === 'whoami') {
      outputText = 'Recruiter / Global Tech Leader exploring elite talent.';
    } else if (cmd === 'hire' || cmd === 'resume') {
      outputText = 'DECRYPTING RESUME FILE... [ACCESS GRANTED]. Initializing contact protocol. Please check your downloads or contact via LinkedIn.';
      // Simulate file download
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent('Sai Deepak - Elite XR Architect\n\nContact: sai.deepak@example.com\nLinkedIn: https://linkedin.com/in/sai-deepak');
        link.download = 'Sai_Deepak_AAA_Resume.txt';
        link.click();
      }, 1000);
    } else if (cmd !== '') {
      outputText = `Command not found: ${cmd}`;
    }

    if (outputText) {
      newHistory.push({ type: 'output' as const, text: outputText });
    }

    setHistory(newHistory);
    setInput('');
    
    // Auto scroll
    setTimeout(() => {
      const terminalBody = document.querySelector('.terminal-body');
      if (terminalBody) terminalBody.scrollTop = terminalBody.scrollHeight;
    }, 50);
  };

  const handleCommand = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      processCommand(input);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="terminal-overlay"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
        >
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-title">
                <TerminalIcon size={14} /> root@saideepak:~
              </div>
              <button className="close-btn" onClick={() => setIsOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="terminal-body">
              {history.map((line, i) => (
                <div key={i} className={`terminal-line ${line.type}`}>
                  {line.text}
                </div>
              ))}
              <div className="terminal-input-line">
                <span className="prompt">{'> '}</span>
                <input 
                  ref={inputRef}
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleCommand}
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
