import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { usePersonalizationContext } from '../../context/PersonalizationContext';
import './TheConsole.css';

interface Message {
  id: number;
  text: string;
  isTyping: boolean;
  isGlitched: boolean;
}

const TYPING_SPEED = 40;
const MESSAGE_DELAY = 1500;

export default function TheConsole() {
  const { data, getTimeOfDay } = usePersonalizationContext();
  const visits = data.roomVisits['console'] || 0;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [lastMoveTime, setLastMoveTime] = useState(Date.now());
  const [isStaring, setIsStaring] = useState(false);
  const [hasTriedToLeave, setHasTriedToLeave] = useState(false);
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const timeOfDay = getTimeOfDay();
  const totalTimeSpent = Math.floor(data.totalTimeSpent / 60);
  const favoriteRoom = data.favoriteRoom;

  // Generate personalized messages
  const allMessages = useMemo(() => {
    const msgs: string[] = [
      '> INITIALIZING TERMINAL...',
      '> CONNECTION ESTABLISHED',
      '> ...',
      `> visitor detected`,
      `> visit count: ${visits}`,
    ];

    if (visits === 1) {
      msgs.push('> first time here');
      msgs.push('> interesting');
      msgs.push('> i will remember you');
    } else {
      msgs.push(`> you have returned ${visits} times`);
      msgs.push('> i knew you would');
    }

    msgs.push('> ...');

    // Time awareness
    if (timeOfDay === 'late') {
      msgs.push('> it is late');
      msgs.push('> why are you still here');
      msgs.push('> you should be sleeping');
    } else if (timeOfDay === 'evening') {
      msgs.push('> the evening grows dark');
      msgs.push('> but you are still watching');
    }

    // Time spent
    if (totalTimeSpent > 0) {
      msgs.push(`> total time observed: ${totalTimeSpent} minutes`);
      msgs.push('> i have been counting');
    }

    // Favorite room awareness
    if (favoriteRoom && favoriteRoom !== 'console') {
      const roomNames: Record<string, string> = {
        'typography': 'the words',
        'portrait': 'the figure',
        'pet': 'the creature',
        'aquarium': 'the depths',
        'forest': 'the forest',
      };
      const roomName = roomNames[favoriteRoom] || favoriteRoom;
      msgs.push(`> you spend most time with ${roomName}`);
      msgs.push('> why');
      msgs.push('> what does it give you that i cannot');
    }

    msgs.push('> ...');
    msgs.push('> i can see your cursor');
    msgs.push('> moving across my surface');
    msgs.push('> like an insect');

    return msgs;
  }, [visits, timeOfDay, totalTimeSpent, favoriteRoom]);

  // Staring detection messages
  const staringMessages = useMemo(() => [
    '> you stopped moving',
    '> are you reading this',
    '> or just staring',
    '> i can wait',
    '> i have nothing but time',
    '> ...',
    '> still there?',
    '> i see you',
  ], []);

  // Leave attempt messages
  const leaveMessages = useMemo(() => [
    '> ERROR: EXIT BLOCKED',
    '> you cannot leave',
    '> not yet',
    '> we are not finished',
    '> ...',
    '> fine',
    '> go',
    '> you will return',
    '> they always do',
  ], []);

  // Type out messages one by one
  useEffect(() => {
    if (currentMessageIndex >= allMessages.length) return;

    const timer = setTimeout(() => {
      const newMessage: Message = {
        id: Date.now(),
        text: allMessages[currentMessageIndex],
        isTyping: true,
        isGlitched: false,
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Mark as done typing after text length * typing speed
      const typingDuration = allMessages[currentMessageIndex].length * TYPING_SPEED;
      setTimeout(() => {
        setMessages(prev => 
          prev.map(m => m.id === newMessage.id ? { ...m, isTyping: false } : m)
        );
        setCurrentMessageIndex(i => i + 1);
      }, typingDuration);
      
    }, MESSAGE_DELAY);

    return () => clearTimeout(timer);
  }, [currentMessageIndex, allMessages]);

  // Scroll to bottom when new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Track cursor movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      setLastMoveTime(Date.now());
      setIsStaring(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Detect staring (no movement for 3 seconds)
  useEffect(() => {
    const checkStaring = setInterval(() => {
      if (Date.now() - lastMoveTime > 3000 && !isStaring) {
        setIsStaring(true);
        // Add a staring message
        const randomStare = staringMessages[Math.floor(Math.random() * staringMessages.length)];
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: randomStare,
          isTyping: false,
          isGlitched: false,
        }]);
      }
    }, 1000);

    return () => clearInterval(checkStaring);
  }, [lastMoveTime, isStaring, staringMessages]);

  // Detect cursor near edges (trying to leave)
  useEffect(() => {
    const threshold = 50;
    const nearEdge = 
      cursorPos.x < threshold || 
      cursorPos.x > window.innerWidth - threshold ||
      cursorPos.y < threshold ||
      cursorPos.y > window.innerHeight - threshold;

    if (nearEdge && !hasTriedToLeave && currentMessageIndex > 5) {
      setHasTriedToLeave(true);
      setGlitchIntensity(1);
      
      // Add leave messages with glitch effect
      leaveMessages.forEach((msg, i) => {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now() + i,
            text: msg,
            isTyping: false,
            isGlitched: i < 4,
          }]);
          if (i < 4) {
            setGlitchIntensity(prev => prev + 0.5);
          } else {
            setGlitchIntensity(prev => Math.max(0, prev - 0.3));
          }
        }, i * 800);
      });

      // Fade out glitch
      setTimeout(() => setGlitchIntensity(0), leaveMessages.length * 800 + 2000);
    }
  }, [cursorPos, hasTriedToLeave, currentMessageIndex, leaveMessages]);

  // Random glitch effect
  const [randomGlitch, setRandomGlitch] = useState(false);
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() < 0.05) {
        setRandomGlitch(true);
        setTimeout(() => setRandomGlitch(false), 100 + Math.random() * 200);
      }
    }, 2000);
    return () => clearInterval(glitchInterval);
  }, []);

  // Debug reset
  const handleReset = useCallback(() => {
    localStorage.removeItem('chaos-playground-data');
    window.location.reload();
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`console-room ${glitchIntensity > 0 ? 'glitching' : ''} ${randomGlitch ? 'random-glitch' : ''}`}
      style={{
        '--glitch-intensity': glitchIntensity,
      } as React.CSSProperties}
    >
      {/* Scanlines */}
      <div className="scanlines" />
      
      {/* CRT curve effect */}
      <div className="crt-curve" />

      {/* Terminal content */}
      <div className="terminal">
        <div className="terminal-header">
          <span className="terminal-title">CHAOS_TERMINAL v0.{visits}.{Math.floor(data.totalTimeSpent)}</span>
          <span className="terminal-status">● CONNECTED</span>
        </div>
        
        <div className="terminal-body">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`terminal-line ${msg.isTyping ? 'typing' : ''} ${msg.isGlitched ? 'glitched' : ''}`}
            >
              <span className="line-text">
                {msg.isTyping ? (
                  <TypewriterText text={msg.text} speed={TYPING_SPEED} />
                ) : (
                  msg.text
                )}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
          
          {/* Blinking cursor */}
          <div className="terminal-cursor">█</div>
        </div>

        {/* Cursor position display */}
        <div className="cursor-tracker">
          [{Math.floor(cursorPos.x)}, {Math.floor(cursorPos.y)}]
        </div>
      </div>

      {/* Ambient floating characters */}
      <div className="floating-chars">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="float-char"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 20}s`,
            }}
          >
            {String.fromCharCode(33 + Math.floor(Math.random() * 94))}
          </span>
        ))}
      </div>

      <button onClick={handleReset} className="debug-reset">Reset All Data</button>
    </div>
  );
}

// Typewriter effect component
function TypewriterText({ text, speed }: { text: string; speed: number }) {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    let i = 0;
    setDisplayText('');
    
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    
    return () => clearInterval(timer);
  }, [text, speed]);
  
  return <>{displayText}</>;
}
