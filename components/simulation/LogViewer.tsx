
import React, { useEffect, useRef, useState } from 'react';
import { LogEntry } from '../../types/index';
import { ToggleLeft, ToggleRight, Heart, Brain } from 'lucide-react';

interface Props {
  logs: LogEntry[];
}

const LogViewer: React.FC<Props> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogStyle = (type: LogEntry['type']) => {
    switch (type) {
      case 'BATTLE': return 'text-yellow-400 border-l-2 border-yellow-500/50 pl-2 bg-yellow-900/10 py-1';
      case 'DEATH': return 'text-red-400 font-bold bg-red-900/20 p-2 rounded border border-red-900/30';
      case 'EVENT': return 'text-purple-300 border-l-2 border-purple-500/30 pl-2';
      case 'INTERVENTION': return 'text-cyan-300 font-medium border-l-2 border-cyan-500 pl-2 italic bg-cyan-900/10 py-1';
      case 'INSANITY': return 'text-fuchsia-400 font-bold border-l-4 border-fuchsia-600 pl-2 bg-fuchsia-900/20 py-1 animate-pulse';
      case 'ROMANCE': return 'text-pink-300 font-bold border-l-4 border-pink-500 pl-2 bg-pink-900/20 py-1';
      default: return 'text-gray-400 pl-2';
    }
  };

  const renderStatChange = (label: string, value: number, icon: React.ReactNode, positiveColor: string, negativeColor: string) => {
    if (value === 0) return null;
    const isPositive = value > 0;
    const colorClass = isPositive ? positiveColor : negativeColor;
    const sign = isPositive ? '+' : '';
    
    return (
      <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/30 border border-white/5 ${colorClass}`}>
        {icon} {label} {sign}{Math.round(value)}
      </span>
    );
  };

  return (
    <div className="bg-[#2a2a2a] rounded-xl shadow-lg flex flex-col h-60 lg:h-[500px] border border-[#333333] overflow-hidden transition-all duration-300">
      <div className="p-3 md:p-4 bg-[#1c1c1c] border-b border-[#333333] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-gray-100 flex items-center gap-2 text-sm md:text-base">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            시스템 로그
          </h2>
          <span className="text-[10px] md:text-xs text-gray-500 font-mono">{logs.length} events</span>
        </div>
        
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className={`flex items-center gap-1 text-[10px] md:text-xs font-medium px-2 py-1 rounded transition-colors ${showDetails ? 'text-blue-400 bg-blue-900/20' : 'text-gray-500 hover:text-gray-300'}`}
          title="체력/정신력 변동 상세 보기"
        >
          {showDetails ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
          상세 정보 {showDetails ? 'ON' : 'OFF'}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto log-scroll p-3 md:p-4 space-y-2 font-mono text-xs md:text-sm bg-[#2a2a2a]">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-2">
            <div className="w-12 h-1 bg-[#333333] rounded-full"></div>
            <p>시뮬레이션 대기 중...</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="animate-fade-in group">
              <div className="flex flex-col gap-1">
                <div className="flex gap-2 md:gap-3 items-start">
                  <span className="text-[10px] text-gray-600 pt-1 min-w-[2.5rem] md:min-w-[3rem] shrink-0">Day {log.day}</span>
                  <div className="flex-1">
                    <p className={`break-keep ${getLogStyle(log.type)}`}>
                      {log.message}
                    </p>
                    
                    {/* Stat Changes Badge */}
                    {showDetails && log.statChanges && (log.statChanges.hp !== 0 || log.statChanges.sanity !== 0) && (
                      <div className="flex gap-2 mt-1 ml-2 animate-fade-in">
                        {log.statChanges.hp !== undefined && renderStatChange('HP', log.statChanges.hp, <Heart className="w-3 h-3" />, 'text-green-400', 'text-red-400')}
                        {log.statChanges.sanity !== undefined && renderStatChange('정신', log.statChanges.sanity, <Brain className="w-3 h-3" />, 'text-blue-400', 'text-purple-400')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default LogViewer;
