import { useState, useEffect, useRef, useMemo } from 'react';
import { usePersonalizationContext, roomDisplayNames } from '../../context/PersonalizationContext';
import { useDebugOverrides } from '../../hooks/useDebugOverrides';
import { useResetData } from '../../hooks/useResetData';
import { DebugPanel } from '../../components/DebugPanel';
import './Portrait.css';

interface PortraitProps {
  focusMode?: boolean;
}

export default function Portrait({ focusMode = false }: PortraitProps) {
  const { data, getTimeOfDay, getFavoriteRoom } = usePersonalizationContext();
  const visits = data.roomVisits['portrait'] || 0;

  const { effectiveValue: effectiveVisits, debugOverride: debugVisits, setDebugOverride: setDebugVisits, debugLateNight, setDebugLateNight } = useDebugOverrides({
    focusMode,
    actualValue: visits,
    waveEvolutionConfig: {
      min: 1,
      max: 10,
      cycleDuration: 45 * 60 * 1000,
    },
  });

  const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [time, setTime] = useState(0);
  const [flicker, setFlicker] = useState(1);
  const [armReach, setArmReach] = useState(0);

  const animationRef = useRef<number>(0);
  const handleReset = useResetData();

  const isLateNight = debugLateNight !== null ? debugLateNight : getTimeOfDay() === 'late';
  const favorite = getFavoriteRoom();

  // Figure gets closer and larger with visits
  const proximity = useMemo(() => {
    return Math.min(1, effectiveVisits / 10);
  }, [effectiveVisits]);

  const figureScale = 0.6 + proximity * 0.7;
  const figureTop = 50 - proximity * 15;
  const armReachChance = 0.05 + proximity * 0.2;
  const armReachIntensity = 0.6 + proximity * 0.6;
  const eyeIntensity = 0.5 + proximity * 0.5;

  const statusMessage = useMemo(() => {
    if (effectiveVisits <= 1) return 'something is there';
    if (effectiveVisits <= 3) return 'it has noticed you';
    if (effectiveVisits <= 6) return 'it remembers you';
    if (effectiveVisits <= 10) return 'it has been waiting';
    return 'it is so close now';
  }, [effectiveVisits]);

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

  useEffect(() => {
    const animate = () => {
      setTime(t => t + 0.02);
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

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

  useEffect(() => {
    const reachInterval = setInterval(() => {
      if (Math.random() < armReachChance) {
        setArmReach(armReachIntensity + Math.random() * 0.3);
        setTimeout(() => setArmReach(0), 800 + Math.random() * 1500);
      }
    }, isLateNight ? 2000 : 3000);
    return () => clearInterval(reachInterval);
  }, [armReachChance, armReachIntensity, isLateNight]);

  const centerX = window.innerWidth / 2;
  const leanAmount = 5 + proximity * 8;
  const lean = (mousePos.x - centerX) / centerX * leanAmount;
  
  const figureY = window.innerHeight * (figureTop / 100);
  const trackIntensity = 1 + proximity * 0.5;
  const eyeTrackX = Math.max(-1, Math.min(1, (mousePos.x - centerX) / 400)) * trackIntensity;
  const eyeTrackY = Math.max(-1, Math.min(1, (mousePos.y - figureY) / 300)) * trackIntensity;

  const breatheSpeed = isLateNight ? 1.2 : 0.8;
  const breathe = Math.sin(time * breatheSpeed) * 3;
  const sway = Math.sin(time * 0.5) * 2;

  const armAngle = Math.atan2(mousePos.y - figureY, mousePos.x - centerX);

  return (
    <div className={`portrait-room ${isLateNight ? 'late-night' : ''} ${focusMode ? 'focus-mode' : ''}`}>
      {/* Subtle atmospheric fog */}
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
        {/* Shadow/depth behind figure */}
        <div className="figure-shadow" style={{ opacity: 0.4 + proximity * 0.3 }} />
        
        {/* Body */}
        <div 
          className="figure-body"
          style={{ transform: `scaleX(${1 + breathe * 0.01})` }}
        >
          <div className="tatter tatter-1" />
          <div className="tatter tatter-2" />
          <div className="tatter tatter-3" />
          <div className="tatter tatter-4" />
          <div className="tatter tatter-5" />
        </div>

        {/* Head */}
        <div className="figure-head">
          <div className="hood" />
          <div className="face-void">
            <div 
              className="eye left-eye"
              style={{
                transform: `translate(${eyeTrackX * 3}px, ${eyeTrackY * 2}px)`,
                boxShadow: `0 0 ${10 * eyeIntensity}px #ff0000, 0 0 ${20 * eyeIntensity}px #ff0000`,
              }}
            />
            <div 
              className="eye right-eye"
              style={{
                transform: `translate(${eyeTrackX * 3}px, ${eyeTrackY * 2}px)`,
                boxShadow: `0 0 ${10 * eyeIntensity}px #ff0000, 0 0 ${20 * eyeIntensity}px #ff0000`,
              }}
            />
          </div>
        </div>

        {/* Arms */}
        <div 
          className="arm left-arm"
          style={{ transform: `rotate(${-20 + breathe}deg)` }}
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

        {/* Tendrils */}
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

      {/* Floating dust */}
      <div className="dust-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="dust"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
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

      <DebugPanel
        debugValue={debugVisits}
        onDebugValueChange={setDebugVisits}
        debugLateNight={debugLateNight}
        onDebugLateNightChange={setDebugLateNight}
      />

      <button onClick={handleReset} className="debug-reset">Reset All Data</button>
    </div>
  );
}
