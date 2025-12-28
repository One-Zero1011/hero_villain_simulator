
import React, { useState } from 'react';
import { Role, FactionResources, Item, Character, Status } from '../../types/index';
import { X, Coins, Shield, Skull, Users, ArrowLeft, Heart, Zap, Clover, Activity, PackageOpen } from 'lucide-react';

interface Props {
  role: Role;
  resources: FactionResources;
  characters: Character[];
  isOpen: boolean;
  onClose: () => void;
  onUseItem: (itemId: string, targetCharId: string, role: Role) => void;
}

const InventoryModal: React.FC<Props> = ({ role, resources, characters, isOpen, onClose, onUseItem }) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  if (!isOpen) return null;

  // Role specific styling configuration
  const getTheme = (r: Role) => {
    switch (r) {
      case Role.HERO:
        return {
          bg: 'bg-[#1e293b]',
          border: 'border-blue-500',
          title: 'text-blue-400',
          icon: <Shield className="w-6 h-6 text-blue-500" />,
          cardBg: 'bg-blue-900/20',
          cardBorder: 'border-blue-500/30',
          moneyColor: 'text-yellow-400',
          button: 'bg-blue-600 hover:bg-blue-500',
          hover: 'hover:bg-blue-800/30'
        };
      case Role.VILLAIN:
        return {
          bg: 'bg-[#2a1215]',
          border: 'border-red-500',
          title: 'text-red-400',
          icon: <Skull className="w-6 h-6 text-red-500" />,
          cardBg: 'bg-red-900/20',
          cardBorder: 'border-red-500/30',
          moneyColor: 'text-red-200',
          button: 'bg-red-600 hover:bg-red-500',
          hover: 'hover:bg-red-800/30'
        };
      case Role.CIVILIAN:
        return {
          bg: 'bg-[#14281d]',
          border: 'border-emerald-500',
          title: 'text-emerald-400',
          icon: <Users className="w-6 h-6 text-emerald-500" />,
          cardBg: 'bg-emerald-900/20',
          cardBorder: 'border-emerald-500/30',
          moneyColor: 'text-emerald-200',
          button: 'bg-emerald-600 hover:bg-emerald-500',
          hover: 'hover:bg-emerald-800/30'
        };
      default:
        return {
          bg: 'bg-gray-800',
          border: 'border-gray-500',
          title: 'text-gray-400',
          icon: <Users className="w-6 h-6" />,
          cardBg: 'bg-gray-700',
          cardBorder: 'border-gray-600',
          moneyColor: 'text-white',
          button: 'bg-gray-600',
          hover: 'hover:bg-gray-700'
        };
    }
  };

  const theme = getTheme(role);

  const handleCharacterSelect = (charId: string) => {
    if (selectedItem) {
      onUseItem(selectedItem.id, charId, role);
      setSelectedItem(null); // Return to item list
    }
  };

  const renderEffectPreview = (item: Item) => {
    switch (item.effectType) {
      case 'HEAL': return <span className="text-emerald-400 flex items-center gap-1"><Heart className="w-3 h-3" /> 체력 +{item.effectValue}</span>;
      case 'BUFF_STRENGTH': return <span className="text-red-400 flex items-center gap-1"><Zap className="w-3 h-3" /> 근력 +{item.effectValue}</span>;
      case 'BUFF_LUCK': return <span className="text-yellow-400 flex items-center gap-1"><Clover className="w-3 h-3" /> 행운 +{item.effectValue}</span>;
      case 'GAMBLE_MONEY': return <span className="text-purple-400 flex items-center gap-1"><Coins className="w-3 h-3" /> 당첨 시 +{item.effectValue}G</span>;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={`w-full max-w-2xl rounded-2xl border-2 shadow-2xl overflow-hidden flex flex-col text-gray-200 max-h-[80vh] ${theme.bg} ${theme.border}`}>
        
        {/* Header */}
        <div className="p-4 border-b border-black/20 flex justify-between items-center bg-black/20">
          <div className="flex items-center gap-3">
            {selectedItem ? (
              <button onClick={() => setSelectedItem(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </button>
            ) : (
              theme.icon
            )}
            <h2 className={`text-xl font-bold ${theme.title} flex items-center gap-2`}>
              {selectedItem ? `${selectedItem.name} 사용` : '인벤토리'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
             {!selectedItem && (
               <div className={`flex items-center gap-2 font-mono font-bold ${theme.moneyColor}`}>
                 <Coins className="w-4 h-4" />
                 {resources.money.toLocaleString()}
               </div>
             )}
             <button onClick={onClose} className="text-gray-400 hover:text-white">
               <X className="w-6 h-6" />
             </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          
          {!selectedItem ? (
            // --- Item Selection View ---
            <>
              {resources.inventory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500 gap-2">
                  <PackageOpen className="w-12 h-12 opacity-50" />
                  <p>보유한 아이템이 없습니다.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {resources.inventory.map((item, idx) => (
                    <button
                      key={`${item.id}-${idx}`}
                      onClick={() => setSelectedItem(item)}
                      className={`text-left p-3 rounded-xl border transition-all relative group ${theme.cardBg} ${theme.cardBorder} hover:brightness-110 active:scale-95`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <div className="font-bold text-sm text-gray-100">{item.name}</div>
                            <div className="text-[10px] opacity-70 flex gap-2">
                              {renderEffectPreview(item)}
                            </div>
                          </div>
                        </div>
                        <span className="bg-black/40 px-2 py-0.5 rounded text-xs font-mono text-gray-300">
                          x{item.count}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2">{item.description}</p>
                      <div className="absolute inset-0 border-2 border-white/0 rounded-xl group-hover:border-white/10 transition-colors pointer-events-none"></div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            // --- Character Selection View ---
            <div className="space-y-4">
               <div className="bg-black/20 p-3 rounded-lg border border-white/5 flex items-center gap-3">
                 <div className="text-3xl">{selectedItem.icon}</div>
                 <div>
                   <div className="font-bold text-white">{selectedItem.name}</div>
                   <div className="text-xs text-gray-400">{selectedItem.description}</div>
                 </div>
               </div>

               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1">사용할 대상 선택</h3>
               
               <div className="grid grid-cols-1 gap-2">
                 {characters.map(char => (
                   <button
                     key={char.id}
                     onClick={() => handleCharacterSelect(char.id)}
                     disabled={char.status === Status.DEAD}
                     className={`flex items-center justify-between p-3 rounded-xl border transition-all
                       ${char.status === Status.DEAD 
                         ? 'opacity-50 bg-gray-900 border-gray-800 cursor-not-allowed' 
                         : `${theme.cardBg} ${theme.cardBorder} hover:brightness-125 active:scale-95`
                       }
                     `}
                   >
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-white/10">
                          <img 
                            src={char.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${char.id}`} 
                            alt={char.name} 
                            className={`w-full h-full object-cover ${char.status === Status.DEAD ? 'grayscale' : ''}`} 
                          />
                       </div>
                       <div className="text-left">
                         <div className="font-bold text-sm text-gray-200">
                           {char.name}
                           {char.status === Status.DEAD && <span className="ml-2 text-red-500 text-[10px]">(사망)</span>}
                         </div>
                         <div className="flex gap-2 text-[10px] text-gray-400">
                           <span className="flex items-center gap-0.5">
                             <Heart className="w-3 h-3" /> {char.stats?.stamina ?? 50}
                           </span>
                           {char.status === Status.INJURED && (
                             <span className="text-orange-500 flex items-center gap-0.5 font-bold">
                               <Activity className="w-3 h-3" /> 부상
                             </span>
                           )}
                         </div>
                       </div>
                     </div>
                     
                     {char.status !== Status.DEAD && (
                       <div className={`px-3 py-1.5 rounded text-xs font-bold ${theme.button} text-white shadow-lg`}>
                         사용
                       </div>
                     )}
                   </button>
                 ))}
                 
                 {characters.length === 0 && (
                   <div className="text-center py-8 text-gray-500">
                     사용 가능한 캐릭터가 없습니다.
                   </div>
                 )}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryModal;
