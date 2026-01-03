
import React from 'react';
import Header from './Header';
import { Character } from '../../types/index';

interface Props {
  day: number;
  characters: Character[];
  onNextDay: () => void;
  onReset: () => void;
  onOpenSaveLoad?: () => void;
  onOpenSettings?: () => void; // New Prop
  children: React.ReactNode;
}

const GameLayout: React.FC<Props> = ({ day, characters, onNextDay, onReset, onOpenSaveLoad, onOpenSettings, children }) => {
  return (
    <div className="min-h-screen bg-[#232323] text-gray-200">
      <Header 
        day={day} 
        characters={characters} 
        onNextDay={onNextDay} 
        onReset={onReset}
        onOpenSaveLoad={onOpenSaveLoad} 
        onOpenSettings={onOpenSettings}
      />
      
      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {children}
      </div>
    </div>
  );
};

export default GameLayout;
