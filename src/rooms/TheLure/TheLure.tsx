import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { usePersonalizationContext } from '../../context/PersonalizationContext';
import './TheLure.css';

interface Creature {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  glow: number;
  type: 'small' | 'medium' | 'jellyfish';
  angle: number;
  wobble: number;
  attracted: boolean;
}

interface DeepCreature {
  id: number;
  x: number;
  y: number;
  size: number;
  direction: number;
  speed: number;
}

export default function TheLure() {
  const { data } = usePersonalizationContext();
  const visits = data.roomVisits['lure'] || 0;
  
  const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [deepCreatures, setDeepCreatures] = useState<DeepCreature[]>([]);
  const [time, setTime] = useState(0);
  const [lureIntensity, setLureIntensity] = useState(1);
  
  const animationRef = useRef<number>(0);
  const creaturesRef = useRef<Creature[]>([]);
  const deepCreaturesRef = useRef<DeepCreature[]>([]);

  // More creatures with more visits
  const creatureCount = useMemo(() => Math.min(25, 8 + visits * 3), [visits]);
  
  // Lure radius increases with visits
  const lureRadius = useMemo(() => 150 + visits * 20, [visits]);

  // Status message
  const statusMessage = useMemo(() => {
    if (visits <= 1) return 'you are the light';
    if (visits <= 3) return 'they are drawn to you';
    if (visits <= 5) return 'you attract more each time';
    return 'they remember your glow';
  }, [visits]);

  // Initialize creatures
  useEffect(() => {
    const types: Array<'small' | 'medium' | 'jellyfish'> = ['small', 'small', 'small', 'medium', 'medium', 'jellyfish'];
    
    const initial: Creature[] = Array.from({ length: creatureCount }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 10 + Math.random() * 20,
      speed: 0.5 + Math.random() * 1.5,
      glow: 0.3 + Math.random() * 0.4,
      type: types[Math.floor(Math.random() * types.length)],
      angle: Math.random() * Math.PI * 2,
      wobble: Math.random() * Math.PI * 2,
      attracted: false,
    }));

    setCreatures(initial);
    creaturesRef.current = initial;

    // Deep background creatures (massive, slow, barely visible)
    const deep: DeepCreature[] = Array.from({ length: 3 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 200 + Math.random() * 300,
      direction: Math.random() > 0.5 ? 1 : -1,
      speed: 0.1 + Math.random() * 0.2,
    }));

    setDeepCreatures(deep);
    deepCreaturesRef.current = deep;
  }, [creatureCount]);

  // Track mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Lure pulse effect
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setLureIntensity(1 + Math.sin(Date.now() / 500) * 0.2);
    }, 50);
    return () => clearInterval(pulseInterval);
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    setTime(t => t + 0.016);

    // Update creatures
    const updatedCreatures = creaturesRef.current.map(c => {
      let { x, y, angle, wobble, attracted, speed, glow } = c;

      const dx = mousePos.x - x;
      const dy = mousePos.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Attraction zone based on lure radius
      const attractionStrength = Math.max(0, 1 - dist / (lureRadius * 2));
      attracted = dist < lureRadius * 1.5;

      if (attracted) {
        // Move toward cursor
        const targetAngle = Math.atan2(dy, dx);
        angle += (targetAngle - angle) * 0.05;
        
        // Slow down as they get very close
        const proximityFactor = Math.max(0.1, dist / 100);
        x += Math.cos(angle) * speed * proximityFactor * 2;
        y += Math.sin(angle) * speed * proximityFactor * 2;
        
        // Increase glow when attracted
        glow = Math.min(1, c.glow + attractionStrength * 0.3);
      } else {
        // Wander randomly
        wobble += 0.02;
        angle += Math.sin(wobble) * 0.05;
        x += Math.cos(angle) * speed * 0.3;
        y += Math.sin(angle) * speed * 0.3;
        
        // Dim glow when far
        glow = c.glow;
      }

      // Wrap around screen
      if (x < -50) x = window.innerWidth + 50;
      if (x > window.innerWidth + 50) x = -50;
      if (y < -50) y = window.innerHeight + 50;
      if (y > window.innerHeight + 50) y = -50;

      return { ...c, x, y, angle, wobble, attracted, glow };
    });

    creaturesRef.current = updatedCreatures;
    setCreatures([...updatedCreatures]);

    // Update deep creatures (slow background movement)
    const updatedDeep = deepCreaturesRef.current.map(d => {
      let { x, direction, speed } = d;
      x += direction * speed;
      
      if (x < -d.size) {
        x = window.innerWidth + d.size;
      }
      if (x > window.innerWidth + d.size) {
        x = -d.size;
      }

      return { ...d, x };
    });

    deepCreaturesRef.current = updatedDeep;
    setDeepCreatures([...updatedDeep]);

    animationRef.current = requestAnimationFrame(animate);
  }, [mousePos, lureRadius]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [animate]);

  // Debug reset
  const handleReset = () => {
    localStorage.removeItem('chaos-playground-data');
    window.location.reload();
  };

  return (
    <div className="lure-room">
      {/* Deep gradient background - NOT pure black */}
      <div className="deep-water" />

      {/* Subtle particle effect */}
      <div className="water-particles">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${15 + Math.random() * 20}s`,
            }}
          />
        ))}
      </div>

      {/* Deep background creatures - massive silhouettes */}
      {deepCreatures.map(d => (
        <div
          key={d.id}
          className="deep-creature"
          style={{
            left: d.x,
            top: d.y,
            width: d.size,
            height: d.size * 0.4,
            transform: `translate(-50%, -50%) scaleX(${d.direction})`,
          }}
        />
      ))}

      {/* The Lure (cursor light) */}
      <div
        className="lure"
        style={{
          left: mousePos.x,
          top: mousePos.y,
          '--lure-radius': `${lureRadius * lureIntensity}px`,
          '--lure-intensity': lureIntensity,
        } as React.CSSProperties}
      >
        <div className="lure-core" />
        <div className="lure-glow" />
        <div className="lure-outer" />
        
        {/* Lure tendril/stalk */}
        <div className="lure-stalk" />
      </div>

      {/* Creatures */}
      {creatures.map(c => {
        const distToLure = Math.sqrt(
          Math.pow(c.x - mousePos.x, 2) + Math.pow(c.y - mousePos.y, 2)
        );
        const nearLight = distToLure < lureRadius;
        
        return (
          <div
            key={c.id}
            className={`creature creature-${c.type} ${c.attracted ? 'attracted' : ''} ${nearLight ? 'illuminated' : ''}`}
            style={{
              left: c.x,
              top: c.y,
              '--creature-size': `${c.size}px`,
              '--creature-glow': c.glow,
              '--creature-angle': `${c.angle}rad`,
              transform: `translate(-50%, -50%) rotate(${c.angle}rad)`,
            } as React.CSSProperties}
          >
            {c.type === 'small' && (
              <>
                <div className="small-body" />
                <div className="small-tail" style={{ transform: `rotate(${Math.sin(time * 5 + c.id) * 30}deg)` }} />
              </>
            )}
            {c.type === 'medium' && (
              <>
                <div className="medium-body" />
                <div className="medium-fin top" style={{ transform: `rotate(${Math.sin(time * 3 + c.id) * 20}deg)` }} />
                <div className="medium-fin bottom" style={{ transform: `rotate(${-Math.sin(time * 3 + c.id) * 20}deg)` }} />
                <div className="medium-eye" />
              </>
            )}
            {c.type === 'jellyfish' && (
              <>
                <div className="jelly-bell" style={{ transform: `scaleY(${1 + Math.sin(time * 2 + c.id) * 0.2})` }} />
                <div className="jelly-tentacles">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="jelly-tentacle"
                      style={{
                        transform: `rotate(${Math.sin(time * 2 + c.id + i * 0.5) * 15}deg)`,
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        );
      })}

      {/* Stats */}
      <div className="lure-stats">
        <span>visits: {visits}</span>
        <span>creatures: {creatureCount}</span>
        <span>lure radius: {lureRadius}px</span>
      </div>

      <div className="lure-label">
        {statusMessage}
      </div>

      <button onClick={handleReset} className="debug-reset">Reset All Data</button>
    </div>
  );
}
