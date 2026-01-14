import { useState, useEffect, useRef } from 'react';

interface WaveEvolutionOptions {
  /** Minimum value (default: 1) */
  min?: number;
  /** Maximum value (default: 8) */
  max?: number;
  /** Full cycle duration in milliseconds (default: 45 minutes = 2700000ms) */
  cycleDuration?: number;
  /** Whether the wave is active (default: true) */
  enabled?: boolean;
}

/**
 * Returns a value that smoothly oscillates between min and max in a wave pattern.
 * 
 * The wave uses easing for organic feel:
 * - Slow acceleration when building up
 * - Brief plateau at peaks
 * - Gentle deceleration when decreasing
 * 
 * Full cycle: min → max → min (default ~45 minutes)
 */
export function useWaveEvolution(options: WaveEvolutionOptions = {}) {
  const {
    min = 1,
    max = 8,
    cycleDuration = 45 * 60 * 1000, // 45 minutes in ms
    enabled = true,
  } = options;

  const [value, setValue] = useState(min);
  const startTimeRef = useRef(Date.now());
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      setValue(min);
      return;
    }

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const cycleProgress = (elapsed % cycleDuration) / cycleDuration;
      
      // Use a modified sine wave for smooth oscillation
      // sin goes from -1 to 1, we map it to 0 to 1
      // We use Math.PI * 2 for a full cycle
      const sineValue = Math.sin(cycleProgress * Math.PI * 2);
      
      // Apply easing: use sine squared for the positive half to create plateaus
      // This creates a wave that:
      // - Rises slowly at first
      // - Accelerates in the middle
      // - Slows down approaching the peak
      // - Holds briefly at peak
      // - Same pattern on the way down
      const easedValue = (sineValue + 1) / 2; // Now 0 to 1
      
      // Apply additional easing for more organic feel
      // Using smoothstep-like curve
      const smoothed = easedValue * easedValue * (3 - 2 * easedValue);
      
      // Map to our range
      const mappedValue = min + smoothed * (max - min);
      
      setValue(mappedValue);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [enabled, min, max, cycleDuration]);

  // Return both the continuous value and a rounded integer version
  return {
    /** Continuous value (for smooth transitions) */
    value,
    /** Rounded integer value (for discrete states like creature counts) */
    intValue: Math.round(value),
    /** Current phase: 'rising' | 'peak' | 'falling' | 'trough' */
    phase: getPhase(value, min, max),
  };
}

function getPhase(value: number, min: number, max: number): 'rising' | 'peak' | 'falling' | 'trough' {
  const range = max - min;
  const normalized = (value - min) / range;
  
  if (normalized < 0.2) return 'trough';
  if (normalized > 0.8) return 'peak';
  // We can't determine rising vs falling without derivative, 
  // so we'll just use the value ranges
  if (normalized < 0.5) return 'rising';
  return 'falling';
}

export default useWaveEvolution;
