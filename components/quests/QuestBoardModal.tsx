
import React, { useState } from 'react';
import { Character, Quest, QuestType, Role, Status } from '../../types/index';
import { X, Scroll, Target, Shield, Skull, Coins, Clock, CheckCircle, User } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  quests: Quest[];
  characters: Character[];
  onPostQuest: (type: QuestType, targetId: string, reward: number, duration?: number) => void;
  onDeleteQuest: (questId: string) => void;
}

const QuestBoardModal: React.FC<Props> = ({ isOpen, onClose, quests, characters, onPostQuest, onDeleteQuest }) => {
  const [activeTab, setActiveTab] = useState<'BOARD' | 'POST'>('BOARD');
  
  // Post Form State
  const [selectedType, setSelectedType] = useState<QuestType>('SUBJUGATION');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [rewardAmount, setRewardAmount] = useState<number>(1000);
  const [duration, setDuration] = useState<number>(3); // For Escort

  if (!isOpen) return null;

  // Filter possible targets based on quest type
  const possibleTargets = characters.filter(c => {
    if (c.status === Status.DEAD) return false;
    if (selectedType === 'SUBJUGATION') return c.role === Role.VILLAIN;
    if (selectedType === 'ASSASSINATION') return c.role === Role.HERO || c.role === Role.CIVILIAN;
    if (selectedType === 'ESCORT') return c.role === Role.CIVILIAN;
    return true;
  });

  const handlePost = () => {
    if (!selectedTargetId) return;
    onPostQuest(selectedType, selectedTargetId, rewardAmount, selectedType === 'ESCORT' ? duration : undefined);
    setActiveTab('BOARD');
    // Reset defaults
    setRewardAmount(1000);
    setSelectedTargetId('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return <span className="bg-green-900/50 text-green-400 px-2 py-0.5 rounded text-[10px] border border-green-700">모집중</span>;
      case 'IN_PROGRESS': return <span className="bg-blue-900/50 text-blue-400 px-2 py-0.5 rounded text-[10px] border border-blue-700">진행중</span>;
      case 'COMPLETED': return <span className="bg-yellow-900/50 text-yellow-400 px-2 py-0.5 rounded text-[10px] border border-yellow-700">완료</span>;
      case 'FAILED': return <span className="bg-red-900/50 text-red-400 px-2 py-0.5 rounded text-[10px] border border-red-700">실패</span>;
      default: return null;
    }
  };

  const getTypeIcon = (type: QuestType) => {
    switch(type) {
        case 'SUBJUGATION': return <Shield className="w-4 h-4 text-blue-400" />;
        case 'ASSASSINATION': return <Skull className="w-4 h-4 text-red-400" />;
        case 'ESCORT': return <User className="w-4 h-4 text-green-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1e1b18] w-full max-w-4xl h-[85vh] rounded-xl border-4 border-[#3c3429] shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Paper Texture Background Effect */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cardboard.png')]"></div>

        {/* Header */}
        <div className="p-5 border-b-2 border-[#3c3429] flex justify-between items-center bg-[#2b2520] relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-[#a67c52] p-2 rounded-lg text-[#2b2520] shadow-inner">
              <Scroll className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#d4b483] font-serif tracking-wide">의뢰 게시판</h2>
              <p className="text-xs text-[#8c7b66]">원하는 의뢰를 등록하거나 현황을 확인하세요.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#8c7b66] hover:text-[#d4b483] transition-colors">
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#231f1a] border-b-2 border-[#3c3429] relative z-10">
          <button 
            onClick={() => setActiveTab('BOARD')}
            className={`flex-1 py-4 font-bold text-sm transition-all ${activeTab === 'BOARD' ? 'bg-[#3c3429] text-[#e5d5c0]' : 'text-[#6b5d4d] hover:bg-[#2b2520]'}`}
          >
            의뢰 목록 ({quests.filter(q => q.status === 'OPEN' || q.status === 'IN_PROGRESS').length})
          </button>
          <button 
            onClick={() => setActiveTab('POST')}
            className={`flex-1 py-4 font-bold text-sm transition-all ${activeTab === 'POST' ? 'bg-[#3c3429] text-[#e5d5c0]' : 'text-[#6b5d4d] hover:bg-[#2b2520]'}`}
          >
            의뢰 등록하기
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#1e1b18] relative z-10 custom-scrollbar">
          
          {activeTab === 'BOARD' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quests.length === 0 ? (
                <div className="col-span-full h-64 flex flex-col items-center justify-center text-[#5c4e40] gap-2 border-2 border-dashed border-[#3c3429] rounded-xl">
                  <Scroll className="w-10 h-10 opacity-50" />
                  <p>등록된 의뢰가 없습니다.</p>
                </div>
              ) : (
                quests.map(quest => (
                  <div key={quest.id} className="bg-[#2b2520] border border-[#3c3429] p-4 rounded-lg shadow-lg relative group transition-transform hover:-translate-y-1">
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(quest.status)}
                    </div>

                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-[#1e1b18] rounded border border-[#3c3429]">
                        {getTypeIcon(quest.type)}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#d4b483] text-lg leading-tight flex items-center gap-2">
                          {quest.type === 'SUBJUGATION' ? '토벌 의뢰' : quest.type === 'ESCORT' ? '호위 의뢰' : '암살 의뢰'}
                        </h3>
                        <div className="text-xs text-[#8c7b66] mt-0.5 font-mono">ID: {quest.id}</div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 bg-[#1e1b18] p-3 rounded border border-[#3c3429]/50">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[#8c7b66]">목표 대상:</span>
                        <span className="font-bold text-[#e5d5c0] flex items-center gap-1">
                          <Target className="w-3 h-3" /> {quest.targetName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[#8c7b66]">보상금:</span>
                        <span className="font-bold text-yellow-500 flex items-center gap-1 font-mono">
                          <Coins className="w-3 h-3" /> {quest.reward.toLocaleString()} G
                        </span>
                      </div>
                      {quest.type === 'ESCORT' && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-[#8c7b66]">남은 기간:</span>
                          <span className="font-bold text-blue-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" /> {quest.duration}일
                          </span>
                        </div>
                      )}
                    </div>

                    {quest.assignedCharName && (
                      <div className="text-xs text-center py-2 bg-[#3c3429]/50 rounded text-[#d4b483] font-bold mb-3 border border-[#3c3429]">
                        수행 중: {quest.assignedCharName}
                      </div>
                    )}

                    {/* Delete Button (Only for Completed/Failed or if needed) */}
                    <button 
                      onClick={() => onDeleteQuest(quest.id)}
                      className="w-full py-2 bg-[#3c3429] hover:bg-[#4a4033] text-[#8c7b66] hover:text-[#d4b483] rounded text-xs transition-colors"
                    >
                      의뢰서 파기
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'POST' && (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="bg-[#2b2520] p-6 rounded-xl border border-[#3c3429] space-y-6">
                
                {/* Type Selection */}
                <div>
                  <label className="block text-[#8c7b66] text-xs font-bold uppercase mb-2">의뢰 유형</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'SUBJUGATION', label: '토벌 (빌런 처치)', icon: <Shield className="w-4 h-4"/> },
                      { id: 'ESCORT', label: '호위 (시민 보호)', icon: <User className="w-4 h-4"/> },
                      { id: 'ASSASSINATION', label: '암살 (히어로 처치)', icon: <Skull className="w-4 h-4"/> }
                    ].map(type => (
                      <button
                        key={type.id}
                        onClick={() => { setSelectedType(type.id as QuestType); setSelectedTargetId(''); }}
                        className={`py-3 px-2 rounded-lg border-2 text-xs font-bold flex flex-col items-center gap-2 transition-all
                          ${selectedType === type.id 
                            ? 'bg-[#3c3429] border-[#d4b483] text-[#d4b483]' 
                            : 'bg-[#1e1b18] border-[#3c3429] text-[#6b5d4d] hover:border-[#5c4e40]'}
                        `}
                      >
                        {type.icon}
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Selection */}
                <div>
                  <label className="block text-[#8c7b66] text-xs font-bold uppercase mb-2">목표 대상</label>
                  <select
                    value={selectedTargetId}
                    onChange={(e) => setSelectedTargetId(e.target.value)}
                    className="w-full bg-[#1e1b18] border-2 border-[#3c3429] text-[#d4b483] p-3 rounded-lg focus:border-[#d4b483] outline-none transition-colors"
                  >
                    <option value="">대상을 선택하세요...</option>
                    {possibleTargets.map(char => (
                      <option key={char.id} value={char.id}>
                        {char.name} ({char.role}) - 전투력 {char.power}
                      </option>
                    ))}
                  </select>
                  {possibleTargets.length === 0 && (
                    <p className="text-xs text-red-400 mt-2">* 해당 유형의 가능한 목표 대상이 없습니다.</p>
                  )}
                </div>

                {/* Reward & Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#8c7b66] text-xs font-bold uppercase mb-2">보상금 (Gold)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={rewardAmount}
                        onChange={(e) => setRewardAmount(parseInt(e.target.value) || 0)}
                        className="w-full bg-[#1e1b18] border-2 border-[#3c3429] text-yellow-500 p-3 rounded-lg focus:border-yellow-600 outline-none font-mono font-bold pl-10"
                      />
                      <Coins className="w-4 h-4 text-yellow-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  
                  {selectedType === 'ESCORT' && (
                    <div className="animate-fade-in">
                      <label className="block text-[#8c7b66] text-xs font-bold uppercase mb-2">호위 기간 (일)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                        className="w-full bg-[#1e1b18] border-2 border-[#3c3429] text-blue-400 p-3 rounded-lg focus:border-blue-500 outline-none font-mono font-bold"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#3c3429]">
                  <button
                    onClick={handlePost}
                    disabled={!selectedTargetId}
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2
                      ${selectedTargetId 
                        ? 'bg-[#d4b483] text-[#2b2520] hover:bg-[#e5d5c0]' 
                        : 'bg-[#3c3429] text-[#6b5d4d] cursor-not-allowed'}
                    `}
                  >
                    <CheckCircle className="w-5 h-5" />
                    의뢰 등록
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestBoardModal;
