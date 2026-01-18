import { useState, useMemo } from 'react';
import { useWaveEvolution } from './useWaveEvolution';

interface DebugOverridesOptions {
  focusMode: boolean;
  actualValue: number;
  waveEvolutionConfig?: {
    min: number;
    max: number;
    cycleDuration: number;
  };
}

export function useDebugOverrides({
  focusMode,
  actualValue,
  waveEvolutionConfig,
}: DebugOverridesOptions) {
  const [debugOverride, setDebugOverride] = useState<number | null>(null);
  const [debugLateNight, setDebugLateNight] = useState<boolean | null>(null);

  const waveEvolution = waveEvolutionConfig
    ? useWaveEvolution({
        ...waveEvolutionConfig,
        enabled: focusMode,
      })
    : null;

  const effectiveValue = useMemo(() => {
    if (focusMode && waveEvolution) return waveEvolution.intValue;
    return debugOverride !== null ? debugOverride : actualValue;
  }, [focusMode, waveEvolution?.intValue, debugOverride, actualValue]);

  return {
    effectiveValue,
    debugOverride,
    setDebugOverride,
    debugLateNight,
    setDebugLateNight,
    waveEvolution,
  };
}
