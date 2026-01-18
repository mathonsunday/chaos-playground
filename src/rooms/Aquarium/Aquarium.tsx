import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { usePersonalizationContext } from '../../context/PersonalizationContext';
import { useDebugOverrides } from '../../hooks/useDebugOverrides';
import { useResetData } from '../../hooks/useResetData';
import { DebugPanel } from '../../components/DebugPanel';
import './Aquarium.css';

interface AquariumProps {
  /** When true, enables focus mode with wave evolution and no cursor interaction */
  focusMode?: boolean;
}

interface Jellyfish {
  id: number;
  x: number;
  y: number;
  size: number;
  pulsePhase: number;
  driftPhase: number;
  opacity: number;
  depth: number;
}

interface Fish {
  id: number;
  x: number;
  y: number;
  vx: number;
  size: number;
  depth: number;
  bodyHue: number;
  tailPhase: number;
  type: 'long' | 'round' | 'flat';
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

export default function Aquarium({ focusMode = false }: AquariumProps) {
  const { data, getTimeOfDay } = usePersonalizationContext();
  const visits = data.roomVisits['aquarium'] || 0;

  const { effectiveValue: effectiveVisits, debugOverride: debugVisits, setDebugOverride: setDebugVisits, debugLateNight, setDebugLateNight } = useDebugOverrides({
    focusMode,
    actualValue: visits,
    waveEvolutionConfig: {
      min: 1,
      max: 8,
      cycleDuration: 45 * 60 * 1000,
    },
  });

  const [jellyfish, setJellyfish] = useState<Jellyfish[]>([]);
  const [fish, setFish] = useState<Fish[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [time, setTime] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const animationRef = useRef<number>(0);
  const jellyfishRef = useRef<Jellyfish[]>([]);
  const fishRef = useRef<Fish[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  const handleReset = useResetData();
  const isLateNight = debugLateNight !== null ? debugLateNight : getTimeOfDay() === 'late';

  // Creature counts scale with visits
  const jellyfishCount = useMemo(() => Math.min(8, 2 + effectiveVisits), [effectiveVisits]);
  const fishCount = useMemo(() => Math.min(20, 6 + effectiveVisits * 2), [effectiveVisits]);
  
  // Rare creature appears after 5+ visits
  const showRareCreature = effectiveVisits >= 5;
  
  // Fish attraction to cursor - DISABLED in focus mode for pure passive viewing
  const cursorAttraction = useMemo(() => {
    if (focusMode) return 0; // No cursor interaction in focus mode
    if (effectiveVisits <= 1) return 0;
    return Math.min(1, effectiveVisits * 0.15);
  }, [focusMode, effectiveVisits]);

  // Status message
  const statusMessage = useMemo(() => {
    if (effectiveVisits <= 1) return 'observe';
    if (effectiveVisits <= 3) return 'the creatures notice you';
    if (effectiveVisits <= 6) return 'they drift toward you';
    return 'they know you now';
  }, [effectiveVisits]);

  // Initialize creatures based on counts
  useEffect(() => {
    const initialJellyfish: Jellyfish[] = Array.from({ length: jellyfishCount }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 50,
      size: 80 + Math.random() * 60,
      pulsePhase: Math.random() * Math.PI * 2,
      driftPhase: Math.random() * Math.PI * 2,
      opacity: 0.6 + Math.random() * 0.3,
      depth: Math.random(),
    }));

    const fishTypes: Array<'long' | 'round' | 'flat'> = ['long', 'round', 'flat'];
    const initialFish: Fish[] = Array.from({ length: fishCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: 30 + Math.random() * 50,
      vx: (Math.random() - 0.5) * 2,
      size: 20 + Math.random() * 40,
      depth: Math.random(),
      bodyHue: Math.random() * 360,
      tailPhase: Math.random() * Math.PI * 2,
      type: fishTypes[Math.floor(Math.random() * fishTypes.length)],
    }));

    const initialParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      speed: 0.005 + Math.random() * 0.01,
      opacity: 0.05 + Math.random() * 0.1,
    }));

    setJellyfish(initialJellyfish);
    setFish(initialFish);
    setParticles(initialParticles);
    jellyfishRef.current = initialJellyfish;
    fishRef.current = initialFish;
    particlesRef.current = initialParticles;
  }, [jellyfishCount, fishCount]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const animate = useCallback(() => {
    setTime(t => t + 0.016);

    const mouseXPercent = (mousePos.x / window.innerWidth) * 100;
    const mouseYPercent = (mousePos.y / window.innerHeight) * 100;

    // Update jellyfish
    const updatedJelly = jellyfishRef.current.map(j => {
      let { x, y, pulsePhase, driftPhase } = j;
      
      // Gentle drift
      x += Math.sin(driftPhase + time * 0.3) * 0.02;
      y -= 0.03 + Math.sin(pulsePhase + time) * 0.02;
      
      // Slight attraction to cursor if visits > 1
      if (cursorAttraction > 0) {
        const dx = mouseXPercent - x;
        const dy = mouseYPercent - y;
        x += dx * cursorAttraction * 0.0005;
        y += dy * cursorAttraction * 0.0005;
      }
      
      // Wrap
      if (y < -10) y = 110;
      if (x < -5) x = 105;
      if (x > 105) x = -5;

      return { ...j, x, y };
    });
    jellyfishRef.current = updatedJelly;
    setJellyfish([...updatedJelly]);

    // Update fish
    const updatedFish = fishRef.current.map(f => {
      let { x, y, vx, tailPhase } = f;
      
      x += vx * 0.1;
      tailPhase += Math.abs(vx) * 0.3;
      
      // Attraction to cursor based on visits
      if (cursorAttraction > 0) {
        const dx = mouseXPercent - x;
        const dy = mouseYPercent - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 30) {
          // Move toward cursor
          x += dx * cursorAttraction * 0.01;
          y += dy * cursorAttraction * 0.01;
        }
      }
      
      // Wrap and possibly change direction
      if (x < -10) {
        x = 110;
        vx = -Math.abs(vx);
      }
      if (x > 110) {
        x = -10;
        vx = Math.abs(vx);
      }

      // Occasionally change direction
      if (Math.random() < 0.002) {
        vx = -vx;
      }

      return { ...f, x, y, vx, tailPhase };
    });
    fishRef.current = updatedFish;
    setFish([...updatedFish]);

    // Update particles
    const updatedParticles = particlesRef.current.map(p => {
      let { y } = p;
      y -= p.speed;
      if (y < -5) y = 105;
      return { ...p, y };
    });
    particlesRef.current = updatedParticles;
    setParticles([...updatedParticles]);

    animationRef.current = requestAnimationFrame(animate);
  }, [time, mousePos, cursorAttraction]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [animate]);

  // Light rays follow mouse slightly (but not in focus mode)
  const lightX = focusMode
    ? 50 + Math.sin(time * 0.1) * 10 // Gentle automatic drift in focus mode
    : 50 + (mousePos.x / window.innerWidth - 0.5) * 20;

  return (
    <div className={`aquarium-room ${isLateNight ? 'late-night' : ''} ${focusMode ? 'focus-mode' : ''}`}>
      {/* Deep water gradient */}
      <div className="water-depth" />
      
      {/* Caustic light patterns */}
      <div 
        className="caustics"
        style={{
          backgroundPosition: `${time * 20}px ${time * 10}px`,
        }}
      />
      
      {/* Light rays from surface */}
      <div className="light-rays">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="light-ray"
            style={{
              left: `${lightX - 15 + i * 8}%`,
              opacity: 0.1 + Math.sin(time + i) * 0.05,
              transform: `rotate(${5 + i * 2}deg)`,
            }}
          />
        ))}
      </div>

      {/* Floating particles/debris */}
      <div className="particles-layer">
        {particles.map(p => (
          <div
            key={p.id}
            className="water-particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
            }}
          />
        ))}
      </div>

      {/* Rare deep sea creature - only after 5+ visits */}
      {showRareCreature && (
        <div 
          className="rare-creature"
          style={{
            left: `${50 + Math.sin(time * 0.2) * 30}%`,
            top: `${75 + Math.sin(time * 0.15) * 10}%`,
          }}
        >
          <div className="angler-body" />
          <div className="angler-lure">
            <div 
              className="lure-light"
              style={{
                opacity: 0.6 + Math.sin(time * 3) * 0.4,
                transform: `scale(${1 + Math.sin(time * 3) * 0.3})`,
              }}
            />
          </div>
          <div className="angler-eye" />
          <div className="angler-teeth">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="tooth" />
            ))}
          </div>
          <div 
            className="angler-fin"
            style={{
              transform: `rotate(${Math.sin(time * 2) * 15}deg)`,
            }}
          />
        </div>
      )}

      {/* Jellyfish */}
      {jellyfish.map(j => {
        const pulse = Math.sin(time * 1.5 + j.pulsePhase);
        const bellSquish = 1 + pulse * 0.2;
        const blur = j.depth < 0.3 ? 2 : j.depth > 0.7 ? 0 : 1;
        
        return (
          <div
            key={j.id}
            className={`jellyfish ${isLateNight ? 'bioluminescent' : ''}`}
            style={{
              left: `${j.x}%`,
              top: `${j.y}%`,
              '--jelly-size': `${j.size}px`,
              opacity: j.opacity,
              filter: `blur(${blur}px)`,
              zIndex: Math.floor(j.depth * 10),
            } as React.CSSProperties}
          >
            <div 
              className="jelly-bell"
              style={{
                transform: `scaleX(${1 / bellSquish}) scaleY(${bellSquish})`,
              }}
            >
              <div className="bell-inner" />
              <div className="bell-rim" />
              <div className="jelly-organs">
                <div className="organ" />
                <div className="organ" />
                <div className="organ" />
                <div className="organ" />
              </div>
            </div>
            
            <div className="oral-arms">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="oral-arm"
                  style={{
                    transform: `rotate(${-15 + i * 10 + Math.sin(time * 2 + i) * 5}deg)`,
                  }}
                />
              ))}
            </div>
            
            <div className="tentacles">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="tentacle"
                  style={{
                    left: `${15 + i * 6}%`,
                    height: `${60 + Math.sin(time * 1.5 + i * 0.5) * 20}px`,
                    transform: `rotate(${Math.sin(time + i * 0.3) * 8}deg)`,
                    opacity: 0.3 + Math.random() * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Fish */}
      {fish.map(f => {
        const blur = f.depth < 0.3 ? 1.5 : f.depth > 0.7 ? 0 : 0.5;
        const scale = 0.7 + f.depth * 0.6;
        const isFlipped = f.vx < 0;
        
        return (
          <div
            key={f.id}
            className={`fish fish-${f.type}`}
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
              '--fish-size': `${f.size}px`,
              '--fish-hue': f.bodyHue,
              transform: `scale(${scale}) scaleX(${isFlipped ? -1 : 1})`,
              filter: `blur(${blur}px)`,
              zIndex: Math.floor(f.depth * 10),
            } as React.CSSProperties}
          >
            <div className="fish-body">
              <div className="scales" />
              <div className="lateral-line" />
            </div>
            <div 
              className="fish-tail"
              style={{
                transform: `rotate(${Math.sin(f.tailPhase) * 25}deg)`,
              }}
            />
            <div className="fish-dorsal" />
            <div className="fish-pectoral" />
            <div className="fish-eye">
              <div className="fish-pupil" />
            </div>
          </div>
        );
      })}

      {/* Simple dark bottom gradient */}
      <div className="ocean-floor-simple" />

      {/* Stats */}
      <div className="aquarium-stats">
        <span>visits: {effectiveVisits}</span>
        <span>jellyfish: {jellyfishCount}</span>
        <span>fish: {fishCount}</span>
        {showRareCreature && <span className="rare-indicator">rare creature visible</span>}
        {isLateNight && <span className="late-indicator">bioluminescence active</span>}
      </div>

      <div className="aquarium-label">
        {statusMessage}
      </div>

      <DebugPanel
        debugValue={debugVisits}
        onDebugValueChange={setDebugVisits}
        debugLateNight={debugLateNight}
        onDebugLateNightChange={setDebugLateNight}
        visitButtons={[1, 3, 5, 8]}
      />

      <button onClick={handleReset} className="debug-reset">Reset All Data</button>
    </div>
  );
}
