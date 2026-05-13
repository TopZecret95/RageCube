import React, { useEffect } from 'react';
import introImage from '../intro.png';

interface ComicIntroProps {
  onComplete: () => void;
}

export const ComicIntro: React.FC<ComicIntroProps> = ({ onComplete }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        onComplete();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onComplete]);

  return (
    <div 
      className="absolute inset-0 z-50 flex items-center justify-center bg-black cursor-pointer overflow-hidden p-8 lg:p-16"
      onClick={onComplete}
    >
      <img 
        src={introImage} 
        alt="Comic Intro"
        className="w-full h-full object-contain pointer-events-none rounded-xl"
      />
      <div className="absolute bottom-8 right-8 text-gray-500 font-mono text-sm tracking-widest uppercase animate-pulse">
        Click anywhere to start
      </div>
    </div>
  );
};

