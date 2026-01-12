import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { usePersonalizationContext } from '../../context/PersonalizationContext';
import './Forest.css';

interface Tree {
  id: number;
  x: number;
  baseHeight: number;
  trunkWidth: number;
  foliageSize: number;
  swayOffset: number;
  layer: number;
}

interface Deer {
  id: number;
  x: number;
  y: number;
  targetX: number;
  legPhase: number;
  headBob: number;
  isLooking: boolean;
  lookTimer: number;
  earTwitch: number;
}

interface Bird {
  id: number;
  x: number;
  y: number;
  wingPhase: number;
  glideTime: number;
}

interface Eye {
  id: number;
  x: number;
  y: number;
  size: number;
  blinkTimer: number;
  isBlinking: boolean;
}

interface Owl {
  id: number;
  x: number;
  y: number;
  blinkTimer: number;
  isBlinking: boolean;
  headTurn: number;
}

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export default function Forest() {
  const { data } = usePersonalizationContext();
  const visits = data.roomVisits['forest'] || 0;
  
  // Debug overrides
  const [debugVisits, setDebugVisits] = useState<number | null>(null);
  const [debugTimeOfDay, setDebugTimeOfDay] = useState<TimeOfDay | null>(null);

  const effectiveVisits = debugVisits !== null ? debugVisits : visits;
  
  // Determine time of day
  const actualTimeOfDay = useMemo((): TimeOfDay => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }, []);
  
  const timeOfDay = debugTimeOfDay !== null ? debugTimeOfDay : actualTimeOfDay;

  // Tree growth based on visits (0.6 to 1.2 scale)
  const treeGrowth = useMemo(() => 0.6 + Math.min(0.6, effectiveVisits * 0.1), [effectiveVisits]);
  
  // Fog opacity decreases with visits (regulars get clearer view)
  const fogOpacity = useMemo(() => Math.max(0, 0.4 - effectiveVisits * 0.06), [effectiveVisits]);
  
  // Show deer after 3 visits
  const showDeer = effectiveVisits >= 3;
  
  // Show owls after 5 visits
  const showOwls = effectiveVisits >= 5;
  
  // Eye count and intensity increase with visits
  const eyeCount = useMemo(() => Math.min(12, 4 + effectiveVisits), [effectiveVisits]);

  const [trees] = useState<Tree[]>(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: (i * 5) + Math.random() * 3,
      baseHeight: 150 + Math.random() * 200,
      trunkWidth: 15 + Math.random() * 20,
      foliageSize: 60 + Math.random() * 80,
      swayOffset: Math.random() * Math.PI * 2,
      layer: Math.floor(Math.random() * 3),
    }))
  );

  const [deer, setDeer] = useState<Deer[]>([
    { id: 0, x: 30, y: 0, targetX: 30, legPhase: 0, headBob: 0, isLooking: false, lookTimer: 0, earTwitch: 0 },
    { id: 1, x: 70, y: 0, targetX: 70, legPhase: Math.PI, headBob: 0, isLooking: false, lookTimer: 0, earTwitch: 0 },
  ]);

  const [birds, setBirds] = useState<Bird[]>([
    { id: 0, x: -10, y: 20, wingPhase: 0, glideTime: 0 },
    { id: 1, x: 110, y: 15, wingPhase: Math.PI, glideTime: 0 },
  ]);

  const [eyes] = useState<Eye[]>(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 30 + Math.random() * 40,
      size: 8 + Math.random() * 12,
      blinkTimer: Math.random() * 5,
      isBlinking: false,
    }))
  );

  const [owls] = useState<Owl[]>([
    { id: 0, x: 25, y: 35, blinkTimer: 3, isBlinking: false, headTurn: 0 },
    { id: 1, x: 75, y: 40, blinkTimer: 2, isBlinking: false, headTurn: 0 },
  ]);

  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [time, setTime] = useState(0);
  const animationRef = useRef<number>(0);
  const deerRef = useRef(deer);
  const birdsRef = useRef(birds);

  // Status message based on visits and time
  const statusMessage = useMemo(() => {
    if (effectiveVisits <= 1) return 'something watches';
    if (effectiveVisits <= 3) return 'the fog begins to clear';
    if (effectiveVisits <= 5) return 'you are known here';
    if (effectiveVisits <= 8) return 'the forest welcomes you';
    return 'this is your home now';
  }, [effectiveVisits]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const animate = useCallback(() => {
    setTime(t => t + 0.016);

    // Update deer
    const updatedDeer = deerRef.current.map(d => {
      let { x, targetX, legPhase, headBob, isLooking, lookTimer, earTwitch } = d;

      if (Math.random() < 0.005) {
        targetX = 20 + Math.random() * 60;
      }

      const dx = targetX - x;
      if (Math.abs(dx) > 1) {
        x += Math.sign(dx) * 0.1;
        legPhase += 0.15;
      }

      headBob = Math.sin(time * 2) * 3;

      if (Math.random() < 0.01) {
        isLooking = true;
        lookTimer = 2;
      }
      if (isLooking) {
        lookTimer -= 0.016;
        if (lookTimer <= 0) isLooking = false;
      }

      if (Math.random() < 0.02) {
        earTwitch = 1;
      }
      earTwitch *= 0.9;

      return { ...d, x, targetX, legPhase, headBob, isLooking, lookTimer, earTwitch };
    });
    deerRef.current = updatedDeer;
    setDeer([...updatedDeer]);

    // Update birds
    const updatedBirds = birdsRef.current.map(b => {
      let { x, y, wingPhase, glideTime } = b;

      x += 0.3;
      if (x > 120) {
        x = -20;
        y = 10 + Math.random() * 30;
      }

      if (glideTime > 0) {
        glideTime -= 0.016;
      } else {
        wingPhase += 0.3;
        if (Math.random() < 0.01) {
          glideTime = 0.5 + Math.random();
        }
      }

      y += Math.sin(time * 2 + b.id) * 0.1;

      return { ...b, x, y, wingPhase, glideTime };
    });
    birdsRef.current = updatedBirds;
    setBirds([...updatedBirds]);

    animationRef.current = requestAnimationFrame(animate);
  }, [time]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [animate]);

  const handleReset = () => {
    localStorage.removeItem('chaos-playground-data');
    window.location.reload();
  };

  return (
    <div className={`forest-room time-${timeOfDay}`}>
      {/* Sky gradient */}
      <div className="sky" />
      
      {/* Sun/Moon */}
      <div className={`celestial-body ${timeOfDay === 'night' || timeOfDay === 'evening' ? 'moon' : 'sun'}`} />


      {/* Fog layer for newcomers */}
      {fogOpacity > 0 && (
        <div 
          className="fog-layer"
          style={{ opacity: fogOpacity }}
        />
      )}

      {/* Background trees (layer 2) */}
      <div className="tree-layer layer-2">
        {trees.filter(t => t.layer === 2).map(tree => (
          <div
            key={tree.id}
            className="tree"
            style={{
              left: `${tree.x}%`,
              '--tree-height': `${tree.baseHeight * treeGrowth * 0.6}px`,
              '--trunk-width': `${tree.trunkWidth * treeGrowth * 0.6}px`,
              '--foliage-size': `${tree.foliageSize * treeGrowth * 0.6}px`,
              transform: `rotate(${Math.sin(time * 0.5 + tree.swayOffset) * 1}deg)`,
            } as React.CSSProperties}
          >
            <div className="trunk" />
            <div className="foliage">
              <div className="foliage-layer" />
              <div className="foliage-layer layer-2" />
              <div className="foliage-layer layer-3" />
            </div>
          </div>
        ))}
      </div>

      {/* Watching eyes in the darkness */}
      <div className="eyes-container">
        {eyes.slice(0, eyeCount).map(eye => {
          const eyeAngle = Math.atan2(
            mousePos.y - eye.y,
            mousePos.x - eye.x
          );
          // Eyes follow cursor more intensely for regulars
          const followIntensity = 2 + effectiveVisits * 0.5;
          return (
            <div
              key={eye.id}
              className="hidden-eye"
              style={{
                left: `${eye.x}%`,
                top: `${eye.y}%`,
                '--eye-size': `${eye.size}px`,
              } as React.CSSProperties}
            >
              <div 
                className="eye-pupil"
                style={{
                  transform: `translate(${Math.cos(eyeAngle) * followIntensity}px, ${Math.sin(eyeAngle) * followIntensity}px)`,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Owls - only after 5 visits */}
      {showOwls && owls.map(owl => {
        const lookAngle = Math.atan2(mousePos.y - owl.y, mousePos.x - owl.x);
        const headTurn = Math.cos(lookAngle) * 30;
        
        return (
          <div
            key={owl.id}
            className="owl"
            style={{
              left: `${owl.x}%`,
              top: `${owl.y}%`,
            }}
          >
            <div className="owl-body" />
            <div 
              className="owl-head"
              style={{
                transform: `rotate(${headTurn}deg)`,
              }}
            >
              <div className="owl-face" />
              <div className="owl-eye left">
                <div 
                  className="owl-pupil"
                  style={{
                    transform: `translate(${Math.cos(lookAngle) * 2}px, ${Math.sin(lookAngle) * 2}px)`,
                  }}
                />
              </div>
              <div className="owl-eye right">
                <div 
                  className="owl-pupil"
                  style={{
                    transform: `translate(${Math.cos(lookAngle) * 2}px, ${Math.sin(lookAngle) * 2}px)`,
                  }}
                />
              </div>
              <div className="owl-beak" />
              <div className="owl-ear left" />
              <div className="owl-ear right" />
            </div>
          </div>
        );
      })}

      {/* Mid trees (layer 1) */}
      <div className="tree-layer layer-1">
        {trees.filter(t => t.layer === 1).map(tree => (
          <div
            key={tree.id}
            className="tree"
            style={{
              left: `${tree.x}%`,
              '--tree-height': `${tree.baseHeight * treeGrowth * 0.8}px`,
              '--trunk-width': `${tree.trunkWidth * treeGrowth * 0.8}px`,
              '--foliage-size': `${tree.foliageSize * treeGrowth * 0.8}px`,
              transform: `rotate(${Math.sin(time * 0.7 + tree.swayOffset) * 1.5}deg)`,
            } as React.CSSProperties}
          >
            <div className="trunk" />
            <div className="foliage">
              <div className="foliage-layer" />
              <div className="foliage-layer layer-2" />
              <div className="foliage-layer layer-3" />
            </div>
          </div>
        ))}
      </div>

      {/* Deer - only after 3 visits */}
      {showDeer && deer.map(d => (
        <div
          key={d.id}
          className="deer"
          style={{
            left: `${d.x}%`,
          }}
        >
          <div className="deer-body" />
          <div 
            className="deer-leg front-left"
            style={{ transform: `rotate(${Math.sin(d.legPhase) * 20}deg)` }}
          />
          <div 
            className="deer-leg front-right"
            style={{ transform: `rotate(${Math.sin(d.legPhase + Math.PI) * 20}deg)` }}
          />
          <div 
            className="deer-leg back-left"
            style={{ transform: `rotate(${Math.sin(d.legPhase + Math.PI * 0.5) * 20}deg)` }}
          />
          <div 
            className="deer-leg back-right"
            style={{ transform: `rotate(${Math.sin(d.legPhase + Math.PI * 1.5) * 20}deg)` }}
          />
          <div 
            className="deer-head"
            style={{
              transform: `translateY(${d.headBob}px) rotate(${d.isLooking ? Math.atan2(mousePos.y - 70, mousePos.x - d.x) * 10 : 0}deg)`,
            }}
          >
            <div 
              className="deer-ear left"
              style={{ transform: `rotate(${-10 + d.earTwitch * 20}deg)` }}
            />
            <div 
              className="deer-ear right"
              style={{ transform: `rotate(${10 - d.earTwitch * 15}deg)` }}
            />
            <div className="deer-eye">
              <div className="deer-pupil" />
            </div>
            <div className="antler left" />
            <div className="antler right" />
          </div>
          <div className="deer-tail" />
        </div>
      ))}

      {/* Birds */}
      {birds.map(b => {
        const wingAngle = b.glideTime > 0 ? 10 : Math.sin(b.wingPhase) * 40;
        return (
          <div
            key={b.id}
            className="bird"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
            }}
          >
            <div className="bird-body" />
            <div 
              className="bird-wing left"
              style={{ transform: `rotate(${-wingAngle}deg)` }}
            />
            <div 
              className="bird-wing right"
              style={{ transform: `rotate(${wingAngle}deg)` }}
            />
          </div>
        );
      })}

      {/* Foreground trees (layer 0) */}
      <div className="tree-layer layer-0">
        {trees.filter(t => t.layer === 0).map(tree => (
          <div
            key={tree.id}
            className="tree"
            style={{
              left: `${tree.x}%`,
              '--tree-height': `${tree.baseHeight * treeGrowth}px`,
              '--trunk-width': `${tree.trunkWidth * treeGrowth}px`,
              '--foliage-size': `${tree.foliageSize * treeGrowth}px`,
              transform: `rotate(${Math.sin(time + tree.swayOffset) * 2}deg)`,
            } as React.CSSProperties}
          >
            <div className="trunk" />
            <div className="foliage">
              <div className="foliage-layer" />
              <div className="foliage-layer layer-2" />
              <div className="foliage-layer layer-3" />
            </div>
          </div>
        ))}
      </div>

      {/* Ground */}
      <div className="ground" />

      {/* Stats */}
      <div className="forest-stats">
        <span>visits: {effectiveVisits}</span>
        <span>trees: {treeGrowth < 0.8 ? 'saplings' : treeGrowth < 1.0 ? 'growing' : 'mature'}</span>
        <span>eyes: {eyeCount} watching</span>
        {showDeer && <span className="unlock-indicator">deer visible</span>}
        {showOwls && <span className="unlock-indicator">owls watching</span>}
        <span>time: {timeOfDay}</span>
      </div>

      <div className="forest-label">
        {statusMessage}
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
            className={debugVisits === 5 ? 'active' : ''} 
            onClick={() => setDebugVisits(debugVisits === 5 ? null : 5)}
          >5</button>
          <button 
            className={debugVisits === 8 ? 'active' : ''} 
            onClick={() => setDebugVisits(debugVisits === 8 ? null : 8)}
          >8</button>
          <button 
            className={debugVisits === null ? 'active' : ''} 
            onClick={() => setDebugVisits(null)}
          >REAL</button>
        </div>

        <div className="debug-row">
          <span>Time:</span>
          <button 
            className={debugTimeOfDay === 'morning' ? 'active' : ''} 
            onClick={() => setDebugTimeOfDay(debugTimeOfDay === 'morning' ? null : 'morning')}
          >🌅</button>
          <button 
            className={debugTimeOfDay === 'afternoon' ? 'active' : ''} 
            onClick={() => setDebugTimeOfDay(debugTimeOfDay === 'afternoon' ? null : 'afternoon')}
          >☀️</button>
          <button 
            className={debugTimeOfDay === 'evening' ? 'active' : ''} 
            onClick={() => setDebugTimeOfDay(debugTimeOfDay === 'evening' ? null : 'evening')}
          >🌆</button>
          <button 
            className={debugTimeOfDay === 'night' ? 'active' : ''} 
            onClick={() => setDebugTimeOfDay(debugTimeOfDay === 'night' ? null : 'night')}
          >🌙</button>
          <button 
            className={debugTimeOfDay === null ? 'active' : ''} 
            onClick={() => setDebugTimeOfDay(null)}
          >AUTO</button>
        </div>
      </div>

      <button onClick={handleReset} className="debug-reset">Reset All Data</button>
    </div>
  );
}
