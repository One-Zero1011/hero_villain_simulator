import React, { useState } from 'react';
import { Character, Housing } from '../types';
import { HOUSING_THEMES, HOUSING_ITEMS } from '../data/housingOptions';
import { 
  X, Save, Home, Monitor, Armchair, Sword, Cat, 
  Flower2, Vault, Tv, Coffee, Target, Bed, Box 
} from 'lucide-react';

// Icon mapping helper
const getIcon = (iconName: string, className: string) => {
  const icons: Record<string, React.ReactNode> = {
    'Monitor': <Monitor className={className} />,
    'Armchair': <Armchair className={className} />,
    'Sword': <Sword className={className} />,
    'Cat': <Cat className={className} />,
    'Flower2': <Flower2 className={className} />,
    'Vault': <Vault className={className} />,
    'Tv': <Tv className={className} />,
    'Coffee': <Coffee className={className} />,
    'Target': <Target className={className} />,
    'Bed': <Bed className={className} />,
  };
  return icons[iconName] || <Box className={className} />;
};

interface Props {
  character: Character;
  isOpen: boolean;
  onClose: () => void;
  onSave: (charId: string, housing: Housing) => void;
}

const HousingModal: React.FC<Props> = ({ character, isOpen, onClose, onSave }) => {
  // Initialize state with character's current housing or defaults
  const [themeId, setThemeId] = useState(character.housing?.themeId || 'default_room');
  const [items, setItems] = useState<string[]>(character.housing?.items || []);
  const [activeTab, setActiveTab] = useState<'THEME' | 'ITEM'>('THEME');

  if (!isOpen) return null;

  const currentTheme = HOUSING_THEMES.find(t => t.id === themeId) || HOUSING_THEMES[0];

  const toggleItem = (itemId: string) => {
    if (items.includes(itemId)) {
      setItems(items.filter(i => i !== itemId));
    } else {
      if (items.length >= 4) {
        alert("가구는 최대 4개까지 배치할 수 있습니다!");
        return;
      }
      setItems([...items, itemId]);
    }
  };

  const handleSave = () => {
    onSave(character.id, { themeId, items });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 w-full max-w-4xl h-[80vh] rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left: Preview Area */}
        <div className={`relative flex-1 p-6 transition-all duration-500 ${currentTheme.styleClass} flex flex-col items-center justify-center overflow-hidden`}>
          {/* Room Label */}
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full border border-white/10 text-white text-sm flex items-center gap-2">
            <Home className="w-4 h-4" />
            <span>{character.name}의 {currentTheme.name}</span>
          </div>

          {/* Character Avatar (Conceptual) */}
          <div className="relative z-10 flex flex-col items-center animate-bounce-slow">
            <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-xl flex items-center justify-center text-4xl overflow-hidden">
               {/* Simple avatar representation */}
               <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${character.id}`} 
                alt="avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-4 bg-black/60 text-white px-3 py-1 rounded-lg text-xs backdrop-blur">
              {character.role}
            </div>
          </div>

          {/* Placed Items Grid */}
          <div className="absolute bottom-8 w-full px-8 flex justify-center gap-6 z-0">
            {items.map((itemId) => {
              const itemDef = HOUSING_ITEMS.find(i => i.id === itemId);
              if (!itemDef) return null;
              return (
                <div key={itemId} className="flex flex-col items-center gap-1 animate-fade-in-up">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur border border-white/20 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    {getIcon(itemDef.icon, "w-8 h-8 text-white")}
                  </div>
                  <span className="text-[10px] text-white/80 bg-black/40 px-2 rounded">{itemDef.name}</span>
                </div>
              );
            })}
            {items.length === 0 && (
              <div className="text-white/40 text-sm italic">가구가 배치되지 않았습니다.</div>
            )}
          </div>
        </div>

        {/* Right: Controls */}
        <div className="w-full md:w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
            <h2 className="font-bold text-white">공간 꾸미기</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex p-2 gap-2 border-b border-slate-700">
            <button 
              onClick={() => setActiveTab('THEME')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'THEME' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
            >
              테마 설정
            </button>
            <button 
              onClick={() => setActiveTab('ITEM')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'ITEM' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
            >
              가구 배치 ({items.length}/4)
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {activeTab === 'THEME' ? (
              HOUSING_THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setThemeId(theme.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${themeId === theme.id ? 'bg-blue-900/30 border-blue-500' : 'bg-slate-700/50 border-transparent hover:bg-slate-700'}`}
                >
                  <div className="text-sm font-bold text-slate-200">{theme.name}</div>
                  <div className="text-xs text-slate-500 mt-1">{theme.description}</div>
                </button>
              ))
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {HOUSING_ITEMS.map(item => {
                  const isSelected = items.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`relative p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${isSelected ? 'bg-green-900/30 border-green-500' : 'bg-slate-700/50 border-transparent hover:bg-slate-700'}`}
                    >
                      {getIcon(item.icon, isSelected ? "text-green-400 w-6 h-6" : "text-slate-400 w-6 h-6")}
                      <span className={`text-xs ${isSelected ? 'text-green-300' : 'text-slate-400'}`}>{item.name}</span>
                      {isSelected && <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_lime]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-700 bg-slate-900/50">
            <button 
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              변경사항 저장
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite ease-in-out;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default HousingModal;