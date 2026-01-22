// components/ui/FrogMascot.tsx
import React from 'react';

interface FrogMascotProps {
  mood?: 'idle' | 'working' | 'happy';
  size?: 'sm' | 'md' | 'lg';
}

export const FrogMascot: React.FC<FrogMascotProps> = ({ mood = 'idle', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10 text-xl',
    md: 'w-16 h-16 text-3xl',
    lg: 'w-24 h-24 text-5xl',
  };

  return (
    <div className={`${sizeClasses[size]} bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]`}>
      <div>
        {mood === 'idle' && '🐸'}
        {mood === 'working' && '🐸💻'}
        {mood === 'happy' && '🐸✨'}
      </div>
    </div>
  );
};