import { useCallback } from 'react';

export function useResetData() {
  return useCallback(() => {
    localStorage.removeItem('chaos-playground-data');
    window.location.reload();
  }, []);
}
