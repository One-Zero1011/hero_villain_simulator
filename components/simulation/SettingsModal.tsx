
import React, { useState } from 'react';
import { GameSettings, Role, FactionResources } from '../../types/index';
import { GAME_ITEMS } from '../../data/items';
import { X, Settings as SettingsIcon, Heart, ShieldAlert, Users, HeartOff, UserCheck, Bug, Terminal, Coins, Plus } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  resources: Record<Role, FactionResources>;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onDebugSetMoney: (role: Role, amount: number) => void;
  onDebugAddItem: (role: Role, itemId: string, count: number) => void;
}

const SettingsModal: React.FC<Props> = ({ 
  isOpen, onClose, settings, resources, onUpdateSettings, onDebugSetMoney, onDebugAddItem 
}) => {
  const [activeDebugRole, setActiveDebugRole] = useState<Role>(Role.HERO);
  const [selectedItemId, setSelectedItemId] = useState(GAME_ITEMS[0].id);
  const [moneyInput, setMoneyInput] = useState<string>('');

  if (!isOpen) return null;

  const toggleSetting = (key: keyof GameSettings) => {
    onUpdateSettings({
      ...settings,
      [key]: !settings[key]
    });
  };

  const handleSetMoney = () => {
    const amount = parseInt(moneyInput);
    if (!isNaN(amount)) {
      onDebugSetMoney(activeDebugRole, amount);
      setMoneyInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#232323] w-full max-w-lg rounded-2xl border border-[#404040] shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-[#333333] flex justify-between items-center bg-[#1c1c1c]">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-gray-400" /> 시뮬레이션 설정
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 bg-[#2a2a2a] overflow-y-auto custom-scrollbar">
          
          {/* General Constraints */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">기본 제약</h3>
            
            {/* Setting 1: Minor-Adult Dating */}
            <div className="flex items-center justify-between p-3 bg-[#1c1c1c] rounded-xl border border-[#333]">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${settings.preventMinorAdultDating ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-200">미성년자 보호 모드</div>
                  <div className="text-[10px] text-gray-500">성인과 미성년자(20세 미만)의 연애를 차단합니다.</div>
                </div>
              </div>
              <button 
                onClick={() => toggleSetting('preventMinorAdultDating')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.preventMinorAdultDating ? 'bg-green-600' : 'bg-gray-600'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.preventMinorAdultDating ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>

            {/* Setting 2: Family Dating */}
            <div className="flex items-center justify-between p-3 bg-[#1c1c1c] rounded-xl border border-[#333]">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${settings.allowFamilyDating ? 'bg-pink-900/50 text-pink-400' : 'bg-gray-800 text-gray-400'}`}>
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-200">가족 간 연애 허용</div>
                  <div className="text-[10px] text-gray-500">가족, 보호자 등 혈연/법적 관계의 연애를 허용합니다.</div>
                </div>
              </div>
              <button 
                onClick={() => toggleSetting('allowFamilyDating')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.allowFamilyDating ? 'bg-pink-600' : 'bg-gray-600'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.allowFamilyDating ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
          </div>

          {/* Relationship Rules */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">연애 규칙 설정</h3>

            {/* Pure Love Mode */}
            <div className="flex items-center justify-between p-3 bg-[#1c1c1c] rounded-xl border border-[#333]">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${settings.pureLoveMode ? 'bg-indigo-900/50 text-indigo-400' : 'bg-gray-800 text-gray-400'}`}>
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-200">순애 모드 (1:1 연애)</div>
                  <div className="text-[10px] text-gray-500">이미 연인이 있으면 다른 캐릭터와 연애하지 않습니다.</div>
                </div>
              </div>
              <button 
                onClick={() => toggleSetting('pureLoveMode')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.pureLoveMode ? 'bg-indigo-600' : 'bg-gray-600'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.pureLoveMode ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>

            {/* Hetero Mode */}
            <div className="flex items-center justify-between p-3 bg-[#1c1c1c] rounded-xl border border-[#333]">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${settings.allowHetero ? 'bg-blue-900/50 text-blue-400' : 'bg-gray-800 text-gray-400'}`}>
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-200">이성 연애 허용</div>
                  <div className="text-[10px] text-gray-500">남녀 간의 연애 이벤트를 허용합니다.</div>
                </div>
              </div>
              <button 
                onClick={() => toggleSetting('allowHetero')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.allowHetero ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.allowHetero ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>

            {/* Same-Sex Mode */}
            <div className="flex items-center justify-between p-3 bg-[#1c1c1c] rounded-xl border border-[#333]">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${settings.allowSameSex ? 'bg-purple-900/50 text-purple-400' : 'bg-gray-800 text-gray-400'}`}>
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-200">동성 연애 허용</div>
                  <div className="text-[10px] text-gray-500">동성 간의 연애 이벤트를 허용합니다.</div>
                </div>
              </div>
              <button 
                onClick={() => toggleSetting('allowSameSex')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.allowSameSex ? 'bg-purple-600' : 'bg-gray-600'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.allowSameSex ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>

            {/* Global No Romance (Friendship Mode) */}
            <div className="flex items-center justify-between p-3 bg-[#1c1c1c] rounded-xl border border-[#333]">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${settings.globalNoRomance ? 'bg-orange-900/50 text-orange-400' : 'bg-gray-800 text-gray-400'}`}>
                  <HeartOff className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-200">우정 모드 (연애 금지)</div>
                  <div className="text-[10px] text-gray-500">모든 연애 이벤트를 차단합니다.</div>
                </div>
              </div>
              <button 
                onClick={() => toggleSetting('globalNoRomance')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.globalNoRomance ? 'bg-orange-600' : 'bg-gray-600'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.globalNoRomance ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500 text-center bg-[#1c1c1c] p-2 rounded">
            <Heart className="w-3 h-3 inline mr-1 text-red-500" />
            호감도가 100에 도달하면 10% 확률로 연인이 됩니다.
          </div>

          <hr className="border-[#404040] my-4" />

          {/* Debug Mode Toggle */}
          <div className="flex items-center justify-between p-3 bg-[#1c1c1c] rounded-xl border border-[#333]">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${settings.debugMode ? 'bg-lime-900/50 text-lime-400' : 'bg-gray-800 text-gray-400'}`}>
                <Bug className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-200">디버그 모드 (치트)</div>
                <div className="text-[10px] text-gray-500">자금 조작 및 아이템 강제 추가 기능을 활성화합니다.</div>
              </div>
            </div>
            <button 
              onClick={() => toggleSetting('debugMode')}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.debugMode ? 'bg-lime-600' : 'bg-gray-600'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.debugMode ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>

          {/* Debug Interface */}
          {settings.debugMode && (
            <div className="bg-black/30 border border-lime-500/30 rounded-xl p-4 space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-lime-400 text-sm font-bold border-b border-lime-500/30 pb-2">
                <Terminal className="w-4 h-4" /> 개발자 도구
              </div>

              {/* Role Selector */}
              <div className="flex gap-2">
                {[Role.HERO, Role.VILLAIN, Role.CIVILIAN].map(r => (
                  <button
                    key={r}
                    onClick={() => { setActiveDebugRole(r); setMoneyInput(''); }}
                    className={`flex-1 py-1 text-xs font-bold rounded border ${activeDebugRole === r ? 'bg-lime-900/30 text-lime-400 border-lime-500' : 'bg-[#1c1c1c] text-gray-500 border-transparent'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {/* Money Cheat */}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">자금 변경 (현재: {resources[activeDebugRole].money}G)</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="변경할 금액" 
                      value={moneyInput}
                      onChange={(e) => setMoneyInput(e.target.value)}
                      className="flex-1 bg-[#1c1c1c] border border-[#404040] rounded px-3 text-sm text-white outline-none focus:border-lime-500"
                    />
                    <button 
                      onClick={handleSetMoney}
                      className="bg-lime-600 hover:bg-lime-500 text-black px-3 rounded font-bold text-xs"
                    >
                      설정
                    </button>
                  </div>
                </div>

                {/* Item Cheat */}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">아이템 강제 추가</label>
                  <div className="flex gap-2">
                    <select 
                      value={selectedItemId}
                      onChange={(e) => setSelectedItemId(e.target.value)}
                      className="flex-1 bg-[#1c1c1c] border border-[#404040] rounded px-2 py-2 text-xs text-white outline-none focus:border-lime-500"
                    >
                      {GAME_ITEMS.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.price}G)
                        </option>
                      ))}
                    </select>
                    <button 
                      onClick={() => onDebugAddItem(activeDebugRole, selectedItemId, 1)}
                      className="bg-lime-600 hover:bg-lime-500 text-black px-3 rounded font-bold text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> 1개
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
