import { useState, useEffect, useCallback } from 'react';

interface PersonalizationData {
  totalVisits: number;
  roomVisits: Record<string, number>;
  totalTimeSpent: number; // in seconds
  roomTimeSpent: Record<string, number>;
  firstVisit: number; // timestamp
  lastVisit: number; // timestamp
}

const STORAGE_KEY = 'chaos-playground-data';

const getDefaultData = (): PersonalizationData => ({
  totalVisits: 0,
  roomVisits: {},
  totalTimeSpent: 0,
  roomTimeSpent: {},
  firstVisit: Date.now(),
  lastVisit: Date.now(),
});

const loadData = (): PersonalizationData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load personalization data');
  }
  return getDefaultData();
};

const saveData = (data: PersonalizationData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save personalization data');
  }
};

export function usePersonalization() {
  const [data, setData] = useState<PersonalizationData>(loadData);
  const [sessionStart] = useState(Date.now());
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [roomEnterTime, setRoomEnterTime] = useState<number | null>(null);

  // Increment total visits on first load
  useEffect(() => {
    setData(prev => {
      const updated = {
        ...prev,
        totalVisits: prev.totalVisits + 1,
        lastVisit: Date.now(),
      };
      saveData(updated);
      return updated;
    });
  }, []);

  // Track time spent periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const sessionTime = Math.floor((Date.now() - sessionStart) / 1000);
        const updated = {
          ...prev,
          totalTimeSpent: prev.totalTimeSpent + 1,
        };
        
        // Also track room time if in a room
        if (currentRoom && roomEnterTime) {
          updated.roomTimeSpent = {
            ...prev.roomTimeSpent,
            [currentRoom]: (prev.roomTimeSpent[currentRoom] || 0) + 1,
          };
        }
        
        saveData(updated);
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStart, currentRoom, roomEnterTime]);

  const enterRoom = useCallback((room: string) => {
    setCurrentRoom(room);
    setRoomEnterTime(Date.now());
    setData(prev => {
      const updated = {
        ...prev,
        roomVisits: {
          ...prev.roomVisits,
          [room]: (prev.roomVisits[room] || 0) + 1,
        },
      };
      saveData(updated);
      return updated;
    });
  }, []);

  const leaveRoom = useCallback(() => {
    setCurrentRoom(null);
    setRoomEnterTime(null);
  }, []);

  // Utility functions for getting insights
  const getTimeOfDay = useCallback(() => {
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 5) return 'late';
    if (hour >= 20) return 'evening';
    if (hour >= 17) return 'dusk';
    if (hour >= 12) return 'afternoon';
    if (hour >= 5) return 'morning';
    return 'late';
  }, []);

  const getFavoriteRoom = useCallback(() => {
    const rooms = Object.entries(data.roomVisits);
    if (rooms.length === 0) return null;
    return rooms.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  }, [data.roomVisits]);

  const getMostTimeRoom = useCallback(() => {
    const rooms = Object.entries(data.roomTimeSpent);
    if (rooms.length === 0) return null;
    return rooms.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  }, [data.roomTimeSpent]);

  const formatTime = useCallback((seconds: number) => {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minutes`;
  }, []);

  const getDaysSinceFirst = useCallback(() => {
    return Math.floor((Date.now() - data.firstVisit) / (1000 * 60 * 60 * 24));
  }, [data.firstVisit]);

  return {
    data,
    enterRoom,
    leaveRoom,
    getTimeOfDay,
    getFavoriteRoom,
    getMostTimeRoom,
    formatTime,
    getDaysSinceFirst,
  };
}

// Room name mappings for display
export const roomDisplayNames: Record<string, string> = {
  'typography': 'the Words',
  'portrait': 'the Figure',
  'aquarium': 'the Aquarium',
  'forest': 'the Forest',
  'pet': 'the Creature',
  'console': 'the Console',
  'lure': 'the Lure',
};
