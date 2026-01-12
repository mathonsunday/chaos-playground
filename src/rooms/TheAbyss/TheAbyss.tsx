import { useEffect, useRef, useState, useCallback } from 'react';
import { usePersonalizationContext } from '../../context/PersonalizationContext';
import './TheAbyss.css';

interface Particle {
  x: number;
  y: number;
  z: number; // depth layer 0-1
  size: number;
  speed: number;
  drift: number;
  opacity: number;
}

interface Organism {
  x: number;
  y: number;
  z: number;
  size: number;
  pulsePhase: number;
  pulseSpeed: number;
  driftX: number;
  driftY: number;
  hue: number;
  intensity: number;
}

interface DeepShape {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  points: number[];
}

export default function TheAbyss() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);
  
  const particlesRef = useRef<Particle[]>([]);
  const organismsRef = useRef<Organism[]>([]);
  const deepShapesRef = useRef<DeepShape[]>([]);
  
  const { data } = usePersonalizationContext();
  const visits = data.roomVisits['abyss'] || 0;
  
  const [statusMessage, setStatusMessage] = useState('descending...');

  // Initialize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Marine snow particles - more with visits
    const particleCount = 150 + visits * 20;
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random(),
      size: 1 + Math.random() * 2,
      speed: 0.2 + Math.random() * 0.5,
      drift: (Math.random() - 0.5) * 0.3,
      opacity: 0.1 + Math.random() * 0.3,
    }));

    // Bioluminescent organisms - more with visits
    const organismCount = 8 + Math.min(12, visits * 2);
    organismsRef.current = Array.from({ length: organismCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: 0.3 + Math.random() * 0.7,
      size: 20 + Math.random() * 60,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.5 + Math.random() * 1.5,
      driftX: (Math.random() - 0.5) * 0.3,
      driftY: (Math.random() - 0.5) * 0.2,
      hue: 180 + Math.random() * 60, // cyan to blue-green
      intensity: 0.3 + Math.random() * 0.5,
    }));

    // Deep shapes - mysterious silhouettes
    deepShapesRef.current = Array.from({ length: 3 }, () => {
      const pointCount = 5 + Math.floor(Math.random() * 4);
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 100 + Math.random() * 200,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.002,
        opacity: 0.03 + Math.random() * 0.05,
        points: Array.from({ length: pointCount }, () => 0.5 + Math.random() * 0.5),
      };
    });

    // Status messages based on time
    const messages = [
      'descending...',
      'pressure increasing',
      'light fading',
      'something stirs below',
      'you are not alone',
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
  }, [visits]);

  // Mouse tracking
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  // Main render loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { width, height } = canvas;
    const time = timeRef.current;
    const mouse = mouseRef.current;

    // Clear with deep gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#020408');
    gradient.addColorStop(0.3, '#030610');
    gradient.addColorStop(0.6, '#040812');
    gradient.addColorStop(1, '#020406');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle color variations (like deep water light)
    const ambientGradient = ctx.createRadialGradient(
      width * 0.3, height * 0.2, 0,
      width * 0.3, height * 0.2, height * 0.8
    );
    ambientGradient.addColorStop(0, 'rgba(20, 40, 80, 0.1)');
    ambientGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = ambientGradient;
    ctx.fillRect(0, 0, width, height);

    // Deep mysterious shapes (far background)
    deepShapesRef.current.forEach(shape => {
      shape.rotation += shape.rotationSpeed;
      shape.x += Math.sin(time * 0.0005) * 0.2;
      shape.y += 0.1;
      
      if (shape.y > height + shape.size) {
        shape.y = -shape.size;
        shape.x = Math.random() * width;
      }

      ctx.save();
      ctx.translate(shape.x, shape.y);
      ctx.rotate(shape.rotation);
      ctx.globalAlpha = shape.opacity;
      
      ctx.beginPath();
      for (let i = 0; i < shape.points.length; i++) {
        const angle = (i / shape.points.length) * Math.PI * 2;
        const radius = shape.size * shape.points[i];
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = '#000';
      ctx.fill();
      ctx.restore();
    });

    // Bioluminescent organisms
    organismsRef.current.forEach(org => {
      // Organic drift movement
      org.x += org.driftX + Math.sin(time * 0.001 + org.pulsePhase) * 0.2;
      org.y += org.driftY + Math.cos(time * 0.0008 + org.pulsePhase) * 0.15;
      
      // Wrap around
      if (org.x < -org.size) org.x = width + org.size;
      if (org.x > width + org.size) org.x = -org.size;
      if (org.y < -org.size) org.y = height + org.size;
      if (org.y > height + org.size) org.y = -org.size;

      // React to cursor - subtle avoidance
      const dx = org.x - mouse.x;
      const dy = org.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        const force = (200 - dist) / 200;
        org.x += (dx / dist) * force * 0.5;
        org.y += (dy / dist) * force * 0.5;
      }

      // Pulsing glow
      const pulse = Math.sin(time * 0.003 * org.pulseSpeed + org.pulsePhase);
      const glowIntensity = org.intensity * (0.7 + pulse * 0.3);
      const currentSize = org.size * (0.9 + pulse * 0.1);

      // Depth-based blur simulation (larger, softer for distant)
      const depthFactor = org.z;
      
      // Outer glow
      const outerGlow = ctx.createRadialGradient(
        org.x, org.y, 0,
        org.x, org.y, currentSize * 2 * depthFactor
      );
      outerGlow.addColorStop(0, `hsla(${org.hue}, 80%, 60%, ${glowIntensity * 0.3})`);
      outerGlow.addColorStop(0.4, `hsla(${org.hue}, 70%, 40%, ${glowIntensity * 0.15})`);
      outerGlow.addColorStop(1, 'transparent');
      
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(org.x, org.y, currentSize * 2 * depthFactor, 0, Math.PI * 2);
      ctx.fill();

      // Core
      const coreGlow = ctx.createRadialGradient(
        org.x, org.y, 0,
        org.x, org.y, currentSize * 0.5 * depthFactor
      );
      coreGlow.addColorStop(0, `hsla(${org.hue}, 60%, 80%, ${glowIntensity * 0.8})`);
      coreGlow.addColorStop(0.5, `hsla(${org.hue}, 70%, 50%, ${glowIntensity * 0.4})`);
      coreGlow.addColorStop(1, 'transparent');
      
      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(org.x, org.y, currentSize * 0.5 * depthFactor, 0, Math.PI * 2);
      ctx.fill();

      // Occasional bright flash
      if (Math.random() < 0.001) {
        const flash = ctx.createRadialGradient(
          org.x, org.y, 0,
          org.x, org.y, currentSize * 3
        );
        flash.addColorStop(0, `hsla(${org.hue}, 100%, 90%, 0.6)`);
        flash.addColorStop(1, 'transparent');
        ctx.fillStyle = flash;
        ctx.beginPath();
        ctx.arc(org.x, org.y, currentSize * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Marine snow (particles)
    particlesRef.current.forEach(p => {
      p.y += p.speed * (1 - p.z * 0.5); // parallax
      p.x += p.drift + Math.sin(time * 0.002 + p.y * 0.01) * 0.2;
      
      if (p.y > height + 10) {
        p.y = -10;
        p.x = Math.random() * width;
      }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      const depthOpacity = p.opacity * (0.3 + p.z * 0.7);
      const depthSize = p.size * (0.5 + p.z * 0.5);
      
      ctx.globalAlpha = depthOpacity;
      ctx.fillStyle = `rgba(180, 200, 220, 1)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, depthSize, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;

    // Vignette for depth/pressure feeling
    const vignette = ctx.createRadialGradient(
      width / 2, height / 2, height * 0.3,
      width / 2, height / 2, height * 0.8
    );
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // Subtle cursor light disturbance
    const cursorGlow = ctx.createRadialGradient(
      mouse.x, mouse.y, 0,
      mouse.x, mouse.y, 80
    );
    cursorGlow.addColorStop(0, 'rgba(100, 150, 200, 0.05)');
    cursorGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = cursorGlow;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 80, 0, Math.PI * 2);
    ctx.fill();

    timeRef.current += 16;
    animationRef.current = requestAnimationFrame(render);
  }, []);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationRef.current);
  }, [render]);

  const handleReset = () => {
    localStorage.removeItem('chaos-playground-data');
    window.location.reload();
  };

  return (
    <div className="abyss-room">
      <canvas ref={canvasRef} className="abyss-canvas" />
      
      <div className="abyss-stats">
        <span>depth: {1000 + visits * 200}m</span>
        <span>organisms: {8 + Math.min(12, visits * 2)}</span>
      </div>

      <div className="abyss-label">{statusMessage}</div>

      <button onClick={handleReset} className="debug-reset">Reset All Data</button>
    </div>
  );
}
