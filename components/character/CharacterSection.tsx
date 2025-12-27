import React from 'react';
import { Character } from '../../types/index';
import CharacterCard from './CharacterCard';

interface Props {
  title: string;
  icon: React.ReactNode;
  colorClass: string;
  badgeClass: string;
  characters: Character[];
  onDelete: (id: string) => void;
  onOpenHousing: (char: Character) => void;
}

const CharacterSection: React.FC<Props> = ({ 
  title, icon, colorClass, badgeClass, characters, onDelete, onOpenHousing 
}) => {
  return (
    <section>
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
        <h2 className={`text-lg font-bold flex items-center gap-2 ${colorClass}`}>
          {icon} {title}
        </h2>
        <span className={`${badgeClass} text-xs px-2 py-1 rounded-full font-mono`}>
          {characters.length}명
        </span>
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
          <div className="col-span-full py-8 text-center text-slate-600 bg-slate-900/30 rounded-lg border border-slate-800 border-dashed">
            등록된 {title}가 없습니다.
          </div>
        )}
      </div>
    </section>
  );
};

export default CharacterSection;