
import React, { useState } from 'react';
import { Role, FactionResources } from '../../types/index';
import { GAME_ITEMS } from '../../data/items';
import { ShoppingCart, Coins, Shield, Skull, Users, X, Info } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  resources: Record<Role, FactionResources>;
  onBuyItem: (role: Role, itemId: string) => void;
}

const ShopModal: React.FC<Props> = ({ isOpen, onClose, resources, onBuyItem }) => {
  const [activeRole, setActiveRole] = useState<Role>(Role.HERO);

  if (!isOpen) return null;

  // Filter items available for the active role (Role specific + Common)
  const availableItems = GAME_ITEMS.filter(
    item => item.role === activeRole || item.role === 'COMMON'
  );

  const currentMoney = resources[activeRole].money;

  const getRoleTheme = (role: Role) => {
    switch (role) {
      case Role.HERO:
        return {
          bg: 'from-blue-900/50 to-slate-900',
          border: 'border-blue-500',
          text: 'text-blue-400',
          button: 'bg-blue-600 hover:bg-blue-500',
          icon: <Shield className="w-5 h-5" />
        };
      case Role.VILLAIN:
        return {
          bg: 'from-red-900/50 to-slate-900',
          border: 'border-red-500',
          text: 'text-red-400',
          button: 'bg-red-600 hover:bg-red-500',
          icon: <Skull className="w-5 h-5" />
        };
      case Role.CIVILIAN:
        return {
          bg: 'from-green-900/50 to-slate-900',
          border: 'border-green-500',
          text: 'text-emerald-400',
          button: 'bg-green-600 hover:bg-green-500',
          icon: <Users className="w-5 h-5" />
        };
    }
  };

  const theme = getRoleTheme(activeRole);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={`w-full max-w-4xl h-[85vh] bg-[#1a1a1a] rounded-2xl border-2 border-[#333] shadow-2xl flex flex-col overflow-hidden`}>
        
        {/* Header */}
        <div className="bg-[#222] border-b border-[#333] p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-full text-yellow-500">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">진영 상점</h2>
              <p className="text-xs text-gray-400">각 진영의 자금으로 아이템을 구매하세요.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#333] rounded-full text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Role Tabs */}
        <div className="flex border-b border-[#333] bg-[#1c1c1c]">
          {([Role.HERO, Role.VILLAIN, Role.CIVILIAN] as Role[]).map((role) => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-bold transition-all relative
                ${activeRole === role ? 'text-white bg-[#2a2a2a]' : 'text-gray-500 hover:text-gray-300 hover:bg-[#252525]'}
              `}
            >
              {role === Role.HERO && <Shield className="w-4 h-4" />}
              {role === Role.VILLAIN && <Skull className="w-4 h-4" />}
              {role === Role.CIVILIAN && <Users className="w-4 h-4" />}
              {role}
              
              {/* Active Indicator */}
              {activeRole === role && (
                <div className={`absolute bottom-0 left-0 right-0 h-1 ${
                  role === Role.HERO ? 'bg-blue-500' : role === Role.VILLAIN ? 'bg-red-500' : 'bg-green-500'
                }`}></div>
              )}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className={`flex-1 overflow-hidden flex flex-col md:flex-row bg-gradient-to-br ${theme.bg}`}>
          
          {/* Stats Panel */}
          <div className="md:w-64 p-6 border-b md:border-b-0 md:border-r border-[#333] bg-black/20 backdrop-blur flex flex-col gap-6">
            <div className="text-center space-y-2">
              <span className={`inline-block p-4 rounded-2xl bg-black/40 border border-white/10 ${theme.text}`}>
                {theme.icon}
              </span>
              <h3 className={`text-2xl font-bold ${theme.text}`}>{activeRole}</h3>
              <p className="text-xs text-gray-400">진영 자금 현황</p>
            </div>

            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
              <div className="text-xs text-gray-400 mb-1">보유 자금</div>
              <div className="text-2xl font-mono font-bold text-yellow-400 flex items-center gap-2">
                <Coins className="w-6 h-6" />
                {currentMoney.toLocaleString()} G
              </div>
            </div>

            <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex-1 overflow-y-auto">
              <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                <Info className="w-3 h-3" /> 보유 아이템
              </div>
              <div className="space-y-2">
                {resources[activeRole].inventory.length === 0 ? (
                  <div className="text-center py-4 text-gray-600 text-xs">인벤토리가 비어있습니다.</div>
                ) : (
                  resources[activeRole].inventory.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-2 bg-[#333]/50 rounded">
                      <span className="text-gray-300 flex items-center gap-2">
                        <span>{item.icon}</span>
                        {item.name}
                      </span>
                      <span className="font-mono text-gray-500">x{item.count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableItems.map((item) => {
                const canAfford = currentMoney >= item.price;
                return (
                  <div 
                    key={item.id} 
                    className="bg-[#252525] border border-[#333] rounded-xl overflow-hidden hover:border-[#555] transition-all flex flex-col group"
                  >
                    <div className="p-4 flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-3xl p-2 bg-[#1c1c1c] rounded-lg">{item.icon}</div>
                        <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${
                          item.role === 'COMMON' ? 'bg-gray-700 text-gray-300' : 
                          item.role === Role.HERO ? 'bg-blue-900/50 text-blue-300' :
                          item.role === Role.VILLAIN ? 'bg-red-900/50 text-red-300' :
                          'bg-green-900/50 text-green-300'
                        }`}>
                          {item.role === 'COMMON' ? '공용' : item.role}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-100 mb-1">{item.name}</h4>
                      <p className="text-xs text-gray-400 line-clamp-2 min-h-[2.5em]">{item.description}</p>
                      
                      <div className="mt-3 flex gap-2 text-[10px]">
                        <span className="bg-[#1c1c1c] px-2 py-1 rounded text-gray-400">
                          {item.effectType === 'HEAL' ? '회복' : 
                           item.effectType === 'BUFF_STRENGTH' ? '근력 강화' : 
                           item.effectType === 'BUFF_LUCK' ? '행운 강화' : '특수'}
                        </span>
                        <span className="bg-[#1c1c1c] px-2 py-1 rounded text-yellow-500 font-mono">
                          Val: {item.effectValue}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-[#1c1c1c] border-t border-[#333] flex justify-between items-center">
                      <span className="font-mono font-bold text-yellow-400">{item.price.toLocaleString()} G</span>
                      <button
                        onClick={() => onBuyItem(activeRole, item.id)}
                        disabled={!canAfford}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                          ${canAfford 
                            ? `${theme.button} text-white shadow-lg active:scale-95` 
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
                        `}
                      >
                        {canAfford ? '구매' : '자금 부족'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ShopModal;
