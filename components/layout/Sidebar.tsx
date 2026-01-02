
import React from 'react';
import { PlusCircle, Network } from 'lucide-react';
import LogViewer from '../simulation/LogViewer';
import FactionBalance from '../simulation/FactionBalance';
import { LogEntry, Character } from '../../types/index';

interface Props {
  characters?: Character[]; 
  logs: LogEntry[];
  onOpenAddModal: () => void;
  onOpenRelMap: () => void; // New prop
}

const Sidebar: React.FC<Props> = ({ characters = [], logs, onOpenAddModal, onOpenRelMap }) => {
  return (
    <div className="lg:col-span-4 space-y-6 flex flex-col h-auto lg:h-[calc(100vh-6rem)] lg:sticky lg:top-24">
      
      {/* Power Balance Chart */}
      {characters.length > 0 && (
        <FactionBalance characters={characters} />
      )}

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Add Character Button */}
        <button 
          onClick={onOpenAddModal}
          className="bg-[#2a2a2a] hover:bg-[#333333] border border-[#404040] hover:border-blue-500 text-gray-400 hover:text-white rounded-xl p-4 transition-all group flex flex-col items-center gap-2 shadow-lg"
        >
          <div className="p-2 bg-[#1c1c1c] rounded-full group-hover:scale-110 transition-transform text-blue-500 shadow-inner border border-[#333]">
            <PlusCircle className="w-5 h-5" />
          </div>
          <span className="font-bold text-xs text-gray-200">캐릭터 추가</span>
        </button>

        {/* Relationship Map Button */}
        <button 
          onClick={onOpenRelMap}
          className="bg-[#2a2a2a] hover:bg-[#333333] border border-[#404040] hover:border-purple-500 text-gray-400 hover:text-white rounded-xl p-4 transition-all group flex flex-col items-center gap-2 shadow-lg"
        >
          <div className="p-2 bg-[#1c1c1c] rounded-full group-hover:scale-110 transition-transform text-purple-500 shadow-inner border border-[#333]">
            <Network className="w-5 h-5" />
          </div>
          <span className="font-bold text-xs text-gray-200">관계도 보기</span>
        </button>
      </div>
      
      <div className="flex-1 min-h-0 flex flex-col">
        <LogViewer logs={logs} />
      </div>
    </div>
  );
};

export default Sidebar;
