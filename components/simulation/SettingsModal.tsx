
import React from 'react';
import { GameSettings } from '../../types/index';
import { X, Settings as SettingsIcon, Heart, ShieldAlert, Users } from 'lucide-react';

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
      <div className="bg-[#232323] w-full max-w-md rounded-2xl border border-[#404040] shadow-2xl flex flex-col overflow-hidden">
        
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
        <div className="p-6 space-y-6 bg-[#2a2a2a]">
          
          <div className="space-y-4">
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
