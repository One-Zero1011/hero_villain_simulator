
import { useState } from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { Character, Role, Item } from './types/index';
import { Shield, Skull, Users } from 'lucide-react';
import AddCharacterModal from './components/character/AddCharacterModal';
import CharacterSection from './components/character/CharacterSection';
import BattleArena from './components/battle/BattleArena';
import HousingModal from './components/housing/HousingModal';
import InventoryModal from './components/inventory/InventoryModal';
import RelationshipMapModal from './components/relationships/RelationshipMapModal';
import SaveLoadModal from './components/simulation/SaveLoadModal';
import SettingsModal from './components/simulation/SettingsModal';
import ShopModal from './components/shop/ShopModal'; 
import GameLayout from './components/layout/GameLayout';
import Sidebar from './components/layout/Sidebar';
import ConfirmModal from './components/common/ConfirmModal'; 

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
    gameSettings,
    setGameSettings,
    handleNextDay,
    handleAddCharacter,
    handleUpdateCharacter,
    handleDeleteCharacter,
    handleHousingSave,
    handleReset,
    handleBattleComplete,
    handleUseItem,
    handleBuyItem,
    handleDebugSetMoney,
    handleDebugAddItem,
    handleUnequipItem,
    exportData,
    importData
  } = useGameEngine();

  // Navigation / Shop State
  const [currentView, setCurrentView] = useState<'CITY' | 'SHOP'>('CITY');

  // Inventory Modal State
  const [inventoryModalRole, setInventoryModalRole] = useState<Role | null>(null);
  
  // Relationship Map Modal State
  const [isRelMapOpen, setIsRelMapOpen] = useState(false);

  // Save/Load Modal State
  const [isSaveLoadOpen, setIsSaveLoadOpen] = useState(false);

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Edit Character State
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);

  // Unequip Confirmation State
  const [unequipRequest, setUnequipRequest] = useState<{ charId: string; slot: string; item: Item } | null>(null);

  // Reset Confirmation State
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Filtering characters
  const heroes = characters.filter(c => c.role === Role.HERO);
  const villains = characters.filter(c => c.role === Role.VILLAIN);
  const civilians = characters.filter(c => c.role === Role.CIVILIAN);

  const getCharactersByRole = (role: Role | null) => {
    if (!role) return [];
    return characters.filter(c => c.role === role);
  };

  const openEditModal = (char: Character) => {
    setEditingCharacter(char);
    setIsAddCharModalOpen(true);
  };

  const closeCharacterModal = () => {
    setIsAddCharModalOpen(false);
    setEditingCharacter(null);
  };

  const handleNavigate = (view: 'CITY' | 'SHOP') => {
    setCurrentView(view);
  };

  const requestUnequip = (charId: string, slot: string, item: Item) => {
    setUnequipRequest({ charId, slot, item });
  };

  const confirmUnequip = () => {
    if (unequipRequest) {
      handleUnequipItem(unequipRequest.charId, unequipRequest.slot);
      setUnequipRequest(null);
    }
  };

  const handleResetConfirm = () => {
    handleReset();
    setIsResetConfirmOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#232323] text-gray-200">
      <GameLayout
        day={day}
        characters={characters}
        onNextDay={handleNextDay}
        onReset={() => setIsResetConfirmOpen(true)}
        onOpenSaveLoad={() => setIsSaveLoadOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        currentView={currentView}
        onNavigate={handleNavigate}
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
        
        {/* Relationship Map Modal */}
        <RelationshipMapModal 
          characters={characters}
          isOpen={isRelMapOpen}
          onClose={() => setIsRelMapOpen(false)}
        />

        {/* Save/Load Modal */}
        <SaveLoadModal 
          isOpen={isSaveLoadOpen}
          onClose={() => setIsSaveLoadOpen(false)}
          onExport={exportData}
          onImport={importData}
        />

        {/* Settings Modal */}
        <SettingsModal 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={gameSettings}
          resources={factionResources}
          onUpdateSettings={setGameSettings}
          onDebugSetMoney={handleDebugSetMoney}
          onDebugAddItem={handleDebugAddItem}
        />

        {/* Shop Modal */}
        <ShopModal 
          isOpen={currentView === 'SHOP'}
          onClose={() => setCurrentView('CITY')}
          resources={factionResources}
          onBuyItem={handleBuyItem}
        />

        {/* Unequip Confirmation Modal */}
        <ConfirmModal 
          isOpen={!!unequipRequest}
          title="장비 해제"
          message={
            <>
              <span className="text-yellow-400 font-bold">{unequipRequest?.item.name}</span>을(를)<br/>
              장비에서 해제하여 인벤토리로 보낼까요?
            </>
          }
          confirmText="해제하기"
          onConfirm={confirmUnequip}
          onClose={() => setUnequipRequest(null)}
        />

        {/* Reset Confirmation Modal */}
        <ConfirmModal 
          isOpen={isResetConfirmOpen}
          title="게임 초기화"
          message="정말로 게임을 초기화하시겠습니까? 모든 진행 데이터가 사라지며 되돌릴 수 없습니다."
          confirmText="초기화"
          onConfirm={handleResetConfirm}
          onClose={() => setIsResetConfirmOpen(false)}
          type="danger"
        />

        <AddCharacterModal
          isOpen={isAddCharModalOpen}
          onClose={closeCharacterModal}
          onAdd={handleAddCharacter}
          onUpdate={handleUpdateCharacter}
          initialData={editingCharacter}
          existingCharacters={characters}
        />

        {/* Left Sidebar */}
        <Sidebar 
          characters={characters}
          logs={logs} 
          onOpenAddModal={() => setIsAddCharModalOpen(true)} 
          onOpenRelMap={() => setIsRelMapOpen(true)} 
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
            onEdit={openEditModal}
            onOpenHousing={setHousingModalChar}
            onOpenInventory={() => setInventoryModalRole(Role.HERO)}
            onRequestUnequip={requestUnequip}
          />

          <CharacterSection
            title="빌런"
            icon={<Skull className="w-5 h-5" />}
            colorClass="text-red-300"
            badgeClass="bg-red-900/30 text-red-300"
            characters={villains}
            resources={factionResources[Role.VILLAIN]}
            onDelete={handleDeleteCharacter}
            onEdit={openEditModal}
            onOpenHousing={setHousingModalChar}
            onOpenInventory={() => setInventoryModalRole(Role.VILLAIN)}
            onRequestUnequip={requestUnequip}
          />

          <CharacterSection
            title="시민"
            icon={<Users className="w-5 h-5" />}
            colorClass="text-emerald-300"
            badgeClass="bg-emerald-900/30 text-emerald-300"
            characters={civilians}
            resources={factionResources[Role.CIVILIAN]}
            onDelete={handleDeleteCharacter}
            onEdit={openEditModal}
            onOpenHousing={setHousingModalChar}
            onOpenInventory={() => setInventoryModalRole(Role.CIVILIAN)}
            onRequestUnequip={requestUnequip}
          />
        </div>
      </GameLayout>
    </div>
  );
}

export default App;
