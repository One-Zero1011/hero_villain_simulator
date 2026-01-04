
import React from 'react';
import Header from './Header';
import NavigationBar from './NavigationBar';
import { Character } from '../../types/index';

interface Props {
  day: number;
  characters: Character[];
  onNextDay: () => void;
  onReset: () => void;
  onOpenSaveLoad?: () => void;
  onOpenSettings?: () => void;
  currentView: 'CITY' | 'SHOP'; // Added prop
  onNavigate: (view: 'CITY' | 'SHOP') => void; // Added prop
  children: React.ReactNode;
}

const GameLayout: React.FC<Props> = ({ 
  day, characters, onNextDay, onReset, onOpenSaveLoad, onOpenSettings, 
  currentView, onNavigate, children 
}) => {
  return (
    <div className="min-h-screen bg-[#232323] text-gray-200 flex flex-col">
      <Header 
        day={day} 
        characters={characters} 
        onNextDay={onNextDay} 
        onReset={onReset}
        onOpenSaveLoad={onOpenSaveLoad} 
        onOpenSettings={onOpenSettings}
      />
      
      <NavigationBar currentView={currentView} onNavigate={onNavigate} />
      
      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {children}
      </div>
    </div>
  );
};

export default GameLayout;
