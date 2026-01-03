
import React from 'react';
import { GameSettings } from '../../types/index';
import { X, Settings as SettingsIcon, Heart, ShieldAlert, Users, HeartOff, UserCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
}

const SettingsModal: React.FC<Props> = ({ isOpen, onClose, settings, onUpdateSettings }) => {
  if (!isOpen) return null;

  const toggleSetting = (key: keyof GameSettings) => {
    onUpdateSettings({
      ...settings,
      [key]: !settings[key]
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#232323] w-full max-w-md rounded-2xl border border-[#404040] shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        
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
        <div className="p-6 space-y-6 bg-[#2a2a2a] overflow-y-auto">
          
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

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
