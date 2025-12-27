import React from 'react';
import { Character, Role, Status } from '../../types/index';
import { Shield, Skull, User, Activity, Ban, Home, Brain, Zap, Heart, Clover } from 'lucide-react';

interface Props {
  character: Character;
  onDelete: (id: string) => void;
  onOpenHousing: (char: Character) => void;
}

const CharacterCard: React.FC<Props> = ({ character, onDelete, onOpenHousing }) => {
  const isDead = character.status === Status.DEAD;

  const getRoleStyle = (role: Role) => {
    switch (role) {
      case Role.HERO: 
        return {
          wrapper: 'bg-slate-800 border-l-4 border-blue-500',
          badge: 'bg-blue-900/50 text-blue-200 border border-blue-700',
          icon: <Shield className="w-4 h-4 text-blue-400" />
        };
      case Role.VILLAIN: 
        return {
          wrapper: 'bg-slate-800 border-l-4 border-red-500',
          badge: 'bg-red-900/50 text-red-200 border border-red-700',
          icon: <Skull className="w-4 h-4 text-red-400" />
        };
      case Role.CIVILIAN: 
        return {
          wrapper: 'bg-slate-800 border-l-4 border-green-500',
          badge: 'bg-green-900/50 text-green-200 border border-green-700',
          icon: <User className="w-4 h-4 text-green-400" />
        };
      default: return { wrapper: '', badge: '', icon: null };
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.NORMAL: return 'text-emerald-400';
      case Status.INJURED: return 'text-orange-400 font-bold';
      case Status.DEAD: return 'text-slate-500 line-through';
      case Status.RETIRED: return 'text-yellow-400';
      default: return 'text-white';
    }
  };

  const styles = getRoleStyle(character.role);

  return (
    <div className={`relative p-4 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${styles.wrapper} ${isDead ? 'opacity-60 grayscale' : ''} group`}>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {character.imageUrl ? (
             <div className="w-10 h-10 rounded-full border border-slate-600 overflow-hidden bg-slate-900">
               <img src={character.imageUrl} alt={character.name} className="w-full h-full object-cover" />
             </div>
          ) : (
            <div className={`p-1.5 rounded-full bg-slate-700/50`}>
              {styles.icon}
            </div>
          )}
          
          <div>
            <h3 className="font-bold text-slate-100 leading-tight">{character.name}</h3>
            <div className="flex gap-1 mt-1">
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${styles.badge}`}>
                {character.role}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 border border-slate-600">
                {character.mbti}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 mb-1">
             <Activity className="w-3 h-3 text-slate-500" />
             <span className={`text-xs ${getStatusColor(character.status)}`}>{character.status}</span>
          </div>
          <span className="text-[10px] text-slate-500">{character.age}세 / {character.gender}</span>
        </div>
      </div>

      {/* Hero/Villain Stats & Superpower */}
      {character.role !== Role.CIVILIAN && character.stats && (
        <div className="mb-3">
          <div className="text-[10px] text-slate-400 mb-1 truncate">
            능력: <span className="text-white">{character.superpower || '없음'}</span>
          </div>
          <div className="grid grid-cols-4 gap-1 bg-slate-900/50 p-1.5 rounded border border-slate-700/50">
            <div className="flex flex-col items-center" title="근력">
              <Zap className="w-3 h-3 text-red-400 mb-0.5" />
              <span className="text-[10px] font-mono text-slate-300">{character.stats.strength}</span>
            </div>
            <div className="flex flex-col items-center" title="지능">
              <Brain className="w-3 h-3 text-blue-400 mb-0.5" />
              <span className="text-[10px] font-mono text-slate-300">{character.stats.intelligence}</span>
            </div>
            <div className="flex flex-col items-center" title="체력">
              <Heart className="w-3 h-3 text-green-400 mb-0.5" />
              <span className="text-[10px] font-mono text-slate-300">{character.stats.stamina}</span>
            </div>
            <div className="flex flex-col items-center" title="행운">
              <Clover className="w-3 h-3 text-yellow-400 mb-0.5" />
              <span className="text-[10px] font-mono text-slate-300">{character.stats.luck}</span>
            </div>
          </div>
        </div>
      )}

      {/* Relationships */}
      {character.relationships.length > 0 && (
         <div className="mb-3">
           <div className="text-[10px] text-slate-500 mb-0.5">관계</div>
           <div className="flex flex-wrap gap-1">
             {character.relationships.slice(0, 3).map((rel, idx) => (
               <span key={idx} className="text-[10px] bg-slate-700/50 px-1.5 py-0.5 rounded text-slate-300 border border-slate-600/50">
                 {rel.targetName}:{rel.type}
               </span>
             ))}
             {character.relationships.length > 3 && (
               <span className="text-[10px] text-slate-500">+{character.relationships.length - 3}</span>
             )}
           </div>
         </div>
      )}

      {/* Actions */}
      <div className="flex justify-between border-t border-slate-700 pt-3 mt-2">
        {!isDead && (
          <button 
            onClick={() => onOpenHousing(character)}
            className="px-2 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors flex items-center gap-1 border border-slate-600"
            title="본거지 꾸미기"
          >
            <Home className="w-3 h-3" /> 본거지
          </button>
        )}
        
        <button 
          onClick={() => onDelete(character.id)}
          className={`px-2 py-1 text-xs font-medium text-slate-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors flex items-center gap-1 ${isDead ? 'ml-auto' : ''}`}
          title="세계관에서 제거"
        >
          <Ban className="w-3 h-3" /> {isDead ? '말소' : '은퇴'}
        </button>
      </div>
      
      {isDead && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none rounded-lg z-10">
          <span className="text-2xl font-bold text-red-500 -rotate-12 border-4 border-red-500 px-4 py-1 opacity-80">DEAD</span>
        </div>
      )}
    </div>
  );
};

export default CharacterCard;