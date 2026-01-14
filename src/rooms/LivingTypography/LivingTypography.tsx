import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { usePersonalizationContext, roomDisplayNames } from '../../context/PersonalizationContext';
import './LivingTypography.css';

interface LivingTypographyProps {
  focusMode?: boolean;
}

interface Letter {
  id: number;
  char: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  rotation: number;
  scale: number;
  hue: number;
  isScattering: boolean;
  wordGroup: number;
}

export default function LivingTypography({ focusMode = false }: LivingTypographyProps) {
  const { data, getTimeOfDay, getFavoriteRoom, formatTime, getDaysSinceFirst } = usePersonalizationContext();
  
  const [letters, setLetters] = useState<Letter[]>([]);
  const [inputText, setInputText] = useState('');
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const lettersRef = useRef<Letter[]>([]);
  const nextIdRef = useRef(0);
  const wordGroupRef = useRef(0);
  const animationRef = useRef<number>(0);

  // Generate personalized phrases
  const personalizedPhrases = useMemo(() => {
    const phrases: string[] = [];
    const timeOfDay = getTimeOfDay();
    const favorite = getFavoriteRoom();
    const visits = data.totalVisits;
    const days = getDaysSinceFirst();
    const petVisits = data.roomVisits['pet'] || 0;

    // Always include some ambient words
    phrases.push('DRIFT', 'FLOAT', 'WATCH', 'STAY', 'PULSE', 'GLOW');

    // Visit observations
    if (visits === 1) {
      phrases.push('FIRST', 'NEW', 'HELLO');
    } else {
      phrases.push(`${visits}`);
      if (visits > 5) phrases.push('AGAIN');
      if (visits > 10) phrases.push('ALWAYS');
      if (visits > 20) phrases.push('RETURN');
    }

    // Time spent
    if (data.totalTimeSpent > 120) {
      const mins = Math.floor(data.totalTimeSpent / 60);
      phrases.push(`${mins}`);
      if (mins > 10) phrases.push('MINUTES');
      if (mins > 30) phrases.push('TIME');
    }

    // Time of day
    if (timeOfDay === 'late') {
      phrases.push('LATE', 'NIGHT', 'STILL');
    } else if (timeOfDay === 'evening') {
      phrases.push('EVENING', 'DARK');
    } else if (timeOfDay === 'morning') {
      phrases.push('EARLY', 'MORNING');
    }

    // Favorite room
    if (favorite && data.roomVisits[favorite] > 2) {
      const name = roomDisplayNames[favorite] || favorite;
      name.split(' ').forEach(word => phrases.push(word.toUpperCase()));
    }

    // Creature specific
    if (petVisits > 3) phrases.push('WAITS');
    if (petVisits > 8) phrases.push('KNOWS');
    if (petVisits > 12) phrases.push('REMEMBERS');

    // Days
    if (days > 0) phrases.push(`${days}`, 'DAYS');

    return phrases;
  }, [data, getTimeOfDay, getFavoriteRoom, formatTime, getDaysSinceFirst]);

  // Spawn a word at a random position
  const spawnWord = useCallback((word: string) => {
    const padding = 100;
    const startX = padding + Math.random() * (window.innerWidth - padding * 2);
    const startY = padding + Math.random() * (window.innerHeight - padding * 2);
    const baseHue = Math.random() * 360;
    const group = wordGroupRef.current++;
    
    const newLetters: Letter[] = word.split('').map((char, i) => ({
      id: nextIdRef.current++,
      char,
      x: startX + (Math.random() - 0.5) * 50,
      y: startY + (Math.random() - 0.5) * 50,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      targetX: startX + i * (35 + Math.random() * 15),
      targetY: startY + (Math.random() - 0.5) * 20,
      rotation: (Math.random() - 0.5) * 30,
      scale: 0.7 + Math.random() * 0.5,
      hue: baseHue + i * 8,
      isScattering: false,
      wordGroup: group,
    }));

    lettersRef.current = [...lettersRef.current, ...newLetters];
    setLetters([...lettersRef.current]);
  }, []);

  // Initialize with some words scattered around
  useEffect(() => {
    // Pick random subset of phrases to start
    const shuffled = [...personalizedPhrases].sort(() => Math.random() - 0.5);
    const initial = shuffled.slice(0, 6 + Math.floor(Math.random() * 4));
    
    initial.forEach((word, i) => {
      setTimeout(() => spawnWord(word), i * 100);
    });
  }, []); // Only on mount

  // Occasionally spawn new words, remove old ones
  useEffect(() => {
    const spawnInterval = setInterval(() => {
      // Random chance to spawn a new word
      if (Math.random() < 0.3 && lettersRef.current.length < 200) {
        const word = personalizedPhrases[Math.floor(Math.random() * personalizedPhrases.length)];
        spawnWord(word);
      }
      
      // Occasionally remove oldest word group if too many letters
      if (lettersRef.current.length > 150) {
        const groups = new Set(lettersRef.current.map(l => l.wordGroup));
        if (groups.size > 8) {
          const oldestGroup = Math.min(...groups);
          lettersRef.current = lettersRef.current.filter(l => l.wordGroup !== oldestGroup);
          setLetters([...lettersRef.current]);
        }
      }
    }, 4000);

    return () => clearInterval(spawnInterval);
  }, [personalizedPhrases, spawnWord]);

  // Track mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    const mouse = mouseRef.current;
    const scatterRadius = 150;
    const returnStrength = 0.015;
    const friction = 0.94;

    const updated = lettersRef.current.map((letter) => {
      let { x, y, vx, vy, targetX, targetY, rotation, hue, isScattering, scale } = letter;

      // Check distance from mouse (disabled in focus mode)
      const dx = x - mouse.x;
      const dy = y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (!focusMode && dist < scatterRadius) {
        // Scatter away from mouse with force
        const force = (scatterRadius - dist) / scatterRadius;
        const angle = Math.atan2(dy, dx);
        vx += Math.cos(angle) * force * 12;
        vy += Math.sin(angle) * force * 12;
        isScattering = true;
        rotation += (Math.random() - 0.5) * 15;
        scale = Math.min(1.3, scale + 0.02);
      } else {
        // Gradually return to target position
        isScattering = false;
        vx += (targetX - x) * returnStrength;
        vy += (targetY - y) * returnStrength;
        
        // Slowly reduce rotation and scale
        rotation *= 0.97;
        scale = scale + (0.85 - scale) * 0.02;
      }

      // Apply friction
      vx *= friction;
      vy *= friction;

      // Update position
      x += vx;
      y += vy;

      // Soft bounds - push back gently
      if (x < 40) vx += 0.5;
      if (x > window.innerWidth - 40) vx -= 0.5;
      if (y < 40) vy += 0.5;
      if (y > window.innerHeight - 40) vy -= 0.5;

      // Slowly shift hue
      hue = (hue + 0.15) % 360;

      return {
        ...letter,
        x,
        y,
        vx,
        vy,
        rotation,
        hue,
        isScattering,
        scale,
      };
    });

    lettersRef.current = updated;
    setLetters([...updated]);
    animationRef.current = requestAnimationFrame(animate);
  }, [focusMode]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [animate]);

  // Handle keyboard input to add new letters
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key.length !== 1 || e.ctrlKey || e.metaKey) return;
    
    const char = e.key.toUpperCase();
    const mouse = mouseRef.current;
    
    const newLetter: Letter = {
      id: nextIdRef.current++,
      char,
      x: mouse.x + (Math.random() - 0.5) * 80,
      y: mouse.y + (Math.random() - 0.5) * 80,
      vx: (Math.random() - 0.5) * 15,
      vy: (Math.random() - 0.5) * 15 - 8,
      targetX: mouse.x + (Math.random() - 0.5) * 300,
      targetY: mouse.y + (Math.random() - 0.5) * 300,
      rotation: (Math.random() - 0.5) * 60,
      scale: 0.9 + Math.random() * 0.4,
      hue: Math.random() * 360,
      isScattering: true,
      wordGroup: -1, // User-typed letters don't belong to a word group
    };

    lettersRef.current = [...lettersRef.current, newLetter];
    setLetters([...lettersRef.current]);
    setInputText((prev) => prev + char);

    setTimeout(() => {
      setInputText((prev) => prev.slice(1));
    }, 1500);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className={`typography-room ${focusMode ? 'focus-mode' : ''}`}>
      {letters.map((letter) => (
        <span
          key={letter.id}
          className={`floating-letter ${letter.isScattering ? 'scattering' : ''}`}
          style={{
            left: letter.x,
            top: letter.y,
            transform: `translate(-50%, -50%) rotate(${letter.rotation}deg) scale(${letter.scale})`,
            color: `hsl(${letter.hue}, 70%, 65%)`,
            textShadow: letter.isScattering 
              ? `0 0 25px hsl(${letter.hue}, 80%, 60%), 0 0 50px hsl(${letter.hue}, 70%, 40%)`
              : `0 0 12px hsl(${letter.hue}, 60%, 40%)`,
          }}
        >
          {letter.char}
        </span>
      ))}

      {inputText && !focusMode && (
        <div className="input-echo">
          {inputText}
        </div>
      )}

      {!focusMode && (
        <div className="typography-instructions">
          Move mouse to scatter • Type to add letters
        </div>
      )}
    </div>
  );
}
