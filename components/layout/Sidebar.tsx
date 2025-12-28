
import React from 'react';
import { PlusCircle } from 'lucide-react';
import LogViewer from '../simulation/LogViewer';
import FactionBalance from '../simulation/FactionBalance';
import { LogEntry, Character } from '../../types/index';

interface Props {
  characters?: Character[]; // Optional initially to avoid break, but we will pass it
  logs: LogEntry[];
  onOpenAddModal: () => void;
}

const Sidebar: React.FC<Props> = ({ characters = [], logs, onOpenAddModal }) => {
  return (
    <div className="lg:col-span-4 space-y-6 flex flex-col h-auto lg:h-[calc(100vh-6rem)] lg:sticky lg:top-24">
      
      {/* Power Balance Chart */}
      {characters.length > 0 && (
        <FactionBalance characters={characters} />
      )}

      {/* Add Character Button */}
      <button 
        onClick={onOpenAddModal}
        className="w-full bg-[#2a2a2a] hover:bg-[#333333] border-2 border-dashed border-[#404040] hover:border-blue-500 text-gray-400 hover:text-white rounded-xl p-6 transition-all group flex flex-col items-center gap-2 shadow-lg"
      >
        <div className="p-3 bg-[#1c1c1c] rounded-full group-hover:scale-110 transition-transform text-white shadow-inner border border-[#333]">
          <PlusCircle className="w-8 h-8" />
        </div>
        <span className="font-bold text-gray-200">새로운 캐릭터 등록</span>
        <span className="text-xs text-gray-500">히어로, 빌런, 시민을 추가하세요</span>
      </button>
      
      <div className="flex-1 min-h-0 flex flex-col">
        <LogViewer logs={logs} />
      </div>
    </div>
  );
};

export default Sidebar;
