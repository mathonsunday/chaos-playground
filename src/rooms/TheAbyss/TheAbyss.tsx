import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { usePersonalizationContext } from '../../context/PersonalizationContext';
import { Anglerfish, Viperfish, DeepJellyfish, Dragonfish, Lanternfish } from './creatures';
import './TheAbyss.css';

interface Particle {
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
  drift: number;
  opacity: number;
}

interface Creature {
  id: number;
  type: 'anglerfish' | 'viperfish' | 'jellyfish' | 'dragonfish' | 'lanternfish';
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
  direction: number;
  wobblePhase: number;
  hue: number;
  glowIntensity: number;
}

export default function TheAbyss() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);
  
  const particlesRef = useRef<Particle[]>([]);
  
  const { data } = usePersonalizationContext();
  const visits = data.roomVisits['abyss'] || 0;
  
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [time, setTime] = useState(0);
  const [statusMessage, setStatusMessage] = useState('descending...');

  // Initialize creatures based on visits
  const creatureCount = useMemo(() => Math.min(12, 4 + visits), [visits]);

  useEffect(() => {
    const types: Creature['type'][] = ['anglerfish', 'viperfish', 'jellyfish', 'dragonfish', 'lanternfish'];
    
    const initialCreatures: Creature[] = Array.from({ length: creatureCount }, (_, i) => {
      const type = types[i % types.length];
      return {
        id: i,
        type,
        x: Math.random() * 100,
        y: 10 + Math.random() * 80,
        z: 0.5 + Math.random() * 0.5,
        size: type === 'jellyfish' ? 80 + Math.random() * 60 : 
              type === 'lanternfish' ? 40 + Math.random() * 30 :
              60 + Math.random() * 50,
        speed: 0.02 + Math.random() * 0.03,
        direction: Math.random() > 0.5 ? 1 : -1,
        wobblePhase: Math.random() * Math.PI * 2,
        hue: type === 'anglerfish' ? 180 + Math.random() * 40 :
             type === 'viperfish' ? 200 + Math.random() * 40 :
             type === 'jellyfish' ? 260 + Math.random() * 40 :
             type === 'dragonfish' ? 180 + Math.random() * 30 :
             200 + Math.random() * 30,
        glowIntensity: 0.5 + Math.random() * 0.4,
      };
    });

    setCreatures(initialCreatures);
  }, [creatureCount]);

  // Canvas setup for particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Marine snow particles
    particlesRef.current = Array.from({ length: 200 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      z: Math.random(),
      size: 1 + Math.random() * 2,
      speed: 0.2 + Math.random() * 0.4,
      drift: (Math.random() - 0.5) * 0.2,
      opacity: 0.1 + Math.random() * 0.25,
    }));

    // Status messages
    const messages = [
      'descending...',
      'pressure increasing',
      'light fading',
      'something stirs below',
      'you are not alone',
      'they see you',
    ];
    let msgIndex = 0;
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length;
      setStatusMessage(messages[msgIndex]);
    }, 8000);

    return () => {
      window.removeEventListener('resize', resize);
      clearInterval(msgInterval);
    };
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  // Creature movement
  useEffect(() => {
    const moveCreatures = () => {
      setCreatures(prev => prev.map(c => {
        let { x, y, direction, wobblePhase } = c;
        
        // Horizontal drift
        x += c.speed * direction;
        
        // Vertical wobble
        wobblePhase += 0.02;
        y += Math.sin(wobblePhase) * 0.1;
        
        // Wrap around
        if (x < -15) {
          x = 115;
          direction = -1;
        }
        if (x > 115) {
          x = -15;
          direction = 1;
        }
        
        // Keep in vertical bounds
        if (y < 5) y = 5;
        if (y > 90) y = 90;

        // Subtle reaction to cursor
        const mouseXPercent = (mouseRef.current.x / window.innerWidth) * 100;
        const mouseYPercent = (mouseRef.current.y / window.innerHeight) * 100;
        const dx = x - mouseXPercent;
        const dy = y - mouseYPercent;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 20) {
          // Drift away from cursor
          x += (dx / dist) * 0.1;
          y += (dy / dist) * 0.05;
        }

        return { ...c, x, y, direction, wobblePhase };
      }));
      
      setTime(t => t + 1);
    };

    const interval = setInterval(moveCreatures, 50);
    return () => clearInterval(interval);
  }, []);

  // Canvas render for particles/atmosphere
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { width, height } = canvas;
    const canvasTime = timeRef.current;

    // Deep gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#020408');
    gradient.addColorStop(0.3, '#030610');
    gradient.addColorStop(0.6, '#040812');
    gradient.addColorStop(1, '#020406');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle ambient light variation
    const ambientGradient = ctx.createRadialGradient(
      width * 0.3, height * 0.2, 0,
      width * 0.3, height * 0.2, height * 0.8
    );
    ambientGradient.addColorStop(0, 'rgba(15, 30, 60, 0.08)');
    ambientGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = ambientGradient;
    ctx.fillRect(0, 0, width, height);

    // Marine snow
    particlesRef.current.forEach(p => {
      p.y += p.speed * (1 - p.z * 0.5);
      p.x += p.drift + Math.sin(canvasTime * 0.002 + p.y * 0.01) * 0.15;
      
      if (p.y > height + 10) {
        p.y = -10;
        p.x = Math.random() * width;
      }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      const depthOpacity = p.opacity * (0.3 + p.z * 0.7);
      const depthSize = p.size * (0.5 + p.z * 0.5);
      
      ctx.globalAlpha = depthOpacity;
      ctx.fillStyle = 'rgba(180, 200, 220, 1)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, depthSize, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;

    // Vignette
    const vignette = ctx.createRadialGradient(
      width / 2, height / 2, height * 0.3,
      width / 2, height / 2, height * 0.85
    );
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    timeRef.current += 16;
    animationRef.current = requestAnimationFrame(renderCanvas);
  }, []);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(renderCanvas);
    return () => cancelAnimationFrame(animationRef.current);
  }, [renderCanvas]);

  const handleReset = () => {
    localStorage.removeItem('chaos-playground-data');
    window.location.reload();
  };

  const renderCreature = (creature: Creature) => {
    const style = {
      left: `${creature.x}%`,
      top: `${creature.y}%`,
      width: creature.size,
      height: 'auto',
      transform: `translate(-50%, -50%) scaleX(${creature.direction}) scale(${creature.z})`,
      opacity: 0.6 + creature.z * 0.4,
      filter: `blur(${(1 - creature.z) * 2}px)`,
      zIndex: Math.floor(creature.z * 10),
    };

    switch (creature.type) {
      case 'anglerfish':
        return <Anglerfish key={creature.id} style={style} hue={creature.hue} glowIntensity={creature.glowIntensity} />;
      case 'viperfish':
        return <Viperfish key={creature.id} style={style} hue={creature.hue} glowIntensity={creature.glowIntensity} />;
      case 'jellyfish':
        return <DeepJellyfish key={creature.id} style={style} hue={creature.hue} glowIntensity={creature.glowIntensity} />;
      case 'dragonfish':
        return <Dragonfish key={creature.id} style={style} hue={creature.hue} glowIntensity={creature.glowIntensity} />;
      case 'lanternfish':
        return <Lanternfish key={creature.id} style={style} hue={creature.hue} glowIntensity={creature.glowIntensity} />;
    }
  };

  return (
    <div className="abyss-room">
      <canvas ref={canvasRef} className="abyss-canvas" />
      
      <div className="creatures-layer">
        {creatures.map(renderCreature)}
      </div>
      
      <div className="abyss-stats">
        <span>depth: {1000 + visits * 200}m</span>
        <span>creatures: {creatureCount}</span>
      </div>

      <div className="abyss-label">{statusMessage}</div>

      <button onClick={handleReset} className="debug-reset">Reset All Data</button>
    </div>
  );
}
