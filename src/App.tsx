import { useState, useEffect } from 'react';
import Hub from './components/Hub';
import LivingTypography from './rooms/LivingTypography/LivingTypography';
import Portrait from './rooms/Portrait/Portrait';
import Aquarium from './rooms/Aquarium/Aquarium';
import Forest from './rooms/Forest/Forest';
import ThePet from './rooms/ThePet/ThePet';
import TheConsole from './rooms/TheConsole/TheConsole';
import TheLure from './rooms/TheLure/TheLure';
import { PersonalizationProvider, usePersonalizationContext } from './context/PersonalizationContext';

export type Room = 'hub' | 'typography' | 'portrait' | 'aquarium' | 'forest' | 'pet' | 'console' | 'lure';

function AppContent() {
  const [currentRoom, setCurrentRoom] = useState<Room>('hub');
  const { enterRoom, leaveRoom } = usePersonalizationContext();

  // Track room visits
  useEffect(() => {
    if (currentRoom !== 'hub') {
      enterRoom(currentRoom);
    } else {
      leaveRoom();
    }
  }, [currentRoom, enterRoom, leaveRoom]);

  // Handle escape key to return to hub
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentRoom !== 'hub') {
        setCurrentRoom('hub');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentRoom]);

  const BackButton = () => (
    <button 
      className="back-button"
      onClick={() => setCurrentRoom('hub')}
    >
      ← ESCAPE
    </button>
  );

  const renderRoom = () => {
    switch (currentRoom) {
      case 'hub':
        return <Hub onSelectRoom={setCurrentRoom} />;
      case 'typography':
        return (
          <>
            <BackButton />
            <LivingTypography />
          </>
        );
      case 'portrait':
        return (
          <>
            <BackButton />
            <Portrait />
          </>
        );
      case 'aquarium':
        return (
          <>
            <BackButton />
            <Aquarium />
          </>
        );
      case 'forest':
        return (
          <>
            <BackButton />
            <Forest />
          </>
        );
      case 'pet':
        return (
          <>
            <BackButton />
            <ThePet />
          </>
        );
      case 'console':
        return (
          <>
            <BackButton />
            <TheConsole />
          </>
        );
      case 'lure':
        return (
          <>
            <BackButton />
            <TheLure />
          </>
        );
      default:
        return <Hub onSelectRoom={setCurrentRoom} />;
    }
  };

  return <div className="no-select">{renderRoom()}</div>;
}

function App() {
  return (
    <PersonalizationProvider>
      <AppContent />
    </PersonalizationProvider>
  );
}

export default App;
