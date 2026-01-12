import { useState, useEffect, useRef, useMemo } from 'react';
import { usePersonalizationContext } from '../../context/PersonalizationContext';
import './ThePet.css';

export default function ThePet() {
  const { data } = usePersonalizationContext();
  const petVisits = data.roomVisits['pet'] || 0;
  
  const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [time, setTime] = useState(0);
  const [blink, setBlink] = useState(false);
  const [showHearts, setShowHearts] = useState(false);
  const animationRef = useRef<number>(0);

  // Familiarity level based on visits (DEBUG: compressed scale for testing)
  const familiarity = useMemo(() => {
    if (petVisits <= 1) return 'stranger';
    if (petVisits === 2) return 'curious';
    if (petVisits === 3) return 'familiar';
    if (petVisits === 4) return 'friend';
    return 'bonded'; // 5+
  }, [petVisits]);

  // Fixed position - creature stays in center
  const creatureX = window.innerWidth / 2;
  const creatureY = window.innerHeight / 2;

  // Status message based on familiarity
  const statusMessage = useMemo(() => {
    switch (familiarity) {
      case 'stranger':
        return '...';
      case 'curious':
        return 'it noticed you';
      case 'familiar':
        return 'it recognizes you';
      case 'friend':
        return 'it is happy to see you!';
      case 'bonded':
        return '♥ it loves you ♥';
      default:
        return '';
    }
  }, [familiarity]);

  // Debug: reset all data
  const handleReset = () => {
    localStorage.removeItem('chaos-playground-data');
    window.location.reload();
  };

  // Show hearts on bonded entrance
  useEffect(() => {
    if (familiarity === 'bonded') {
      setShowHearts(true);
      setTimeout(() => setShowHearts(false), 3000);
    }
  }, [familiarity]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      setTime(t => t + 0.016);
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  // Blinking
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3) {
        setBlink(true);
        setTimeout(() => setBlink(false), 100);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Eye look direction
  const dx = mousePos.x - creatureX;
  const dy = mousePos.y - creatureY;
  const eyeLookX = Math.max(-1, Math.min(1, dx / 400));
  const eyeLookY = Math.max(-1, Math.min(1, dy / 400));

  // STRANGER: Tiny, in corner, facing away, minimal movement
  if (familiarity === 'stranger') {
    const cornerX = window.innerWidth - 120;
    const cornerY = window.innerHeight - 120;
    const gentleFloat = Math.sin(time * 0.8) * 3;
    
    return (
      <div className="pet-room familiarity-stranger">
        <div 
          className="creature stranger"
          style={{
            left: cornerX,
            top: cornerY + gentleFloat,
            transform: 'translate(-50%, -50%) scale(0.5)',
          }}
        >
          <div className="creature-body">
            <div className="body-glow dim" />
          </div>
          {/* Facing away - no face visible, just back of head */}
          <div className="back-of-head" />
          {/* Ears drooped down */}
          <div className="ear ear-left" style={{ transform: 'rotate(-50deg)' }}>
            <div className="ear-inner" />
          </div>
          <div className="ear ear-right" style={{ transform: 'rotate(50deg)' }}>
            <div className="ear-inner" />
          </div>
          {/* Tail tucked */}
          <div className="tail" style={{ transform: 'rotate(-30deg) scale(0.7)' }}>
            <div className="tail-tip" />
          </div>
        </div>
        
        <div className="pet-label stranger-label">
          {statusMessage}
          <span className="visit-count">(visit {petVisits})</span>
        </div>
        <button onClick={handleReset} className="debug-reset">Reset Data</button>
      </div>
    );
  }

  // CURIOUS: Small, off to side, peeking, occasional glances
  if (familiarity === 'curious') {
    const sideX = window.innerWidth - 200;
    const sideY = window.innerHeight / 2;
    const peekAmount = Math.sin(time * 1.5) > 0.7 ? 1 : 0;
    const gentleFloat = Math.sin(time) * 5;
    
    return (
      <div className="pet-room familiarity-curious">
        <div 
          className="creature curious"
          style={{
            left: sideX,
            top: sideY + gentleFloat,
            transform: `translate(-50%, -50%) scale(0.7) rotate(${-15 + peekAmount * 15}deg)`,
          }}
        >
          <div className="creature-body">
            <div className="body-glow dim" />
          </div>
          
          {/* Ears - one perked listening */}
          <div className="ear ear-left" style={{ transform: `rotate(${-30 + peekAmount * 20}deg)` }}>
            <div className="ear-inner" />
          </div>
          <div className="ear ear-right" style={{ transform: 'rotate(40deg)' }}>
            <div className="ear-inner" />
          </div>

          <div className="face">
            {/* Eyes - wide, cautious, looking at you when peeking */}
            <div className={`eye eye-left ${blink ? 'blink' : ''}`}>
              <div className="eye-white">
                <div 
                  className="iris small"
                  style={{
                    transform: peekAmount 
                      ? `translate(${eyeLookX * 6}px, ${eyeLookY * 4}px)` 
                      : 'translate(-5px, 0)',
                  }}
                >
                  <div className="pupil" />
                  <div className="eye-shine" />
                </div>
              </div>
            </div>
            <div className={`eye eye-right ${blink ? 'blink' : ''}`}>
              <div className="eye-white">
                <div 
                  className="iris small"
                  style={{
                    transform: peekAmount 
                      ? `translate(${eyeLookX * 6}px, ${eyeLookY * 4}px)` 
                      : 'translate(-5px, 0)',
                  }}
                >
                  <div className="pupil" />
                  <div className="eye-shine" />
                </div>
              </div>
            </div>
            <div className="nose" />
            <div className="mouth tiny" />
          </div>

          <div className="tail" style={{ transform: 'rotate(-10deg)' }}>
            <div className="tail-tip" />
          </div>
        </div>
        
        <div className="pet-label">
          {statusMessage}
          <span className="visit-count">(visit {petVisits})</span>
        </div>
        <button onClick={handleReset} className="debug-reset">Reset Data</button>
      </div>
    );
  }

  // FAMILIAR: Center, normal size, watches you, gentle idle animation
  if (familiarity === 'familiar') {
    const floatY = Math.sin(time * 1.2) * 8;
    const floatRotate = Math.sin(time * 0.7) * 3;
    const tailWag = Math.sin(time * 2) * 12;
    
    return (
      <div className="pet-room familiarity-familiar">
        <div className="ambient-glow" style={{ left: creatureX, top: creatureY }} />
        
        <div 
          className="creature familiar"
          style={{
            left: creatureX,
            top: creatureY + floatY,
            transform: `translate(-50%, -50%) rotate(${floatRotate}deg)`,
          }}
        >
          <div className="creature-shadow" />
          <div className="creature-body">
            <div className="body-glow" />
          </div>
          
          <div className="ear ear-left" style={{ transform: `rotate(${-20 + Math.sin(time) * 5}deg)` }}>
            <div className="ear-inner" />
          </div>
          <div className="ear ear-right" style={{ transform: `rotate(${20 - Math.sin(time + 0.5) * 5}deg)` }}>
            <div className="ear-inner" />
          </div>

          <div className="face">
            <div className={`eye eye-left ${blink ? 'blink' : ''}`}>
              <div className="eye-white">
                <div 
                  className="iris"
                  style={{ transform: `translate(${eyeLookX * 7}px, ${eyeLookY * 5}px)` }}
                >
                  <div className="pupil" />
                  <div className="eye-shine" />
                  <div className="eye-shine small" />
                </div>
              </div>
            </div>
            <div className={`eye eye-right ${blink ? 'blink' : ''}`}>
              <div className="eye-white">
                <div 
                  className="iris"
                  style={{ transform: `translate(${eyeLookX * 7}px, ${eyeLookY * 5}px)` }}
                >
                  <div className="pupil" />
                  <div className="eye-shine" />
                  <div className="eye-shine small" />
                </div>
              </div>
            </div>
            <div className="nose" />
            <div className="mouth" />
            <div className="cheek cheek-left" />
            <div className="cheek cheek-right" />
          </div>

          <div className="arm arm-left" style={{ transform: `rotate(${-10 + Math.sin(time) * 5}deg)` }} />
          <div className="arm arm-right" style={{ transform: `rotate(${10 - Math.sin(time + 1) * 5}deg)` }} />
          
          <div className="tail" style={{ transform: `rotate(${tailWag}deg)` }}>
            <div className="tail-tip" />
          </div>
          
          <div className="foot foot-left" />
          <div className="foot foot-right" />
        </div>
        
        <div className="pet-label">
          {statusMessage}
          <span className="visit-count">(visit {petVisits})</span>
        </div>
        <button onClick={handleReset} className="debug-reset">Reset Data</button>
      </div>
    );
  }

  // FRIEND: Bouncy, animated, waving, big smile
  if (familiarity === 'friend') {
    const bounce = Math.abs(Math.sin(time * 3)) * 20;
    const floatRotate = Math.sin(time * 2) * 8;
    const tailWag = Math.sin(time * 5) * 25;
    const wave = Math.sin(time * 4) * 30;
    const earBounce = Math.sin(time * 3) * 15;
    
    return (
      <div className="pet-room familiarity-friend">
        <div className="ambient-glow bright" style={{ left: creatureX, top: creatureY }} />
        
        {/* Sparkles */}
        <div className="sparkles">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="sparkle"
              style={{
                left: creatureX + Math.sin(time + i * 0.6) * 120,
                top: creatureY + Math.cos(time + i * 0.6) * 100 - bounce,
                opacity: 0.5 + Math.sin(time * 2 + i) * 0.3,
              }}
            />
          ))}
        </div>
        
        <div 
          className="creature friend"
          style={{
            left: creatureX,
            top: creatureY - bounce,
            transform: `translate(-50%, -50%) rotate(${floatRotate}deg) scale(1.1)`,
          }}
        >
          <div className="creature-shadow" style={{ opacity: 0.3 - bounce * 0.01 }} />
          <div className="creature-body">
            <div className="body-glow bright" />
          </div>
          
          {/* Perky ears */}
          <div className="ear ear-left" style={{ transform: `rotate(${-5 + earBounce}deg)` }}>
            <div className="ear-inner" />
          </div>
          <div className="ear ear-right" style={{ transform: `rotate(${5 - earBounce}deg)` }}>
            <div className="ear-inner" />
          </div>

          <div className="face">
            {/* Happy squinty eyes */}
            <div className={`eye eye-left happy ${blink ? 'blink' : ''}`}>
              <div className="eye-white">
                <div 
                  className="iris"
                  style={{ transform: `translate(${eyeLookX * 5}px, ${eyeLookY * 3}px)` }}
                >
                  <div className="pupil big" />
                  <div className="eye-shine" />
                  <div className="eye-shine small" />
                </div>
              </div>
            </div>
            <div className={`eye eye-right happy ${blink ? 'blink' : ''}`}>
              <div className="eye-white">
                <div 
                  className="iris"
                  style={{ transform: `translate(${eyeLookX * 5}px, ${eyeLookY * 3}px)` }}
                >
                  <div className="pupil big" />
                  <div className="eye-shine" />
                  <div className="eye-shine small" />
                </div>
              </div>
            </div>
            <div className="nose" />
            <div className="mouth big-smile" />
            <div className="cheek cheek-left bright" />
            <div className="cheek cheek-right bright" />
          </div>

          {/* One arm waving! */}
          <div className="arm arm-left" style={{ transform: `rotate(${-60 + wave}deg)` }} />
          <div className="arm arm-right" style={{ transform: `rotate(${10 - Math.sin(time + 1) * 8}deg)` }} />
          
          <div className="tail" style={{ transform: `rotate(${tailWag}deg)` }}>
            <div className="tail-tip" />
          </div>
          
          <div className="foot foot-left" />
          <div className="foot foot-right" />
        </div>
        
        <div className="pet-label friend-label">
          {statusMessage}
          <span className="visit-count">(visit {petVisits})</span>
        </div>
        <button onClick={handleReset} className="debug-reset">Reset Data</button>
      </div>
    );
  }

  // BONDED: Ecstatic, dancing, hearts everywhere, maximum joy
  const dance = Math.sin(time * 4) * 15;
  const bigBounce = Math.abs(Math.sin(time * 3.5)) * 30;
  const spinWobble = Math.sin(time * 2.5) * 12;
  const tailWag = Math.sin(time * 6) * 35;
  const armDance = Math.sin(time * 4);
  
  return (
    <div className="pet-room familiarity-bonded">
      <div className="ambient-glow huge" style={{ left: creatureX, top: creatureY }} />
      
      {/* Hearts floating up */}
      {showHearts && (
        <div className="hearts-container">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="floating-heart"
              style={{
                left: creatureX + (Math.random() - 0.5) * 200,
                animationDelay: `${i * 0.2}s`,
              }}
            >
              ♥
            </div>
          ))}
        </div>
      )}
      
      {/* Lots of sparkles */}
      <div className="sparkles">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="sparkle big"
            style={{
              left: creatureX + Math.sin(time * 0.8 + i * 0.4) * 150,
              top: creatureY + Math.cos(time * 0.8 + i * 0.4) * 120 - bigBounce,
              opacity: 0.6 + Math.sin(time * 3 + i) * 0.3,
            }}
          />
        ))}
      </div>
      
      <div 
        className="creature bonded"
        style={{
          left: creatureX + dance,
          top: creatureY - bigBounce,
          transform: `translate(-50%, -50%) rotate(${spinWobble}deg) scale(1.2)`,
        }}
      >
        <div className="creature-shadow" style={{ opacity: 0.2 }} />
        <div className="creature-body">
          <div className="body-glow huge" />
        </div>
        
        {/* Super perky ears */}
        <div className="ear ear-left" style={{ transform: `rotate(${10 + Math.sin(time * 4) * 20}deg)` }}>
          <div className="ear-inner" />
        </div>
        <div className="ear ear-right" style={{ transform: `rotate(${-10 - Math.sin(time * 4 + 0.5) * 20}deg)` }}>
          <div className="ear-inner" />
        </div>

        <div className="face">
          {/* Super happy closed-eye smile */}
          <div className="eye eye-left ecstatic">
            <div className="happy-arc" />
          </div>
          <div className="eye eye-right ecstatic">
            <div className="happy-arc" />
          </div>
          <div className="nose" />
          <div className="mouth huge-smile" />
          <div className="cheek cheek-left huge" />
          <div className="cheek cheek-right huge" />
        </div>

        {/* Both arms up dancing */}
        <div className="arm arm-left" style={{ transform: `rotate(${-70 + armDance * 25}deg)` }} />
        <div className="arm arm-right" style={{ transform: `rotate(${70 - armDance * 25}deg)` }} />
        
        <div className="tail" style={{ transform: `rotate(${tailWag}deg)` }}>
          <div className="tail-tip" />
        </div>
        
        {/* Dancing feet */}
        <div className="foot foot-left" style={{ transform: `translateY(${Math.sin(time * 4) * 5}px)` }} />
        <div className="foot foot-right" style={{ transform: `translateY(${Math.sin(time * 4 + Math.PI) * 5}px)` }} />
      </div>
      
      <div className="pet-label bonded-label">
        {statusMessage}
        <span className="visit-count">(visit {petVisits})</span>
      </div>
      <button onClick={handleReset} className="debug-reset">Reset Data</button>
    </div>
  );
}
