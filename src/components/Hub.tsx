import { useState, useEffect, useRef } from 'react';
import type { Room } from '../App';
import './Hub.css';

interface HubProps {
  onSelectRoom: (room: Room) => void;
}

interface RoomCard {
  id: Room;
  title: string;
  description: string;
  color: string;
  glow: string;
}

const rooms: RoomCard[] = [
  {
    id: 'typography',
    title: 'Living Typography',
    description: 'Letters that scatter, flee, and reform around you',
    color: '#fd79a8',
    glow: 'rgba(253, 121, 168, 0.4)',
  },
  {
    id: 'portrait',
    title: 'The Figure',
    description: 'A shape in the darkness. It watches. It reaches.',
    color: '#636e72',
    glow: 'rgba(99, 110, 114, 0.4)',
  },
  {
    id: 'aquarium',
    title: 'Aquarium',
    description: 'Observe the deep. The creatures drift through darkness.',
    color: '#74b9ff',
    glow: 'rgba(116, 185, 255, 0.4)',
  },
  {
    id: 'forest',
    title: 'Forest',
    description: 'Geometric trees. Animals that are clearly approximations.',
    color: '#55efc4',
    glow: 'rgba(85, 239, 196, 0.4)',
  },
  {
    id: 'pet',
    title: 'The Creature',
    description: 'A strange, gentle thing. It floats near you.',
    color: '#b8a0c8',
    glow: 'rgba(184, 160, 200, 0.4)',
  },
  {
    id: 'abyss',
    title: 'The Abyss',
    description: 'Darkness. Points of light. Something moves out there.',
    color: '#4a90a0',
    glow: 'rgba(74, 144, 160, 0.4)',
  },
];

export default function Hub({ onSelectRoom }: HubProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Subtle parallax effect for cards based on mouse position
  const getCardStyle = (index: number) => {
    if (!containerRef.current) return {};
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const offsetX = (mousePos.x - centerX) / 50;
    const offsetY = (mousePos.y - centerY) / 50;
    const depth = (index % 3) * 0.5 + 1;
    
    return {
      transform: `translate(${offsetX * depth}px, ${offsetY * depth}px)`,
    };
  };

  return (
    <div className="hub" ref={containerRef}>
      {/* Animated background gradient */}
      <div 
        className="hub-bg"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, 
            rgba(100, 100, 150, 0.15) 0%, 
            transparent 50%)`,
        }}
      />
      
      {/* Floating particles in background */}
      <div className="hub-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i} 
            className="hub-particle"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${8 + (i % 5) * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="hub-content">
        <h1 className="hub-title">
          <span className="title-char" style={{ animationDelay: '0s' }}>C</span>
          <span className="title-char" style={{ animationDelay: '0.05s' }}>H</span>
          <span className="title-char" style={{ animationDelay: '0.1s' }}>A</span>
          <span className="title-char" style={{ animationDelay: '0.15s' }}>O</span>
          <span className="title-char" style={{ animationDelay: '0.2s' }}>S</span>
          <span className="title-space"> </span>
          <span className="title-char" style={{ animationDelay: '0.3s' }}>P</span>
          <span className="title-char" style={{ animationDelay: '0.35s' }}>L</span>
          <span className="title-char" style={{ animationDelay: '0.4s' }}>A</span>
          <span className="title-char" style={{ animationDelay: '0.45s' }}>Y</span>
          <span className="title-char" style={{ animationDelay: '0.5s' }}>G</span>
          <span className="title-char" style={{ animationDelay: '0.55s' }}>R</span>
          <span className="title-char" style={{ animationDelay: '0.6s' }}>O</span>
          <span className="title-char" style={{ animationDelay: '0.65s' }}>U</span>
          <span className="title-char" style={{ animationDelay: '0.7s' }}>N</span>
          <span className="title-char" style={{ animationDelay: '0.75s' }}>D</span>
        </h1>
        <p className="hub-subtitle">Pick a room. Get lost.</p>

        <div className="room-grid">
          {rooms.map((room, index) => (
            <button
              key={room.id}
              className={`room-card ${hoveredCard === room.id ? 'hovered' : ''}`}
              onClick={() => onSelectRoom(room.id)}
              onMouseEnter={() => setHoveredCard(room.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                ...getCardStyle(index),
                '--card-color': room.color,
                '--card-glow': room.glow,
              } as React.CSSProperties}
            >
              <div className="card-inner">
                <div className="card-preview">
                  <div className="preview-animation" />
                </div>
                <h2 className="card-title">{room.title}</h2>
                <p className="card-description">{room.description}</p>
              </div>
              <div className="card-glow" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
