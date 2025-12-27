import React from 'react';
import { ShieldAlert, FastForward, RotateCcw } from 'lucide-react';
import { Character, Status } from '../../types/index';

interface Props {
  day: number;
  characters: Character[];
  onNextDay: () => void;
  onReset: () => void;
}

const Header: React.FC<Props> = ({ day, characters, onNextDay, onReset }) => {
  const aliveCount = characters.filter(c => c.status !== Status.DEAD).length;

  return (
    <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-10 shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-blue-500" />
          <span className="font-bold text-lg tracking-tight">히어로&빌런 <span className="text-slate-500">SIM</span></span>
        </div>

        <div className="flex items-center bg-slate-800 rounded-full px-4 py-1.5 border border-slate-700 gap-6 shadow-inner">
           <div className="flex flex-col items-center leading-none">
             <span className="text-[10px] text-slate-500 uppercase font-bold">Day</span>
             <span className="text-lg font-mono text-blue-400 font-bold">{day}</span>
           </div>
           <div className="w-px h-6 bg-slate-700"></div>
           <div className="flex flex-col items-center leading-none">
             <span className="text-[10px] text-slate-500 uppercase font-bold">Alive</span>
             <span className="text-lg font-mono text-emerald-400 font-bold">{aliveCount}</span>
           </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNextDay}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all active:scale-95 shadow-lg shadow-blue-900/50 border border-blue-500"
          >
            <FastForward className="w-4 h-4" />
            다음 날 진행
          </button>
          <button
            onClick={onReset}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors border border-transparent hover:border-slate-600"
            title="초기화"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;