
import React, { useState } from 'react';
import { Character, Role, Status, Item, Quest } from '../../types/index';
import { Shield, Skull, User, Activity, Ban, Home, Brain, Zap, Heart, Clover, AlertTriangle, Eye, EyeOff, Edit2, Sword, Shirt, Footprints, HardHat, Disc, CircleDot, X, Box, ScrollText } from 'lucide-react';

interface Props {
  character: Character;
  onDelete: (id: string) => void;
  onEdit?: (char: Character) => void;
  onOpenHousing: (char: Character) => void;
  onRequestUnequip?: (charId: string, slot: string, item: Item) => void;
  activeQuest?: Quest; // New Prop
}

const CharacterCard: React.FC<Props> = ({ character, onDelete, onEdit, onOpenHousing, onRequestUnequip, activeQuest }) => {
  const [showEquipment, setShowEquipment] = useState(false);

  const isDead = character.status === Status.DEAD;
  const isInjured = character.status === Status.INJURED;
  const isInsane = character.isInsane;

  const getRoleStyle = (role: Role) => {
    switch (role) {
      case Role.HERO: 
        return {
          wrapper: 'bg-[#2a2a2a] border-l-4 border-blue-500',
          badge: 'bg-blue-900/30 text-blue-300 border border-blue-800',
          icon: <Shield className="w-10 h-10 text-blue-400" />
        };
      case Role.VILLAIN: 
        return {
          wrapper: 'bg-[#2a2a2a] border-l-4 border-red-500',
          badge: 'bg-red-900/30 text-red-300 border border-red-800',
          icon: <Skull className="w-10 h-10 text-red-400" />
        };
      case Role.CIVILIAN: 
        return {
          wrapper: 'bg-[#2a2a2a] border-l-4 border-green-500',
          badge: 'bg-green-900/30 text-green-300 border border-green-800',
          icon: <User className="w-10 h-10 text-green-400" />
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

  // Stats Logic
  const maxHp = (character.stats?.stamina || 50) * 2;
  const currentHp = character.currentHp ?? (isInjured ? Math.round(maxHp * 0.3) : maxHp);
  const hpPercent = (currentHp / maxHp) * 100;
  
  // Sanity logic
  const maxSanity = (character.stats?.intelligence || 50) * 2;
  const currentSanity = character.currentSanity ?? maxSanity;
  const sanityPercent = (currentSanity / maxSanity) * 100;

  const getAffinityColor = (val: number | undefined) => {
    if (val === undefined) return 'text-gray-400';
    if (val >= 50) return 'text-pink-400'; // High affection
    if (val >= 10) return 'text-green-400'; // Positive
    if (val <= -50) return 'text-red-500 font-bold'; // Hatred
    if (val <= -10) return 'text-orange-400'; // Negative
    return 'text-gray-400'; // Neutral
  };

  const handleUnequipClick = (item: Item | null | undefined, slot: string) => {
    if (!item || !onRequestUnequip) return;
    onRequestUnequip(character.id, slot, item);
  };

  const renderEquipSlot = (slotName: string, icon: React.ReactNode, item?: Item | null, minimal: boolean = false) => {
    const title = item 
      ? `${item.name}\n${item.description}\n[효과]\n${item.statBonus ? Object.entries(item.statBonus).map(([k,v]) => `${k.toUpperCase()} +${v}`).join('\n') : '없음'}`
      : slotName;

    return (
      <div 
        className={`relative group transition-all flex items-center justify-center
          ${minimal ? 'w-8 h-8 rounded' : 'w-10 h-10 md:w-12 md:h-12 rounded-lg'}
          ${item 
            ? 'bg-[#252525] border border-blue-500/50 cursor-pointer hover:bg-[#333] hover:border-red-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
            : 'bg-black/40 border border-[#333] opacity-60'
          }`}
        title={title}
        onClick={() => handleUnequipClick(item, slotName)}
      >
        {item ? (
          <span className="text-xl select-none drop-shadow-md">{item.icon}</span>
        ) : (
          <div className="text-[#555]">{icon}</div>
        )}
        
        {/* Equipped Indicator */}
        {item && <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-green-500 rounded-full border border-[#1c1c1c]"></div>}
        
        {/* Slot Label (Only when empty) */}
        {!item && !minimal && (
          <span className="absolute bottom-0.5 text-[8px] text-gray-600 font-mono uppercase">{slotName}</span>
        )}

        {/* Unequip Overlay Hint */}
        {item && (
          <div className="absolute inset-0 bg-red-900/80 text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold rounded z-10 backdrop-blur-sm">
            <X className="w-4 h-4" />
          </div>
        )}
      </div>
    );
  };

  const getQuestLabel = (type: string) => {
    switch(type) {
      case 'SUBJUGATION': return '토벌';
      case 'ASSASSINATION': return '암살';
      case 'ESCORT': return '호위';
      default: return '임무';
    }
  };

  return (
    <div className={`relative p-4 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 
      ${styles.wrapper} 
      ${isDead ? 'opacity-50 grayscale' : ''} 
      ${isInsane ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : ''}
      ${isInjured && !isInsane ? 'border-orange-500/50 shadow-[inset_0_0_20px_rgba(220,38,38,0.2)]' : 'border-[#333333]'}
      group border border-t-0 border-r-0 border-b-0 overflow-hidden flex flex-col ${showEquipment ? 'min-h-[24rem]' : 'h-full'}`}
    >
      
      {/* Active Quest Badge - Absolute Positioned */}
      {activeQuest && !isDead && (
        <div className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 z-20">
          <div className="bg-yellow-600/90 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold shadow-md flex items-center gap-1 border-l border-b border-yellow-400/50 animate-pulse">
            <ScrollText className="w-3 h-3" />
            {getQuestLabel(activeQuest.type)} 수행 중
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3 w-full">
        {character.imageUrl ? (
            <div className={`w-20 h-20 rounded-full border-2 overflow-hidden bg-[#1c1c1c] shrink-0 ${isInsane ? 'border-purple-500 animate-pulse' : isInjured ? 'border-orange-500' : 'border-[#404040]'}`}>
              <img src={character.imageUrl} alt={character.name} className={`w-full h-full object-cover ${isInsane ? 'hue-rotate-90 contrast-125' : ''}`} />
            </div>
        ) : (
          <div className={`w-20 h-20 rounded-full border-2 border-[#404040] bg-[#333333] flex items-center justify-center shrink-0`}>
            {styles.icon}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
              <h3 className={`font-bold leading-tight text-lg truncate pr-2 ${isInsane ? 'text-purple-400 italic tracking-widest' : 'text-gray-100'}`}>
                {character.name}
              </h3>
              
              {/* Status Display */}
              <div className="flex flex-col items-end shrink-0">
                <div className="flex items-center gap-1 mb-0.5">
                    {isInsane ? (
                      <span className="text-xs text-purple-500 font-black animate-pulse flex items-center gap-1">
                        <Brain className="w-3 h-3" /> INSANE
                      </span>
                    ) : isInjured ? (
                      <>
                      <AlertTriangle className="w-3 h-3 text-orange-500 animate-bounce" />
                      <span className={`text-xs ${getStatusColor(character.status)}`}>{character.status}</span>
                      </>
                    ) : (
                      <>
                      <Activity className="w-3 h-3 text-gray-500" />
                      <span className={`text-xs ${getStatusColor(character.status)}`}>{character.status}</span>
                      </>
                    )}
                </div>
                <span className="text-[10px] text-gray-500 text-right whitespace-nowrap">{character.age}세 / {character.gender}</span>
              </div>
          </div>

          <div className="flex flex-wrap gap-1 mt-1">
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${styles.badge}`}>
              {character.role}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1c1c1c] text-gray-400 border border-[#333333]">
              {character.mbti}
            </span>
            
            {/* Identity Status for Heroes */}
            {character.role === Role.HERO && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded border flex items-center gap-1
                ${character.isIdentityRevealed 
                  ? 'bg-amber-900/40 text-amber-300 border-amber-700' 
                  : 'bg-slate-700 text-gray-300 border-slate-600'}`
              }>
                {character.isIdentityRevealed 
                  ? <><Eye className="w-2.5 h-2.5" /> 정체 드러남</> 
                  : <><EyeOff className="w-2.5 h-2.5" /> 정체 숨김</>
                }
              </span>
            )}

            {character.personality && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#252525] text-gray-300 border border-[#404040]">
                #{character.personality}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hero/Villain Stats & Superpower */}
      {character.role !== Role.CIVILIAN && character.stats && (
        <div className="mb-3">
          <div className="text-[10px] text-gray-400 mb-1 truncate">
            능력: <span className="text-white font-medium">{character.superpower || '없음'}</span>
          </div>
          
          {/* New Stats Layout with Bars */}
          <div className={`bg-[#1c1c1c] p-2 rounded border space-y-2 ${isInsane ? 'border-purple-900/50 bg-purple-900/10' : isInjured ? 'border-orange-900/30' : 'border-[#333333]'}`}>
            
            {/* Bars Section */}
            <div className="space-y-1.5">
              {/* HP / Stamina Bar */}
              <div className="flex items-center gap-2" title={`체력 (최대 ${maxHp})`}>
                <Heart className={`w-3 h-3 shrink-0 ${currentHp < maxHp * 0.3 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`} />
                <div className="flex-1 h-1.5 bg-[#333] rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${currentHp < maxHp * 0.3 ? 'bg-red-600' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.max(0, Math.min(100, hpPercent))}%` }}
                  />
                </div>
                <span className={`text-[10px] font-mono w-10 text-right ${currentHp < maxHp * 0.3 ? 'text-red-500 font-bold' : 'text-emerald-400'}`}>
                  {Math.ceil(currentHp)} / {maxHp}
                </span>
              </div>

              {/* Sanity / Mental Bar */}
              <div className="flex items-center gap-2" title={`정신력 (최대 ${maxSanity}) - 10% 미만 위험`}>
                <Brain className={`w-3 h-3 shrink-0 ${isInsane ? 'text-purple-500 animate-spin-slow' : 'text-blue-400'}`} />
                <div className="flex-1 h-1.5 bg-[#333] rounded-full overflow-hidden relative">
                  {/* Danger Zone Marker */}
                  <div className="absolute left-0 top-0 bottom-0 w-[10%] bg-red-900/50 z-0"></div>
                  <div 
                    className={`h-full rounded-full transition-all duration-500 z-10 relative ${isInsane ? 'bg-purple-600' : sanityPercent < 20 ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.max(0, Math.min(100, sanityPercent))}%` }}
                  />
                </div>
                <span className={`text-[10px] font-mono w-10 text-right ${isInsane ? 'text-purple-400 font-bold' : 'text-blue-400'}`}>
                  {Math.round(currentSanity)}
                </span>
              </div>
            </div>

            {/* Secondary Stats Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#333333]">
               <div className="flex items-center gap-1.5 justify-center" title="공격력에 비례">
                 <Zap className="w-3 h-3 text-red-400" />
                 <span className="text-[10px] text-gray-400">근력(공격)</span>
                 <span className="text-[10px] font-mono text-gray-200">{character.stats.strength}</span>
               </div>
               <div className="flex items-center gap-1.5 justify-center border-l border-[#333333]" title="치명타 확률에 비례">
                 <Clover className="w-3 h-3 text-yellow-400" />
                 <span className="text-[10px] text-gray-400">행운(크리)</span>
                 <span className="text-[10px] font-mono text-gray-200">{character.stats.luck}</span>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Relationships */}
      {character.relationships.length > 0 && (
         <div className="mb-3 flex-1">
           <div className="text-[10px] text-gray-500 mb-0.5 flex justify-between">
             <span>♥ 호감도 관계</span>
           </div>
           <div className="flex flex-wrap gap-1">
             {character.relationships.slice(0, 3).map((rel, idx) => {
               // Determine heart icon based on affinity
               let heartIcon = '♥';
               if ((rel.affinity || 0) < 0) heartIcon = '💔';
               else if ((rel.affinity || 0) >= 80) heartIcon = '💖';

               return (
                 <span key={idx} className="text-[10px] bg-[#333333] px-1.5 py-0.5 rounded text-gray-300 border border-[#404040] flex items-center gap-1 truncate max-w-full">
                   <span className="truncate">{rel.targetName}</span>
                   <span className="text-gray-500 mx-0.5">|</span>
                   <span className={getAffinityColor(rel.affinity)}>{rel.type}</span>
                   {rel.affinity !== undefined && (
                     <span className={`ml-1 px-1 rounded-sm bg-black/30 font-mono flex items-center gap-0.5 ${getAffinityColor(rel.affinity)}`}>
                       <span className="text-[8px]">{heartIcon}</span>
                       {rel.affinity > 0 ? '+' : ''}{rel.affinity}
                     </span>
                   )}
                 </span>
               );
             })}
             {character.relationships.length > 3 && (
               <span className="text-[10px] text-gray-500 flex items-center bg-[#333] px-1 rounded">+{character.relationships.length - 3}</span>
             )}
           </div>
         </div>
      )}

      {/* Actions Footer */}
      <div className="flex justify-between border-t border-[#333333] pt-3 mt-auto items-center">
        <div className="flex gap-2">
          {!isDead && (
            <button 
              onClick={() => setShowEquipment(true)}
              className="px-2 py-1 text-xs font-medium text-blue-300 hover:text-white hover:bg-blue-900/30 rounded transition-colors flex items-center gap-1 border border-blue-900/50"
              title="장비 확인"
            >
              <Shirt className="w-3 h-3" /> 장비
            </button>
          )}
          {!isDead && (
            <button 
              onClick={() => onOpenHousing(character)}
              className="px-2 py-1 text-xs font-medium text-gray-300 hover:text-white hover:bg-[#333333] rounded transition-colors flex items-center gap-1 border border-[#404040]"
              title="본거지 꾸미기"
            >
              <Home className="w-3 h-3" /> 본거지
            </button>
          )}
          {onEdit && (
            <button 
              onClick={() => onEdit(character)}
              className="px-2 py-1 text-xs font-medium text-gray-300 hover:text-white hover:bg-[#333333] rounded transition-colors flex items-center gap-1 border border-[#404040]"
              title="정보 수정"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          )}
        </div>
        
        <button 
          onClick={() => onDelete(character.id)}
          className={`px-2 py-1 text-xs font-medium text-gray-500 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors flex items-center gap-1 ${isDead ? 'ml-auto' : ''}`}
          title="세계관에서 제거"
        >
          <Ban className="w-3 h-3" /> {isDead ? '말소' : '은퇴'}
        </button>
      </div>
      
      {/* Insanity Overlay Effect */}
      {isInsane && !isDead && (
        <div className="absolute inset-0 pointer-events-none z-0 rounded-lg overflow-hidden mix-blend-overlay opacity-30">
           <div className="absolute inset-0 bg-purple-600 mix-blend-color-burn animate-pulse"></div>
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/noise-lines.png')] opacity-20"></div>
        </div>
      )}

      {/* Injured Overlay (Now triggered by HP) */}
      {currentHp < maxHp * 0.3 && !isInsane && !isDead && (
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

      {/* --- Equipment Overlay (Slide-up or Fade-in) --- */}
      {showEquipment && (
        <div className="absolute inset-0 bg-[#1c1c1c]/95 z-50 flex flex-col p-4 animate-fade-in backdrop-blur-sm rounded-lg overflow-hidden">
          <div className="flex justify-between items-center mb-4 border-b border-[#333] pb-2">
            <h4 className="text-gray-200 font-bold flex items-center gap-2">
              <Shirt className="w-4 h-4 text-blue-400" />
              장비 슬롯
            </h4>
            <button 
              onClick={() => setShowEquipment(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 flex items-center justify-between gap-2 relative">
            {/* Left Column: Armor */}
            <div className="flex flex-col gap-3 z-10">
              {renderEquipSlot('HEAD', <HardHat className="w-4 h-4" />, character.equipment?.head)}
              {renderEquipSlot('BODY', <Shirt className="w-4 h-4" />, character.equipment?.body)}
              {renderEquipSlot('LEGS', <div className="text-[10px] font-bold">P</div>, character.equipment?.legs)}
              {renderEquipSlot('FEET', <Footprints className="w-4 h-4" />, character.equipment?.feet)}
            </div>

            {/* Center: Character Image (Visual Representation) */}
            <div className="flex-1 h-full flex items-center justify-center relative">
               {character.imageUrl ? (
                 <img 
                   src={character.imageUrl} 
                   alt="Character" 
                   className="h-full max-h-40 md:max-h-48 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                 />
               ) : (
                 <div className="w-20 h-20 rounded-full bg-[#333] flex items-center justify-center border-2 border-[#444]">
                   {styles.icon}
                 </div>
               )}
               {/* Background Lines for connection effect */}
               <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none">
                  <div className="absolute top-[10%] left-0 w-1/2 h-px bg-gradient-to-r from-blue-500 to-transparent"></div>
                  <div className="absolute top-[10%] right-0 w-1/2 h-px bg-gradient-to-l from-blue-500 to-transparent"></div>
                  <div className="absolute bottom-[10%] left-0 w-1/2 h-px bg-gradient-to-r from-blue-500 to-transparent"></div>
                  <div className="absolute bottom-[10%] right-0 w-1/2 h-px bg-gradient-to-l from-blue-500 to-transparent"></div>
               </div>
            </div>

            {/* Right Column: Weapon & Accessories */}
            <div className="flex flex-col gap-3 z-10">
              {renderEquipSlot('WEAPON', <Sword className="w-4 h-4" />, character.equipment?.weapon)}
              {renderEquipSlot('EARRING', <div className="text-[10px] font-bold">E</div>, character.equipment?.earring)}
              {renderEquipSlot('NECKLACE', <Disc className="w-4 h-4" />, character.equipment?.necklace)}
              {renderEquipSlot('RING', <CircleDot className="w-4 h-4" />, character.equipment?.ring)}
            </div>
          </div>
          
          <div className="mt-4 text-[10px] text-center text-gray-500">
            아이템을 클릭하여 장비 해제
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterCard;
