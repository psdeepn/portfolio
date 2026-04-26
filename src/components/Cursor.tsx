import { useEffect, useState } from 'react';
import './Cursor.css';

export default function Cursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setTrail((prev) => [...prev, { x: e.clientX, y: e.clientY }].slice(-12));
    };

    const onMouseDown = () => setClicked(true);
    const onMouseUp = () => setClicked(false);

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') ||
        target.closest('a')
      ) {
        setHovered(true);
      } else {
        setHovered(false);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mouseover', onMouseOver);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseover', onMouseOver);
    };
  }, []);

  useEffect(() => {
    if (trail.length > 0) {
      const timer = setTimeout(() => {
        setTrail((prev) => prev.slice(1));
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [trail]);

  return (
    <>
      {trail.map((pt, i) => (
        <div 
          key={i}
          className="cursor-trail-dot"
          style={{ 
            left: `${pt.x}px`, 
            top: `${pt.y}px`,
            opacity: (i + 1) / trail.length,
            transform: `scale(${(i + 1) / trail.length})`
          }}
        />
      ))}
      <div 
        className={`cursor-dot ${clicked ? 'clicked' : ''}`}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
      />
      <div 
        className={`cursor-ring ${hovered ? 'hovered' : ''}`}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
      >
        {hovered && (
          <svg className="cursor-brackets" viewBox="0 0 100 100">
            <path d="M 20 10 L 10 10 L 10 20" stroke="#00f0ff" strokeWidth="4" fill="none" />
            <path d="M 80 10 L 90 10 L 90 20" stroke="#00f0ff" strokeWidth="4" fill="none" />
            <path d="M 20 90 L 10 90 L 10 80" stroke="#00f0ff" strokeWidth="4" fill="none" />
            <path d="M 80 90 L 90 90 L 90 80" stroke="#00f0ff" strokeWidth="4" fill="none" />
          </svg>
        )}
      </div>
    </>
  );
}
