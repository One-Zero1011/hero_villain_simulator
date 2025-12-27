import React from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { Role } from './types/index';
import { Users, Shield, Skull, PlusCircle } from 'lucide-react';
import Header from './components/layout/Header';
import AddCharacterModal from './components/character/AddCharacterModal';
import LogViewer from './components/simulation/LogViewer';
import CharacterSection from './components/character/CharacterSection';
import BattleArena from './components/battle/BattleArena';
import HousingModal from './components/housing/HousingModal';

function App() {
  const {
    day,
    characters,
    logs,
    currentBattle,
    housingModalChar,
    isAddCharModalOpen,
    setIsAddCharModalOpen,
    setHousingModalChar,
    handleNextDay,
    handleAddCharacter,
    handleDeleteCharacter,
    handleHousingSave,
    handleReset,
    handleBattleComplete
  } = useGameEngine();

  // Filtering characters
  const heroes = characters.filter(c => c.role === Role.HERO);
  const villains = characters.filter(c => c.role === Role.VILLAIN);
  const civilians = characters.filter(c => c.role === Role.CIVILIAN);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      
      {currentBattle && (
        <BattleArena 
          hero={currentBattle.hero} 
          villain={currentBattle.villain} 
          onComplete={handleBattleComplete} 
        />
      )}

      {housingModalChar && (
        <HousingModal 
          character={housingModalChar}
          isOpen={!!housingModalChar}
          onClose={() => setHousingModalChar(null)}
          onSave={handleHousingSave}
        />
      )}

      <AddCharacterModal
        isOpen={isAddCharModalOpen}
        onClose={() => setIsAddCharModalOpen(false)}
        onAdd={handleAddCharacter}
        existingCharacters={characters}
      />

      <Header 
        day={day} 
        characters={characters} 
        onNextDay={handleNextDay} 
        onReset={handleReset} 
      />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar: Controls & Logs (4 columns) */}
        <div className="lg:col-span-4 space-y-6 flex flex-col h-[calc(100vh-6rem)] sticky top-24">
          
          {/* Add Character Button */}
          <button 
            onClick={() => setIsAddCharModalOpen(true)}
            className="w-full bg-slate-800 hover:bg-slate-700 border-2 border-dashed border-slate-600 hover:border-blue-500 text-slate-400 hover:text-blue-400 rounded-xl p-6 transition-all group flex flex-col items-center gap-2"
          >
            <div className="p-3 bg-slate-900 rounded-full group-hover:scale-110 transition-transform">
              <PlusCircle className="w-8 h-8" />
            </div>
            <span className="font-bold">새로운 캐릭터 등록</span>
            <span className="text-xs text-slate-500">히어로, 빌런, 시민을 추가하세요</span>
          </button>
          
          <div className="flex-1 min-h-0 flex flex-col">
            <LogViewer logs={logs} />
          </div>
        </div>

        {/* Right Content: Character Lists (8 columns) */}
        <div className="lg:col-span-8 space-y-8 overflow-y-auto pb-20">
          
          <CharacterSection
            title="히어로"
            icon={<Shield className="w-5 h-5" />}
            colorClass="text-blue-300"
            badgeClass="bg-blue-900/30 text-blue-300"
            characters={heroes}
            onDelete={handleDeleteCharacter}
            onOpenHousing={setHousingModalChar}
          />

          <CharacterSection
            title="빌런"
            icon={<Skull className="w-5 h-5" />}
            colorClass="text-red-300"
            badgeClass="bg-red-900/30 text-red-300"
            characters={villains}
            onDelete={handleDeleteCharacter}
            onOpenHousing={setHousingModalChar}
          />

          <CharacterSection
            title="시민"
            icon={<Users className="w-5 h-5" />}
            colorClass="text-emerald-300"
            badgeClass="bg-emerald-900/30 text-emerald-300"
            characters={civilians}
            onDelete={handleDeleteCharacter}
            onOpenHousing={setHousingModalChar}
          />

        </div>
      </div>
    </div>
  );
}

export default App;