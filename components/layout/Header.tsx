
import React from 'react';
import { ShieldAlert, FastForward, RotateCcw, Save } from 'lucide-react';
import { Character, Status } from '../../types/index';

interface Props {
  day: number;
  characters: Character[];
  onNextDay: () => void;
  onReset: () => void;
  onOpenSaveLoad?: () => void; // New prop
}

const Header: React.FC<Props> = ({ day, characters, onNextDay, onReset, onOpenSaveLoad }) => {
  const aliveCount = characters.filter(c => c.status !== Status.DEAD).length;

  return (
    <nav className="bg-[#1c1c1c] border-b border-[#333333] sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-3 md:px-4 h-14 md:h-16 flex items-center justify-between">
        {/* Logo Area - Compact on Mobile */}
        <div className="flex items-center gap-2 shrink-0">
          <ShieldAlert className="w-5 h-5 md:w-6 md:h-6 text-white" />
          <span className="font-bold text-base md:text-lg tracking-tight text-white hidden xs:inline-block">
            <span className="hidden sm:inline">히어로&빌런</span>
            <span className="sm:hidden">H&V</span>
            <span className="text-gray-500 ml-1">SIM</span>
          </span>
        </div>

        {/* Stats Area */}
        <div className="flex items-center bg-[#2a2a2a] rounded-full px-3 py-1 md:px-4 md:py-1.5 border border-[#404040] gap-3 md:gap-6 shadow-inner mx-2">
           <div className="flex flex-col items-center leading-none">
             <span className="text-[8px] md:text-[10px] text-gray-400 uppercase font-bold">Day</span>
             <span className="text-sm md:text-lg font-mono text-blue-400 font-bold">{day}</span>
           </div>
           <div className="w-px h-4 md:h-6 bg-[#404040]"></div>
           <div className="flex flex-col items-center leading-none">
             <span className="text-[8px] md:text-[10px] text-gray-400 uppercase font-bold">Alive</span>
             <span className="text-sm md:text-lg font-mono text-emerald-400 font-bold">{aliveCount}</span>
           </div>
        </div>

        {/* Actions Area */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onNextDay}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-xs md:text-sm transition-all active:scale-95 shadow-lg shadow-blue-900/20 border border-blue-500"
          >
            <FastForward className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">다음 날 진행</span>
            <span className="sm:hidden">다음 날</span>
          </button>
          
          {/* Save/Load Button */}
          {onOpenSaveLoad && (
            <button
              onClick={onOpenSaveLoad}
              className="p-1.5 md:p-2 text-gray-300 hover:text-white hover:bg-[#333333] rounded-lg transition-colors border border-transparent hover:border-[#404040]"
              title="저장 / 불러오기"
            >
              <Save className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          )}

          <button
            onClick={onReset}
            className="p-1.5 md:p-2 text-gray-400 hover:text-white hover:bg-[#333333] rounded-lg transition-colors border border-transparent hover:border-[#404040]"
            title="초기화"
          >
            <RotateCcw className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
