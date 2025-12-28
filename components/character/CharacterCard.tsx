
import React from 'react';
import { Character, Role, Status } from '../../types/index';
import { Shield, Skull, User, Activity, Ban, Home, Brain, Zap, Heart, Clover, AlertTriangle } from 'lucide-react';

interface Props {
  character: Character;
  onDelete: (id: string) => void;
  onOpenHousing: (char: Character) => void;
}

const CharacterCard: React.FC<Props> = ({ character, onDelete, onOpenHousing }) => {
  const isDead = character.status === Status.DEAD;
  const isInjured = character.status === Status.INJURED;

  const getRoleStyle = (role: Role) => {
    switch (role) {
      case Role.HERO: 
        return {
          wrapper: 'bg-[#2a2a2a] border-l-4 border-blue-500',
          badge: 'bg-blue-900/30 text-blue-300 border border-blue-800',
          icon: <Shield className="w-4 h-4 text-blue-400" />
        };
      case Role.VILLAIN: 
        return {
          wrapper: 'bg-[#2a2a2a] border-l-4 border-red-500',
          badge: 'bg-red-900/30 text-red-300 border border-red-800',
          icon: <Skull className="w-4 h-4 text-red-400" />
        };
      case Role.CIVILIAN: 
        return {
          wrapper: 'bg-[#2a2a2a] border-l-4 border-green-500',
          badge: 'bg-green-900/30 text-green-300 border border-green-800',
          icon: <User className="w-4 h-4 text-green-400" />
        };
      default: return { wrapper: '', badge: '', icon: null };
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.NORMAL: return 'text-emerald-400';
      case Status.INJURED: return 'text-orange-500 font-extrabold animate-pulse';
      case Status.DEAD: return 'text-gray-500 line-through';
      case Status.RETIRED: return 'text-yellow-400';
      default: return 'text-white';
    }
  };

  const styles = getRoleStyle(character.role);

  return (
    <div className={`relative p-4 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 
      ${styles.wrapper} 
      ${isDead ? 'opacity-50 grayscale' : ''} 
      ${isInjured ? 'border-orange-500/50 shadow-[inset_0_0_20px_rgba(220,38,38,0.2)]' : 'border-[#333333]'}
      group border border-t-0 border-r-0 border-b-0`}
    >
      
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {character.imageUrl ? (
             <div className={`w-10 h-10 rounded-full border overflow-hidden bg-[#1c1c1c] ${isInjured ? 'border-orange-500' : 'border-[#404040]'}`}>
               <img src={character.imageUrl} alt={character.name} className="w-full h-full object-cover" />
             </div>
          ) : (
            <div className={`p-1.5 rounded-full bg-[#333333]`}>
              {styles.icon}
            </div>
          )}
          
          <div>
            <h3 className="font-bold text-gray-100 leading-tight">{character.name}</h3>
            <div className="flex gap-1 mt-1">
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${styles.badge}`}>
                {character.role}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1c1c1c] text-gray-400 border border-[#333333]">
                {character.mbti}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 mb-1">
             {isInjured ? (
               <AlertTriangle className="w-3 h-3 text-orange-500 animate-bounce" />
             ) : (
               <Activity className="w-3 h-3 text-gray-500" />
             )}
             <span className={`text-xs ${getStatusColor(character.status)}`}>{character.status}</span>
          </div>
          <span className="text-[10px] text-gray-500">{character.age}세 / {character.gender}</span>
        </div>
      </div>

      {/* Hero/Villain Stats & Superpower */}
      {character.role !== Role.CIVILIAN && character.stats && (
        <div className="mb-3">
          <div className="text-[10px] text-gray-400 mb-1 truncate">
            능력: <span className="text-white font-medium">{character.superpower || '없음'}</span>
          </div>
          
          {/* New Stats Layout with Bars */}
          <div className={`bg-[#1c1c1c] p-2 rounded border space-y-2 ${isInjured ? 'border-orange-900/30' : 'border-[#333333]'}`}>
            
            {/* Bars Section */}
            <div className="space-y-1.5">
              {/* HP / Stamina Bar */}
              <div className="flex items-center gap-2">
                <Heart className={`w-3 h-3 shrink-0 ${isInjured ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`} />
                <div className="flex-1 h-1.5 bg-[#333] rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isInjured ? 'bg-red-600 w-[20%]' : 'bg-emerald-500'}`} // Visual trick: low bar if injured
                    style={{ width: isInjured ? '20%' : `${character.stats.stamina}%` }} 
                  />
                </div>
                <span className={`text-[10px] font-mono w-6 text-right ${isInjured ? 'text-red-500 font-bold' : 'text-emerald-400'}`}>
                  {character.stats.stamina}
                </span>
              </div>

              {/* MP / Intelligence Bar */}
              <div className="flex items-center gap-2">
                <Brain className="w-3 h-3 text-blue-400 shrink-0" />
                <div className="flex-1 h-1.5 bg-[#333] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                    style={{ width: `${character.stats.intelligence}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-blue-400 w-6 text-right">{character.stats.intelligence}</span>
              </div>
            </div>

            {/* Secondary Stats Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#333333]">
               <div className="flex items-center gap-1.5 justify-center">
                 <Zap className="w-3 h-3 text-red-400" />
                 <span className="text-[10px] text-gray-400">근력</span>
                 <span className="text-[10px] font-mono text-gray-200">{character.stats.strength}</span>
               </div>
               <div className="flex items-center gap-1.5 justify-center border-l border-[#333333]">
                 <Clover className="w-3 h-3 text-yellow-400" />
                 <span className="text-[10px] text-gray-400">행운</span>
                 <span className="text-[10px] font-mono text-gray-200">{character.stats.luck}</span>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Relationships */}
      {character.relationships.length > 0 && (
         <div className="mb-3">
           <div className="text-[10px] text-gray-500 mb-0.5">관계</div>
           <div className="flex flex-wrap gap-1">
             {character.relationships.slice(0, 3).map((rel, idx) => (
               <span key={idx} className="text-[10px] bg-[#333333] px-1.5 py-0.5 rounded text-gray-300 border border-[#404040]">
                 {rel.targetName}:{rel.type}
               </span>
             ))}
             {character.relationships.length > 3 && (
               <span className="text-[10px] text-gray-500">+{character.relationships.length - 3}</span>
             )}
           </div>
         </div>
      )}

      {/* Actions */}
      <div className="flex justify-between border-t border-[#333333] pt-3 mt-2">
        {!isDead && (
          <button 
            onClick={() => onOpenHousing(character)}
            className="px-2 py-1 text-xs font-medium text-gray-300 hover:text-white hover:bg-[#333333] rounded transition-colors flex items-center gap-1 border border-[#404040]"
            title="본거지 꾸미기"
          >
            <Home className="w-3 h-3" /> 본거지
          </button>
        )}
        
        <button 
          onClick={() => onDelete(character.id)}
          className={`px-2 py-1 text-xs font-medium text-gray-500 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors flex items-center gap-1 ${isDead ? 'ml-auto' : ''}`}
          title="세계관에서 제거"
        >
          <Ban className="w-3 h-3" /> {isDead ? '말소' : '은퇴'}
        </button>
      </div>
      
      {/* Injured Overlay */}
      {isInjured && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden rounded-lg">
           <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>
           <div className="bg-black/40 backdrop-blur-[2px] absolute inset-0"></div>
           <span className="text-2xl font-black text-orange-500 -rotate-12 border-4 border-orange-500 px-4 py-1 opacity-90 animate-bounce shadow-[0_0_15px_orange]">
             CRITICAL
           </span>
        </div>
      )}

      {/* Dead Overlay */}
      {isDead && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 pointer-events-none rounded-lg z-10 backdrop-grayscale">
          <span className="text-2xl font-bold text-red-500 -rotate-12 border-4 border-red-500 px-4 py-1 opacity-80">DEAD</span>
        </div>
      )}
    </div>
  );
};

export default CharacterCard;
