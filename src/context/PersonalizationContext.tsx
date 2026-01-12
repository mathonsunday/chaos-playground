import { createContext, useContext, type ReactNode } from 'react';
import { usePersonalization, roomDisplayNames } from '../hooks/usePersonalization';

type PersonalizationContextType = ReturnType<typeof usePersonalization>;

const PersonalizationContext = createContext<PersonalizationContextType | null>(null);

export function PersonalizationProvider({ children }: { children: ReactNode }) {
  const personalization = usePersonalization();
  return (
    <PersonalizationContext.Provider value={personalization}>
      {children}
    </PersonalizationContext.Provider>
  );
}

export function usePersonalizationContext() {
  const context = useContext(PersonalizationContext);
  if (!context) {
    throw new Error('usePersonalizationContext must be used within PersonalizationProvider');
  }
  return context;
}

export { roomDisplayNames };
