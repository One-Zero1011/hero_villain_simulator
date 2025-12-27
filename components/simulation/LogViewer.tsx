import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../../types/index';

interface Props {
  logs: LogEntry[];
}

const LogViewer: React.FC<Props> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogStyle = (type: LogEntry['type']) => {
    switch (type) {
      case 'BATTLE': return 'text-yellow-200 border-l-2 border-yellow-500/50 pl-2 bg-yellow-900/10 py-1';
      case 'DEATH': return 'text-red-400 font-bold bg-red-900/20 p-2 rounded border border-red-900/30';
      case 'EVENT': return 'text-purple-300 border-l-2 border-purple-500/30 pl-2';
      case 'INTERVENTION': return 'text-cyan-300 font-medium border-l-2 border-cyan-500 pl-2 italic bg-cyan-900/10 py-1';
      default: return 'text-slate-400 pl-2';
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl shadow-inner flex flex-col h-[500px] border border-slate-700 overflow-hidden">
      <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
        <h2 className="font-bold text-slate-100 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          시스템 로그
        </h2>
        <span className="text-xs text-slate-500 font-mono">{logs.length} events</span>
      </div>
      
      <div className="flex-1 overflow-y-auto log-scroll p-4 space-y-2 font-mono text-sm bg-slate-900">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2">
            <div className="w-12 h-1 bg-slate-700 rounded-full"></div>
            <p>시뮬레이션 대기 중...</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="animate-fade-in group">
              <div className="flex gap-3">
                <span className="text-[10px] text-slate-600 pt-1 min-w-[3rem]">Day {log.day}</span>
                <p className={`flex-1 text-sm ${getLogStyle(log.type)}`}>
                  {log.message}
                </p>
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