
import React from 'react';
import { Character, FactionResources } from '../../types/index';
import CharacterCard from './CharacterCard';
import { Coins, Package, Search } from 'lucide-react';

interface Props {
  title: string;
  icon: React.ReactNode;
  colorClass: string;
  badgeClass: string;
  characters: Character[];
  resources: FactionResources;
  onDelete: (id: string) => void;
  onOpenHousing: (char: Character) => void;
  onOpenInventory: () => void; // New prop
}

const CharacterSection: React.FC<Props> = ({ 
  title, icon, colorClass, badgeClass, characters, resources, onDelete, onOpenHousing, onOpenInventory 
}) => {
  return (
    <section>
      {/* Header with Title and Faction Inventory */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 border-b border-[#333333] pb-2 gap-4">
        
        {/* Title Area */}
        <div className="flex items-center gap-2">
          <h2 className={`text-lg font-bold flex items-center gap-2 ${colorClass}`}>
            {icon} {title}
          </h2>
          <span className={`${badgeClass} text-xs px-2 py-1 rounded-full font-mono font-bold`}>
            {characters.length}명
          </span>
        </div>

        {/* Faction Resources (Money & Inventory) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-4 bg-[#1c1c1c] px-3 py-1.5 rounded-lg border border-[#333333] shadow-inner">
            {/* Money */}
            <div className="flex items-center gap-2 text-yellow-400 font-mono pr-4 border-r border-[#333]">
              <Coins className="w-4 h-4" />
              <span className="font-bold">{resources.money.toLocaleString()}</span>
            </div>

            {/* Inventory Preview */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-[150px] no-scrollbar opacity-70">
              <Package className="w-4 h-4 text-gray-500 shrink-0" />
              {resources.inventory.length === 0 ? (
                <span className="text-[10px] text-gray-600">비어있음</span>
              ) : (
                <span className="text-[10px] text-gray-400">{resources.inventory.length}개 아이템</span>
              )}
            </div>
          </div>

          {/* Open Inventory Button */}
          <button 
            onClick={onOpenInventory}
            className="bg-[#2a2a2a] hover:bg-[#333333] text-gray-300 hover:text-white p-2 rounded-lg border border-[#404040] transition-colors"
            title="인벤토리 열기"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map(char => (
          <CharacterCard 
            key={char.id} 
            character={char} 
            onDelete={onDelete} 
            onOpenHousing={onOpenHousing}
          />
        ))}
        {characters.length === 0 && (
          <div className="col-span-full py-8 text-center text-gray-600 bg-[#2a2a2a] rounded-lg border border-[#333333] border-dashed">
            등록된 {title}가 없습니다.
          </div>
        )}
      </div>
    </section>
  );
};

export default CharacterSection;
