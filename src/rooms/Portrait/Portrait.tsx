import { useState, useEffect, useRef, useMemo } from 'react';
import { usePersonalizationContext, roomDisplayNames } from '../../context/PersonalizationContext';
import './Portrait.css';

export default function Portrait() {
  const { data, getTimeOfDay, getFavoriteRoom } = usePersonalizationContext();
  const visits = data.roomVisits['portrait'] || 0;
  
  const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [time, setTime] = useState(0);
  const [flicker, setFlicker] = useState(1);
  const [armReach, setArmReach] = useState(0);
  
  // Debug overrides
  const [debugVisits, setDebugVisits] = useState<number | null>(null);
  const [debugLateNight, setDebugLateNight] = useState<boolean | null>(null);
  
  const animationRef = useRef<number>(0);

  // Effective values
  const effectiveVisits = debugVisits !== null ? debugVisits : visits;
  const isLateNight = debugLateNight !== null ? debugLateNight : getTimeOfDay() === 'late';
  const favorite = getFavoriteRoom();

  // Figure gets closer and larger with visits
  const proximity = useMemo(() => {
    // 0 = far (first visit), 1 = very close (10+ visits)
    return Math.min(1, effectiveVisits / 10);
  }, [effectiveVisits]);

  // Scale: starts at 0.6, grows to 1.3
  const figureScale = 0.6 + proximity * 0.7;
  
  // Position: starts high, moves down (closer to viewer)
  const figureTop = 50 - proximity * 15; // 50% -> 35%
  
  // Arm reach chance increases with visits
  const armReachChance = 0.05 + proximity * 0.2;
  const armReachIntensity = 0.6 + proximity * 0.6;
  
  // Eye glow intensity
  const eyeIntensity = 0.5 + proximity * 0.5;

  // Status message changes
  const statusMessage = useMemo(() => {
    if (effectiveVisits <= 1) return 'something is there';
    if (effectiveVisits <= 3) return 'it has noticed you';
    if (effectiveVisits <= 6) return 'it remembers you';
    if (effectiveVisits <= 10) return 'it has been waiting';
    return 'it is so close now';
  }, [effectiveVisits]);

  // Favorite room reference
  const favoriteHint = useMemo(() => {
    if (!favorite || favorite === 'portrait') return null;
    if (effectiveVisits < 5) return null;
    const name = roomDisplayNames[favorite];
    return name ? `it knows you visit ${name}` : null;
  }, [favorite, effectiveVisits]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animation
  useEffect(() => {
    const animate = () => {
      setTime(t => t + 0.02);
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  // Random flicker - more frequent at night and with more visits
  useEffect(() => {
    const flickerChance = isLateNight ? 0.2 : 0.1;
    const flickerInterval = setInterval(() => {
      if (Math.random() < flickerChance) {
        setFlicker(0.2 + Math.random() * 0.3);
        setTimeout(() => setFlicker(1), 30 + Math.random() * 80);
      }
    }, isLateNight ? 100 : 200);
    return () => clearInterval(flickerInterval);
  }, [isLateNight]);

  // Occasionally reach toward cursor - more often with more visits
  useEffect(() => {
    const reachInterval = setInterval(() => {
      if (Math.random() < armReachChance) {
        setArmReach(armReachIntensity + Math.random() * 0.3);
        setTimeout(() => setArmReach(0), 800 + Math.random() * 1500);
      }
    }, isLateNight ? 2000 : 3000);
    return () => clearInterval(reachInterval);
  }, [armReachChance, armReachIntensity, isLateNight]);

  // Figure leans toward cursor - more pronounced with visits
  const centerX = window.innerWidth / 2;
  const leanAmount = 5 + proximity * 8;
  const lean = (mousePos.x - centerX) / centerX * leanAmount;
  
  // Eyes track cursor - more intense with visits
  const figureY = window.innerHeight * (figureTop / 100);
  const trackIntensity = 1 + proximity * 0.5;
  const eyeTrackX = Math.max(-1, Math.min(1, (mousePos.x - centerX) / 400)) * trackIntensity;
  const eyeTrackY = Math.max(-1, Math.min(1, (mousePos.y - figureY) / 300)) * trackIntensity;

  // Breathing/swaying - faster at night
  const breatheSpeed = isLateNight ? 1.2 : 0.8;
  const breathe = Math.sin(time * breatheSpeed) * 3;
  const sway = Math.sin(time * 0.5) * 2;

  // Arm reaches toward cursor
  const armAngle = Math.atan2(mousePos.y - figureY, mousePos.x - centerX);

  // Debug reset
  const handleReset = () => {
    localStorage.removeItem('chaos-playground-data');
    window.location.reload();
  };

  return (
    <div className={`portrait-room ${isLateNight ? 'late-night' : ''}`}>
      {/* Dark foggy background */}
      <div className="fog-layer fog-1" />
      <div className="fog-layer fog-2" />
      
      {/* The Figure */}
      <div 
        className="the-figure"
        style={{
          opacity: flicker,
          transform: `translate(-50%, -50%) rotate(${lean + sway}deg) scale(${figureScale})`,
          top: `${figureTop}%`,
        }}
      >
        {/* Shadow/aura behind figure */}
        <div 
          className="figure-shadow" 
          style={{ opacity: 0.5 + proximity * 0.3 }}
        />
        
        {/* Long flowing cloak/body */}
        <div 
          className="figure-body"
          style={{
            transform: `scaleX(${1 + breathe * 0.01})`,
          }}
        >
          <div className="tatter tatter-1" />
          <div className="tatter tatter-2" />
          <div className="tatter tatter-3" />
          <div className="tatter tatter-4" />
          <div className="tatter tatter-5" />
        </div>

        {/* Head area */}
        <div className="figure-head">
          <div className="hood" />
          
          <div className="face-void">
            {/* Eyes - glow increases with visits */}
            <div 
              className="eye left-eye"
              style={{
                transform: `translate(${eyeTrackX * 3}px, ${eyeTrackY * 2}px)`,
                boxShadow: `
                  0 0 ${10 * eyeIntensity}px #ff0000,
                  0 0 ${20 * eyeIntensity}px #ff0000,
                  0 0 ${30 * eyeIntensity}px rgba(255, 0, 0, ${eyeIntensity})
                `,
              }}
            >
              <div className="eye-glow" />
            </div>
            <div 
              className="eye right-eye"
              style={{
                transform: `translate(${eyeTrackX * 3}px, ${eyeTrackY * 2}px)`,
                boxShadow: `
                  0 0 ${10 * eyeIntensity}px #ff0000,
                  0 0 ${20 * eyeIntensity}px #ff0000,
                  0 0 ${30 * eyeIntensity}px rgba(255, 0, 0, ${eyeIntensity})
                `,
              }}
            >
              <div className="eye-glow" />
            </div>
            
            <div className="mouth-shadow" />
          </div>
        </div>

        {/* Arms */}
        <div 
          className="arm left-arm"
          style={{
            transform: `rotate(${-20 + breathe}deg)`,
          }}
        >
          <div className="arm-segment upper" />
          <div className="arm-segment lower" />
          <div className="hand">
            <div className="finger" />
            <div className="finger" />
            <div className="finger" />
            <div className="finger" />
          </div>
        </div>

        <div 
          className="arm right-arm"
          style={{
            transform: `rotate(${20 - breathe + (armReach * 50)}deg) scaleY(${1 + armReach * 0.4})`,
            transformOrigin: 'top center',
          }}
        >
          <div className="arm-segment upper" />
          <div className="arm-segment lower" />
          <div 
            className="hand reaching"
            style={{
              transform: armReach > 0 ? `rotate(${(armAngle * 180 / Math.PI) - 90}deg)` : 'none',
            }}
          >
            <div className="finger" />
            <div className="finger" />
            <div className="finger" />
            <div className="finger" />
            <div className="finger thumb" />
          </div>
        </div>

        {/* Wispy tendrils at bottom */}
        <div className="tendrils">
          {Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i}
              className="tendril"
              style={{
                left: `${10 + i * 11}%`,
                height: `${40 + Math.sin(time * 2 + i) * 20}px`,
                transform: `rotate(${Math.sin(time + i * 0.5) * 10}deg)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Ambient particles */}
      <div className="dust-particles">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="dust"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="portrait-stats">
        <span>visits: {effectiveVisits}</span>
        <span>proximity: {Math.round(proximity * 100)}%</span>
        {isLateNight && <span className="late-indicator">late night</span>}
      </div>

      <div className="portrait-label">
        {statusMessage}
        {favoriteHint && <span className="favorite-hint">{favoriteHint}</span>}
      </div>

      {/* Debug Panel */}
      <div className="debug-panel">
        <div className="debug-title">Debug Controls</div>
        
        <div className="debug-row">
          <span>Visits:</span>
          <button 
            className={debugVisits === 1 ? 'active' : ''} 
            onClick={() => setDebugVisits(debugVisits === 1 ? null : 1)}
          >1</button>
          <button 
            className={debugVisits === 3 ? 'active' : ''} 
            onClick={() => setDebugVisits(debugVisits === 3 ? null : 3)}
          >3</button>
          <button 
            className={debugVisits === 6 ? 'active' : ''} 
            onClick={() => setDebugVisits(debugVisits === 6 ? null : 6)}
          >6</button>
          <button 
            className={debugVisits === 10 ? 'active' : ''} 
            onClick={() => setDebugVisits(debugVisits === 10 ? null : 10)}
          >10</button>
          <button 
            className={debugVisits === null ? 'active' : ''} 
            onClick={() => setDebugVisits(null)}
          >REAL</button>
        </div>

        <div className="debug-row">
          <span>Late Night:</span>
          <button 
            className={debugLateNight === true ? 'active' : ''} 
            onClick={() => setDebugLateNight(debugLateNight === true ? null : true)}
          >ON</button>
          <button 
            className={debugLateNight === false ? 'active' : ''} 
            onClick={() => setDebugLateNight(debugLateNight === false ? null : false)}
          >OFF</button>
          <button 
            className={debugLateNight === null ? 'active' : ''} 
            onClick={() => setDebugLateNight(null)}
          >AUTO</button>
        </div>

      </div>

      <button onClick={handleReset} className="debug-reset">Reset All Data</button>
    </div>
  );
}
