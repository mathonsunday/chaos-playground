import { useState, useEffect, useMemo, useRef } from 'react';
import Hub from './components/Hub';
import LivingTypography from './rooms/LivingTypography/LivingTypography';
import Portrait from './rooms/Portrait/Portrait';
import Aquarium from './rooms/Aquarium/Aquarium';
import Forest from './rooms/Forest/Forest';
import ThePet from './rooms/ThePet/ThePet';
import TheAbyss from './rooms/TheAbyss/TheAbyss';
import { PersonalizationProvider, usePersonalizationContext } from './context/PersonalizationContext';

export type Room = 'hub' | 'typography' | 'portrait' | 'aquarium' | 'forest' | 'pet' | 'abyss';

/** Parse URL parameters for focus mode */
function parseUrlParams(): { focusMode: boolean; initialRoom: Room | null } {
  const params = new URLSearchParams(window.location.search);
  const focusMode = params.get('focus') === 'true';
  const roomParam = params.get('room');
  
  // Validate room parameter
  const validRooms: Room[] = ['typography', 'portrait', 'aquarium', 'forest', 'pet', 'abyss'];
  const initialRoom = roomParam && validRooms.includes(roomParam as Room) 
    ? (roomParam as Room) 
    : null;
  
  return { focusMode, initialRoom };
}

function AppContent() {
  // Parse URL params once on mount
  const urlParams = useMemo(() => parseUrlParams(), []);
  
  const [focusMode, setFocusMode] = useState(urlParams.focusMode);
  const [currentRoom, setCurrentRoom] = useState<Room>(
    urlParams.focusMode && urlParams.initialRoom ? urlParams.initialRoom : 'hub'
  );
  const [showExitHint, setShowExitHint] = useState(urlParams.focusMode);
  const hintTimeoutRef = useRef<number | null>(null);
  const { enterRoom, leaveRoom } = usePersonalizationContext();

  // Track room visits
  useEffect(() => {
    if (currentRoom !== 'hub') {
      enterRoom(currentRoom);
    } else {
      leaveRoom();
    }
  }, [currentRoom, enterRoom, leaveRoom]);

  // Establish hub as initial history state on mount
  useEffect(() => {
    // Replace current state with our app state
    const initialState = urlParams.focusMode && urlParams.initialRoom
      ? { view: 'focus', focusMode: true, room: urlParams.initialRoom }
      : { view: 'hub' };
    window.history.replaceState(initialState, '');
  }, [urlParams.focusMode, urlParams.initialRoom]);

  // Handle escape key to return to hub (and exit focus mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentRoom !== 'hub') {
        navigateToHub();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentRoom]);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      
      // If state exists and is ours, handle it
      if (state?.view === 'hub') {
        setCurrentRoom('hub');
        setFocusMode(false);
        setShowExitHint(false);
      } else if (state?.view === 'room' && state?.room) {
        setCurrentRoom(state.room);
        setFocusMode(false);
      } else if (state?.view === 'focus' && state?.room) {
        setCurrentRoom(state.room);
        setFocusMode(true);
      } else {
        // Unknown state or no state - go to hub
        setCurrentRoom('hub');
        setFocusMode(false);
        setShowExitHint(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigate to hub (used by escape key and back button in UI)
  const navigateToHub = () => {
    setCurrentRoom('hub');
    setFocusMode(false);
    setShowExitHint(false);
    window.history.pushState({ view: 'hub' }, '', window.location.pathname);
  };

  // Handler for selecting a room (normal mode)
  const handleSelectRoom = (room: Room) => {
    if (room === 'hub') {
      navigateToHub();
      return;
    }
    setCurrentRoom(room);
    setFocusMode(false);
    // Push to history so back button returns to hub
    window.history.pushState({ view: 'room', room }, '', window.location.pathname);
  };

  const BackButton = () => {
    // Hide back button in focus mode
    if (focusMode) return null;
    
    return (
      <button 
        className="back-button"
        onClick={navigateToHub}
      >
        ← ESCAPE
      </button>
    );
  };

  // Handler for entering focus mode from the Hub
  const handleEnterFocusMode = (room: Room) => {
    setFocusMode(true);
    setCurrentRoom(room);
    // Push to history so back button works (returns to hub)
    window.history.pushState({ view: 'focus', focusMode: true, room }, '', `?focus=true&room=${room}`);
    
    // Show exit hint briefly
    setShowExitHint(true);
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    hintTimeoutRef.current = window.setTimeout(() => setShowExitHint(false), 4000);
  };

  const renderRoom = () => {
    switch (currentRoom) {
      case 'hub':
        return <Hub onSelectRoom={handleSelectRoom} onEnterFocusMode={handleEnterFocusMode} />;
      case 'typography':
        return (
          <>
            <BackButton />
            <LivingTypography focusMode={focusMode} />
          </>
        );
      case 'portrait':
        return (
          <>
            <BackButton />
            <Portrait focusMode={focusMode} />
          </>
        );
      case 'aquarium':
        return (
          <>
            <BackButton />
            <Aquarium focusMode={focusMode} />
          </>
        );
      case 'forest':
        return (
          <>
            <BackButton />
            <Forest focusMode={focusMode} />
          </>
        );
      case 'pet':
        return (
          <>
            <BackButton />
            <ThePet focusMode={focusMode} />
          </>
        );
      case 'abyss':
        return (
          <>
            <BackButton />
            <TheAbyss focusMode={focusMode} />
          </>
        );
      default:
        return <Hub onSelectRoom={handleSelectRoom} onEnterFocusMode={handleEnterFocusMode} />;
    }
  };

  return (
    <div className="no-select">
      {renderRoom()}
      {focusMode && showExitHint && (
        <div className="focus-exit-hint">
          Press ESC or use browser back to exit
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <PersonalizationProvider>
      <AppContent />
    </PersonalizationProvider>
  );
}

export default App;
