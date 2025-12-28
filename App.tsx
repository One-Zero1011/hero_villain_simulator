
import { useState } from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { Role } from './types/index';
import { Shield, Skull, Users } from 'lucide-react';
import AddCharacterModal from './components/character/AddCharacterModal';
import CharacterSection from './components/character/CharacterSection';
import BattleArena from './components/battle/BattleArena';
import HousingModal from './components/housing/HousingModal';
import InventoryModal from './components/inventory/InventoryModal'; // Added import
import GameLayout from './components/layout/GameLayout';
import Sidebar from './components/layout/Sidebar';

function App() {
  const {
    day,
    characters,
    factionResources,
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
    handleBattleComplete,
    handleUseItem
  } = useGameEngine();

  // Inventory Modal State
  const [inventoryModalRole, setInventoryModalRole] = useState<Role | null>(null);

  // Filtering characters
  const heroes = characters.filter(c => c.role === Role.HERO);
  const villains = characters.filter(c => c.role === Role.VILLAIN);
  const civilians = characters.filter(c => c.role === Role.CIVILIAN);

  const getCharactersByRole = (role: Role | null) => {
    if (!role) return [];
    return characters.filter(c => c.role === role);
  };

  return (
    <GameLayout
      day={day}
      characters={characters}
      onNextDay={handleNextDay}
      onReset={handleReset}
    >
      {/* Global Modals */}
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
          allCharacters={characters}
          isOpen={!!housingModalChar}
          onClose={() => setHousingModalChar(null)}
          onSave={handleHousingSave}
        />
      )}

      {inventoryModalRole && (
        <InventoryModal 
          role={inventoryModalRole}
          resources={factionResources[inventoryModalRole]}
          characters={getCharactersByRole(inventoryModalRole)}
          isOpen={!!inventoryModalRole}
          onClose={() => setInventoryModalRole(null)}
          onUseItem={handleUseItem}
        />
      )}

      <AddCharacterModal
        isOpen={isAddCharModalOpen}
        onClose={() => setIsAddCharModalOpen(false)}
        onAdd={handleAddCharacter}
        existingCharacters={characters}
      />

      {/* Left Sidebar */}
      <Sidebar 
        characters={characters}
        logs={logs} 
        onOpenAddModal={() => setIsAddCharModalOpen(true)} 
      />

      {/* Right Content: Character Lists */}
      <div className="lg:col-span-8 space-y-8 overflow-y-auto pb-20">
        <CharacterSection
          title="히어로"
          icon={<Shield className="w-5 h-5" />}
          colorClass="text-blue-300"
          badgeClass="bg-blue-900/30 text-blue-300"
          characters={heroes}
          resources={factionResources[Role.HERO]}
          onDelete={handleDeleteCharacter}
          onOpenHousing={setHousingModalChar}
          onOpenInventory={() => setInventoryModalRole(Role.HERO)}
        />

        <CharacterSection
          title="빌런"
          icon={<Skull className="w-5 h-5" />}
          colorClass="text-red-300"
          badgeClass="bg-red-900/30 text-red-300"
          characters={villains}
          resources={factionResources[Role.VILLAIN]}
          onDelete={handleDeleteCharacter}
          onOpenHousing={setHousingModalChar}
          onOpenInventory={() => setInventoryModalRole(Role.VILLAIN)}
        />

        <CharacterSection
          title="시민"
          icon={<Users className="w-5 h-5" />}
          colorClass="text-emerald-300"
          badgeClass="bg-emerald-900/30 text-emerald-300"
          characters={civilians}
          resources={factionResources[Role.CIVILIAN]}
          onDelete={handleDeleteCharacter}
          onOpenHousing={setHousingModalChar}
          onOpenInventory={() => setInventoryModalRole(Role.CIVILIAN)}
        />
      </div>
    </GameLayout>
  );
}

export default App;
