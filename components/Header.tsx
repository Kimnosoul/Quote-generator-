
import React from 'react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile | null;
  onLogout: () => void;
  onGoHome: () => void;
  onGoGenerator: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onGoHome, onGoGenerator }) => {
  return (
    <header className="sticky top-0 z-50 glass-card border-b border-stone-100 px-6 py-4 flex justify-between items-center">
      <div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={onGoHome}
      >
        <div className="w-8 h-8 bg-stone-800 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <span className="font-serif text-xl tracking-tight font-bold">Sentience</span>
      </div>

      <nav className="flex items-center gap-4 md:gap-6">
        {user ? (
          <>
            <div className="flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-full text-[10px] md:text-sm font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {user.credits} <span className="hidden xs:inline">credits</span>
            </div>
            <button 
              onClick={onGoGenerator}
              className="text-sm font-medium hover:text-stone-500 transition-colors"
            >
              Generate
            </button>
            <button 
              onClick={onLogout}
              className="text-sm font-medium text-stone-400 hover:text-stone-800 transition-colors"
            >
              Sign out
            </button>
          </>
        ) : (
          <span className="text-xs text-stone-400 font-mono tracking-widest uppercase">Beta v2.0</span>
        )}
      </nav>
    </header>
  );
};

export default Header;
