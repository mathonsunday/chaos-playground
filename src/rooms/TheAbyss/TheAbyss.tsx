import { useEffect, useRef, useCallback, useState } from 'react';
import './TheAbyss.css';

interface Seeker {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  maxSpeed: number;
  awareness: number; // how far it can "see" the light
  timidity: number; // how easily scared
  glow: number;
  hue: number;
}

interface Tendril {
  startX: number;
  startY: number;
  segments: { x: number; y: number }[];
  targetX: number;
  targetY: number;
  speed: number;
  thickness: number;
  side: 'left' | 'right' | 'top' | 'bottom';
}

interface Leviathan {
  x: number;
  y: number;
  targetY: number;
  speed: number;
  size: number;
  opacity: number;
  active: boolean;
  direction: number;
}

export default function TheAbyss() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const lastMouseRef = useRef({ x: -1000, y: -1000 });
  const mouseSpeedRef = useRef(0);
  
  const seekersRef = useRef<Seeker[]>([]);
  const tendrilsRef = useRef<Tendril[]>([]);
  const leviathanRef = useRef<Leviathan>({ x: 0, y: 0, targetY: 0, speed: 0, size: 0, opacity: 0, active: false, direction: 1 });
  const timeRef = useRef(0);
  const lastLeviathanRef = useRef(0);
  
  const [message, setMessage] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create seekers - things drawn to light
    seekersRef.current = Array.from({ length: 40 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: 0,
      vy: 0,
      size: 2 + Math.random() * 6,
      maxSpeed: 1 + Math.random() * 3,
      awareness: 150 + Math.random() * 250,
      timidity: 0.3 + Math.random() * 0.7,
      glow: 0,
      hue: 180 + Math.random() * 40,
    }));

    // Create tendrils from edges
    const sides: Tendril['side'][] = ['left', 'right', 'top', 'bottom'];
    tendrilsRef.current = Array.from({ length: 8 }, (_, i) => {
      const side = sides[i % 4];
      let startX = 0, startY = 0;
      
      if (side === 'left') { startX = 0; startY = Math.random() * window.innerHeight; }
      else if (side === 'right') { startX = window.innerWidth; startY = Math.random() * window.innerHeight; }
      else if (side === 'top') { startX = Math.random() * window.innerWidth; startY = 0; }
      else { startX = Math.random() * window.innerWidth; startY = window.innerHeight; }

      const segments = Array.from({ length: 12 }, () => ({ x: startX, y: startY }));
      
      return {
        startX,
        startY,
        segments,
        targetX: startX,
        targetY: startY,
        speed: 0.02 + Math.random() * 0.03,
        thickness: 3 + Math.random() * 5,
        side,
      };
    });

    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      lastMouseRef.current = { ...mouseRef.current };
      mouseRef.current = { x: e.clientX, y: e.clientY };
      
      const dx = mouseRef.current.x - lastMouseRef.current.x;
      const dy = mouseRef.current.y - lastMouseRef.current.y;
      mouseSpeedRef.current = Math.sqrt(dx * dx + dy * dy);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { width, height } = canvas;
    const time = timeRef.current;
    const mouse = mouseRef.current;
    const mouseSpeed = mouseSpeedRef.current;
    
    // Decay mouse speed
    mouseSpeedRef.current *= 0.9;

    // Pure black
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // YOUR LIGHT - the cursor glow
    const lightRadius = 120 + Math.sin(time * 0.003) * 20;
    const lightIntensity = Math.max(0.3, 1 - mouseSpeed * 0.02); // dims when moving fast
    
    // Multiple light layers for realistic falloff
    for (let i = 5; i >= 1; i--) {
      const radius = lightRadius * (i / 2);
      const alpha = (0.15 / i) * lightIntensity;
      const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, radius);
      gradient.addColorStop(0, `rgba(180, 220, 255, ${alpha})`);
      gradient.addColorStop(0.5, `rgba(100, 180, 220, ${alpha * 0.5})`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bright core
    const coreGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 15);
    coreGrad.addColorStop(0, `rgba(255, 255, 255, ${0.9 * lightIntensity})`);
    coreGrad.addColorStop(0.5, `rgba(200, 240, 255, ${0.5 * lightIntensity})`);
    coreGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 15, 0, Math.PI * 2);
    ctx.fill();

    // TENDRILS - darkness reaching toward light
    tendrilsRef.current.forEach(tendril => {
      const dx = mouse.x - tendril.startX;
      const dy = mouse.y - tendril.startY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Tendrils reach toward light, recoil when it moves fast
      const reachFactor = Math.max(0, 1 - mouseSpeed * 0.05);
      const maxReach = Math.min(dist * 0.7, 300) * reachFactor;
      
      tendril.targetX = tendril.startX + (dx / dist) * maxReach;
      tendril.targetY = tendril.startY + (dy / dist) * maxReach;

      // Update segments - follow the leader with lag
      tendril.segments[0].x += (tendril.targetX - tendril.segments[0].x) * tendril.speed;
      tendril.segments[0].y += (tendril.targetY - tendril.segments[0].y) * tendril.speed;
      
      for (let i = 1; i < tendril.segments.length; i++) {
        const prev = tendril.segments[i - 1];
        const curr = tendril.segments[i];
        const segDx = prev.x - curr.x;
        const segDy = prev.y - curr.y;
        curr.x += segDx * 0.15;
        curr.y += segDy * 0.15;
        
        // Add organic waviness
        curr.x += Math.sin(time * 0.002 + i * 0.5) * 0.5;
        curr.y += Math.cos(time * 0.002 + i * 0.3) * 0.5;
      }

      // Draw tendril
      ctx.beginPath();
      ctx.moveTo(tendril.startX, tendril.startY);
      
      for (let i = 0; i < tendril.segments.length; i++) {
        const seg = tendril.segments[i];
        ctx.lineTo(seg.x, seg.y);
      }
      
      ctx.strokeStyle = 'rgba(10, 10, 15, 0.9)';
      ctx.lineWidth = tendril.thickness;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Tendril tip glow when close to light
      const tipDist = Math.sqrt(
        Math.pow(tendril.segments[0].x - mouse.x, 2) + 
        Math.pow(tendril.segments[0].y - mouse.y, 2)
      );
      if (tipDist < 100) {
        const tipGlow = (1 - tipDist / 100) * 0.5;
        ctx.fillStyle = `rgba(80, 150, 180, ${tipGlow})`;
        ctx.beginPath();
        ctx.arc(tendril.segments[0].x, tendril.segments[0].y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // SEEKERS - things drawn to your light
    seekersRef.current.forEach(seeker => {
      const dx = mouse.x - seeker.x;
      const dy = mouse.y - seeker.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Behavior based on distance and mouse speed
      if (dist < seeker.awareness) {
        if (mouseSpeed > 15 * seeker.timidity) {
          // FLEE - light moved too fast, scatter!
          seeker.vx -= (dx / dist) * 0.5;
          seeker.vy -= (dy / dist) * 0.5;
          seeker.glow = Math.max(0, seeker.glow - 0.1);
        } else if (dist > 40) {
          // APPROACH - drawn to light
          seeker.vx += (dx / dist) * 0.08;
          seeker.vy += (dy / dist) * 0.08;
          seeker.glow = Math.min(1, seeker.glow + 0.02);
        } else {
          // TOO CLOSE - orbit nervously
          seeker.vx += (dy / dist) * 0.1;
          seeker.vy -= (dx / dist) * 0.1;
          seeker.glow = 1;
        }
      } else {
        // Wander in darkness
        seeker.vx += (Math.random() - 0.5) * 0.1;
        seeker.vy += (Math.random() - 0.5) * 0.1;
        seeker.glow = Math.max(0, seeker.glow - 0.01);
      }

      // Speed limit
      const speed = Math.sqrt(seeker.vx * seeker.vx + seeker.vy * seeker.vy);
      if (speed > seeker.maxSpeed) {
        seeker.vx = (seeker.vx / speed) * seeker.maxSpeed;
        seeker.vy = (seeker.vy / speed) * seeker.maxSpeed;
      }

      // Friction
      seeker.vx *= 0.98;
      seeker.vy *= 0.98;

      // Move
      seeker.x += seeker.vx;
      seeker.y += seeker.vy;

      // Wrap
      if (seeker.x < -50) seeker.x = width + 50;
      if (seeker.x > width + 50) seeker.x = -50;
      if (seeker.y < -50) seeker.y = height + 50;
      if (seeker.y > height + 50) seeker.y = -50;

      // Draw - only visible near light or when glowing
      const visibility = Math.max(
        seeker.glow,
        dist < lightRadius ? (1 - dist / lightRadius) * 0.8 : 0
      );
      
      if (visibility > 0.05) {
        // Glow
        const glowSize = seeker.size * (2 + seeker.glow * 2);
        const gradient = ctx.createRadialGradient(
          seeker.x, seeker.y, 0,
          seeker.x, seeker.y, glowSize
        );
        gradient.addColorStop(0, `hsla(${seeker.hue}, 70%, 60%, ${visibility * 0.6})`);
        gradient.addColorStop(0.5, `hsla(${seeker.hue}, 60%, 40%, ${visibility * 0.2})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(seeker.x, seeker.y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `hsla(${seeker.hue}, 50%, 80%, ${visibility * 0.9})`;
        ctx.beginPath();
        ctx.arc(seeker.x, seeker.y, seeker.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // LEVIATHAN - something huge occasionally passes
    const lev = leviathanRef.current;
    
    if (!lev.active && time - lastLeviathanRef.current > 10000 && Math.random() < 0.003) {
      // Spawn leviathan
      lev.active = true;
      lev.direction = Math.random() > 0.5 ? 1 : -1;
      lev.x = lev.direction === 1 ? -600 : width + 600;
      lev.y = height * 0.3 + Math.random() * height * 0.4;
      lev.targetY = lev.y + (Math.random() - 0.5) * 100;
      lev.speed = 2 + Math.random() * 1.5;
      lev.size = 350 + Math.random() * 200; // Much bigger
      lev.opacity = 0;
      setMessage('something approaches...');
      setTimeout(() => setMessage(''), 4000);
    }

    if (lev.active) {
      lev.x += lev.speed * lev.direction;
      lev.y += (lev.targetY - lev.y) * 0.01;
      
      // Calculate opacity - visible across more of the screen
      const distFromEdge = lev.direction === 1 
        ? Math.min(lev.x + 300, width - lev.x + 600)
        : Math.min(width - lev.x + 300, lev.x + 600);
      lev.opacity = Math.min(0.7, distFromEdge / 600); // Much more visible

      // Push seekers away from leviathan
      seekersRef.current.forEach(seeker => {
        const dx = seeker.x - lev.x;
        const dy = seeker.y - lev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < lev.size * 1.5 && dist > 0) {
          const force = (1 - dist / (lev.size * 1.5)) * 3;
          seeker.vx += (dx / dist) * force;
          seeker.vy += (dy / dist) * force;
          seeker.glow = Math.min(1, seeker.glow + 0.1); // They light up in fear
        }
      });

      // How close is the player's light to the leviathan?
      const lightToLevX = mouse.x - lev.x;
      const lightToLevY = mouse.y - lev.y;
      const lightToLevDist = Math.sqrt(lightToLevX * lightToLevX + lightToLevY * lightToLevY);
      const illumination = Math.max(0, 1 - lightToLevDist / (lev.size * 1.5)); // 0-1 based on proximity
      
      ctx.save();
      
      // Darker area around leviathan - it blocks even ambient light
      const blockRadius = lev.size * 1.8;
      const blockGrad = ctx.createRadialGradient(lev.x, lev.y, lev.size * 0.5, lev.x, lev.y, blockRadius);
      blockGrad.addColorStop(0, `rgba(0, 0, 0, ${lev.opacity * 0.8})`);
      blockGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = blockGrad;
      ctx.beginPath();
      ctx.arc(lev.x, lev.y, blockRadius, 0, Math.PI * 2);
      ctx.fill();

      // Main body - when illuminated, you can see it's not just black
      ctx.globalAlpha = lev.opacity;
      
      // Base body
      const bodyColor = illumination > 0.1 
        ? `rgb(${15 + illumination * 25}, ${12 + illumination * 18}, ${20 + illumination * 25})`
        : '#000';
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.ellipse(lev.x, lev.y, lev.size, lev.size * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // REVEALED BY LIGHT: Surface texture / scarring
      if (illumination > 0.2) {
        ctx.globalAlpha = lev.opacity * illumination * 0.6;
        // Ridges along the body
        for (let i = 0; i < 8; i++) {
          const ridgeX = lev.x - lev.size * 0.6 + i * lev.size * 0.18;
          const ridgeY = lev.y;
          ctx.strokeStyle = `rgba(60, 50, 70, ${illumination})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(ridgeX, ridgeY, 8, lev.size * 0.28, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        // Scars / markings
        ctx.strokeStyle = `rgba(80, 60, 70, ${illumination * 0.8})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(lev.x - lev.size * 0.2, lev.y - lev.size * 0.15);
        ctx.lineTo(lev.x + lev.size * 0.1, lev.y - lev.size * 0.08);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(lev.x + lev.size * 0.15, lev.y + lev.size * 0.1);
        ctx.lineTo(lev.x + lev.size * 0.35, lev.y + lev.size * 0.18);
        ctx.lineTo(lev.x + lev.size * 0.25, lev.y + lev.size * 0.05);
        ctx.stroke();
        
        ctx.globalAlpha = lev.opacity;
      }
      
      // Trailing mass / tail
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.moveTo(lev.x - lev.direction * lev.size, lev.y);
      ctx.quadraticCurveTo(
        lev.x - lev.direction * lev.size * 1.5, lev.y + Math.sin(time * 0.003) * 40,
        lev.x - lev.direction * lev.size * 2.2, lev.y + Math.sin(time * 0.002) * 60
      );
      ctx.quadraticCurveTo(
        lev.x - lev.direction * lev.size * 1.5, lev.y - Math.sin(time * 0.003) * 30,
        lev.x - lev.direction * lev.size, lev.y
      );
      ctx.fill();

      // Eye - REACTS to being illuminated
      const eyeX = lev.x + lev.direction * lev.size * 0.5;
      const eyeY = lev.y - lev.size * 0.08;
      const eyeIllumination = Math.max(0, 1 - Math.sqrt(Math.pow(mouse.x - eyeX, 2) + Math.pow(mouse.y - eyeY, 2)) / 200);
      
      // Eye gets bigger and brighter when you shine light on it
      const eyeSize = 8 + eyeIllumination * 6;
      const eyeGlowSize = 30 + eyeIllumination * 30;
      
      // Eye glow - intensifies with light
      const eyeGlow = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, eyeGlowSize);
      eyeGlow.addColorStop(0, `rgba(${180 + eyeIllumination * 75}, ${60 + eyeIllumination * 40}, ${60 + eyeIllumination * 20}, ${lev.opacity * (0.8 + eyeIllumination * 0.2)})`);
      eyeGlow.addColorStop(0.5, `rgba(${120 + eyeIllumination * 60}, 40, 40, ${lev.opacity * (0.3 + eyeIllumination * 0.3)})`);
      eyeGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = eyeGlow;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, eyeGlowSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Eye core - pulses when illuminated
      const eyePulse = eyeIllumination > 0.3 ? Math.sin(time * 0.01) * 0.2 : 0;
      ctx.fillStyle = `rgba(${200 + eyeIllumination * 55}, ${80 + eyeIllumination * 80}, ${60 + eyeIllumination * 40}, ${lev.opacity})`;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, eyeSize * (1 + eyePulse), 0, Math.PI * 2);
      ctx.fill();
      
      // Pupil - DILATES when light shines on it (contracts to a slit)
      const toPlayerX = mouse.x - eyeX;
      const toPlayerY = mouse.y - eyeY;
      const toPlayerDist = Math.sqrt(toPlayerX * toPlayerX + toPlayerY * toPlayerY);
      const pupilOffsetX = (toPlayerX / toPlayerDist) * 3;
      const pupilOffsetY = (toPlayerY / toPlayerDist) * 3;
      
      ctx.fillStyle = `rgba(10, 0, 0, ${lev.opacity})`;
      ctx.beginPath();
      if (eyeIllumination > 0.4) {
        // Slit pupil when illuminated
        ctx.ellipse(eyeX + pupilOffsetX, eyeY + pupilOffsetY, 2, eyeSize * 0.7, 0, 0, Math.PI * 2);
      } else {
        // Round pupil in darkness
        ctx.arc(eyeX + pupilOffsetX, eyeY + pupilOffsetY, 4 - eyeIllumination * 2, 0, Math.PI * 2);
      }
      ctx.fill();
      
      // REVEALED BY LIGHT: Second eye (you didn't see it before!)
      if (illumination > 0.4) {
        const eye2X = lev.x + lev.direction * lev.size * 0.3;
        const eye2Y = lev.y + lev.size * 0.12;
        const eye2Vis = (illumination - 0.4) * 1.6; // fades in
        
        const eye2Glow = ctx.createRadialGradient(eye2X, eye2Y, 0, eye2X, eye2Y, 20);
        eye2Glow.addColorStop(0, `rgba(180, 60, 60, ${lev.opacity * eye2Vis * 0.6})`);
        eye2Glow.addColorStop(1, 'transparent');
        ctx.fillStyle = eye2Glow;
        ctx.beginPath();
        ctx.arc(eye2X, eye2Y, 20, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = `rgba(200, 80, 60, ${lev.opacity * eye2Vis})`;
        ctx.beginPath();
        ctx.arc(eye2X, eye2Y, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bioluminescent spots - MORE appear when illuminated
      const baseSpotCount = 6;
      const bonusSpots = Math.floor(illumination * 10);
      const spotCount = baseSpotCount + bonusSpots;
      
      for (let i = 0; i < spotCount; i++) {
        const isBonus = i >= baseSpotCount;
        const spotX = lev.x - lev.direction * (lev.size * 0.3 + (i % 8) * lev.size * 0.25);
        const spotY = lev.y + Math.sin(i * 1.5 + time * 0.002) * (lev.size * 0.15) + (isBonus ? (i % 2 ? -1 : 1) * lev.size * 0.25 : 0);
        const spotSize = 4 + Math.sin(time * 0.005 + i) * 2;
        
        // Bonus spots are dimmer, only visible when illuminated
        const spotAlpha = isBonus ? illumination * 0.8 : 1;
        
        const spotGrad = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, spotSize * 3);
        spotGrad.addColorStop(0, `rgba(80, 180, 200, ${lev.opacity * 0.6 * spotAlpha})`);
        spotGrad.addColorStop(0.5, `rgba(60, 140, 160, ${lev.opacity * 0.2 * spotAlpha})`);
        spotGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.arc(spotX, spotY, spotSize * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // REVEALED BY LIGHT: Mouth/maw (terrifying detail you only see up close)
      if (illumination > 0.5) {
        const mouthVis = (illumination - 0.5) * 2;
        const mouthX = lev.x + lev.direction * lev.size * 0.75;
        const mouthY = lev.y + lev.size * 0.05;
        
        // Dark opening
        ctx.fillStyle = `rgba(5, 0, 5, ${lev.opacity * mouthVis})`;
        ctx.beginPath();
        ctx.ellipse(mouthX, mouthY, 25, 15, lev.direction * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Teeth
        ctx.fillStyle = `rgba(180, 170, 160, ${lev.opacity * mouthVis * 0.8})`;
        for (let t = 0; t < 5; t++) {
          const toothX = mouthX - 15 + t * 8;
          const toothY = mouthY - 8;
          ctx.beginPath();
          ctx.moveTo(toothX, toothY);
          ctx.lineTo(toothX + 3, toothY + 12);
          ctx.lineTo(toothX - 3, toothY + 12);
          ctx.closePath();
          ctx.fill();
        }
      }
      
      ctx.restore();

      // Deactivate when offscreen
      if ((lev.direction === 1 && lev.x > width + lev.size * 2.5) || 
          (lev.direction === -1 && lev.x < -lev.size * 2.5)) {
        lev.active = false;
        lastLeviathanRef.current = time;
      }
    }

    // Vignette
    const vignette = ctx.createRadialGradient(
      width / 2, height / 2, height * 0.2,
      width / 2, height / 2, height
    );
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    timeRef.current += 16;
    animationRef.current = requestAnimationFrame(render);
  }, []);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationRef.current);
  }, [render]);

  const triggerLeviathan = () => {
    const lev = leviathanRef.current;
    if (!lev.active) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      lev.active = true;
      lev.direction = Math.random() > 0.5 ? 1 : -1;
      lev.x = lev.direction === 1 ? -600 : canvas.width + 600;
      lev.y = canvas.height * 0.3 + Math.random() * canvas.height * 0.4;
      lev.targetY = lev.y + (Math.random() - 0.5) * 100;
      lev.speed = 2 + Math.random() * 1.5;
      lev.size = 350 + Math.random() * 200;
      lev.opacity = 0;
      setMessage('something approaches...');
      setTimeout(() => setMessage(''), 4000);
    }
  };

  return (
    <div className="abyss-room">
      <canvas ref={canvasRef} className="abyss-canvas" />
      {message && <div className="abyss-message">{message}</div>}
      <button onClick={triggerLeviathan} className="debug-trigger">
        Summon
      </button>
    </div>
  );
}
