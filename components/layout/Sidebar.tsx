
import React, { useState } from 'react';
import { PlusCircle, Network, ChevronDown, ChevronUp, BarChart2, Scroll } from 'lucide-react';
import LogViewer from '../simulation/LogViewer';
import FactionBalance from '../simulation/FactionBalance';
import { LogEntry, Character } from '../../types/index';

interface Props {
  characters?: Character[]; 
  logs: LogEntry[];
  onOpenAddModal: () => void;
  onOpenRelMap: () => void; 
  onOpenQuestBoard: () => void; // New Prop
}

const Sidebar: React.FC<Props> = ({ characters = [], logs, onOpenAddModal, onOpenRelMap, onOpenQuestBoard }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="lg:col-span-4 flex flex-col gap-4 lg:gap-6 h-auto lg:h-[calc(100vh-6rem)] lg:sticky lg:top-24 transition-all">
      
      {/* Action Buttons Grid */}
      <div className="grid grid-cols-3 gap-2">
        {/* Add Character Button */}
        <button 
          onClick={onOpenAddModal}
          className="bg-[#2a2a2a] hover:bg-[#333333] border border-[#404040] hover:border-blue-500 text-gray-400 hover:text-white rounded-xl p-2 md:p-3 transition-all group flex flex-col items-center justify-center gap-1 shadow-lg"
        >
          <div className="p-1.5 bg-[#1c1c1c] rounded-full group-hover:scale-110 transition-transform text-blue-500 shadow-inner border border-[#333]">
            <PlusCircle className="w-4 h-4" />
          </div>
          <span className="font-bold text-[10px] md:text-xs text-gray-200">캐릭터 추가</span>
        </button>

        {/* Relationship Map Button */}
        <button 
          onClick={onOpenRelMap}
          className="bg-[#2a2a2a] hover:bg-[#333333] border border-[#404040] hover:border-purple-500 text-gray-400 hover:text-white rounded-xl p-2 md:p-3 transition-all group flex flex-col items-center justify-center gap-1 shadow-lg"
        >
          <div className="p-1.5 bg-[#1c1c1c] rounded-full group-hover:scale-110 transition-transform text-purple-500 shadow-inner border border-[#333]">
            <Network className="w-4 h-4" />
          </div>
          <span className="font-bold text-[10px] md:text-xs text-gray-200">관계도 보기</span>
        </button>

        {/* Quest Board Button */}
        <button 
          onClick={onOpenQuestBoard}
          className="bg-[#2a2a2a] hover:bg-[#333333] border border-[#404040] hover:border-yellow-500 text-gray-400 hover:text-white rounded-xl p-2 md:p-3 transition-all group flex flex-col items-center justify-center gap-1 shadow-lg"
        >
          <div className="p-1.5 bg-[#1c1c1c] rounded-full group-hover:scale-110 transition-transform text-yellow-500 shadow-inner border border-[#333]">
            <Scroll className="w-4 h-4" />
          </div>
          <span className="font-bold text-[10px] md:text-xs text-gray-200">의뢰 게시판</span>
        </button>
      </div>

      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="lg:hidden w-full flex items-center justify-center gap-2 bg-[#2a2a2a] border border-[#404040] text-gray-300 py-3 rounded-xl font-bold hover:bg-[#333] transition-colors"
      >
        <BarChart2 className="w-4 h-4" />
        {isExpanded ? '통계 및 로그 숨기기' : '통계 및 로그 보기'}
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      
      {/* Collapsible Content (Balance & Logs) */}
      <div className={`flex-col gap-4 lg:gap-6 ${isExpanded ? 'flex' : 'hidden'} lg:flex lg:flex-1 lg:min-h-0`}>
        {/* Power Balance Chart */}
        {characters.length > 0 && (
          <div className="animate-fade-in">
            <FactionBalance characters={characters} />
          </div>
        )}
        
        <div className="flex-1 min-h-0 flex flex-col animate-fade-in">
          <LogViewer logs={logs} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
