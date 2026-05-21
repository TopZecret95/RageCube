import React, { useEffect, useState } from 'react';

// Common key codes used in the game
export const KEY_BINDINGS = {
  UP: 'ArrowUp',
  DOWN: 'ArrowDown',
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
  JUMP: 'Space', 
  ACTION: 'KeyQ', // Hook/Abilities use Q or Ctrl
  PAUSE: 'Escape',
};

const dispatchKey = (type: 'keydown' | 'keyup', code: string) => {
  window.dispatchEvent(new KeyboardEvent(type, { code, key: code, bubbles: true }));
};

const ControlButton = ({ 
    code, 
    label, 
    className = "" 
}: { 
    code: string, 
    label: React.ReactNode, 
    className?: string 
}) => {
  return (
    <button
      className={`select-none touch-none bg-white/20 active:bg-white/50 border-2 border-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold shadow-lg pointer-events-auto ${className}`}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onTouchStart={(e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatchKey('keydown', code);
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatchKey('keyup', code);
      }}
      onTouchCancel={(e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatchKey('keyup', code);
      }}
    >
      {label}
    </button>
  );
};

export const MobileControls = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch capability
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();
    window.addEventListener('touchstart', checkTouch, { once: true });
  }, []);

  if (!isTouchDevice) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-[100] flex flex-col justify-end p-6">
      <div className="flex justify-between items-end w-full max-w-4xl mx-auto pb-4 md:pb-8">
        
        {/* Left D-Pad */}
        <div className="relative w-36 h-36 md:w-48 md:h-48">
          <ControlButton 
            code={KEY_BINDINGS.UP} 
            label="▲" 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 md:w-16 md:h-16" 
          />
          <ControlButton 
            code={KEY_BINDINGS.LEFT} 
            label="◀" 
            className="absolute top-1/2 left-0 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16" 
          />
          <ControlButton 
            code={KEY_BINDINGS.RIGHT} 
            label="▶" 
            className="absolute top-1/2 right-0 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16" 
          />
          <ControlButton 
            code={KEY_BINDINGS.DOWN} 
            label="▼" 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 md:w-16 md:h-16" 
          />
        </div>

        {/* Right Action Buttons */}
        <div className="relative w-36 h-36 md:w-48 md:h-48">
           <ControlButton 
            code={KEY_BINDINGS.JUMP} 
            label="A" 
            className="absolute bottom-4 left-0 w-16 h-16 md:w-20 md:h-20 text-xl font-arcade bg-blue-500/30 border-blue-400/50" 
          />
           <ControlButton 
            code={KEY_BINDINGS.ACTION} 
            label="B" 
            className="absolute top-4 right-0 w-16 h-16 md:w-20 md:h-20 text-xl font-arcade bg-red-500/30 border-red-400/50" 
          />
        </div>
      </div>
      
      {/* Top right Pause */}
      <div className="absolute top-6 right-6">
        <ControlButton 
            code={KEY_BINDINGS.PAUSE} 
            label="||" 
            className="w-10 h-10 md:w-12 md:h-12 bg-neutral-800/40 text-[10px] font-arcade tracking-wider" 
        />
      </div>
    </div>
  );
};
