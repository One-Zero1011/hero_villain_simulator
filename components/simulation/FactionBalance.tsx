
import React, { useState, useMemo } from 'react';
import { Character, Role, Status } from '../../types/index';
import { Scale, Info, Calculator, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  characters: Character[];
}

const FactionBalance: React.FC<Props> = ({ characters }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Calculation Logic
  const calculatePower = (role: Role) => {
    const activeChars = characters.filter(c => c.role === role && c.status !== Status.DEAD);
    const count = activeChars.length;
    
    const totalStats = activeChars.reduce((acc, char) => {
      if (!char.stats) return acc;
      return acc + (char.stats.strength + char.stats.intelligence + char.stats.stamina + char.stats.luck);
    }, 0);

    // Formula: (Headcount * 500) + Sum of all stats
    const headcountScore = count * 500;
    const finalScore = headcountScore + totalStats;

    return { count, headcountScore, totalStats, finalScore };
  };

  const heroData = useMemo(() => calculatePower(Role.HERO), [characters]);
  const villainData = useMemo(() => calculatePower(Role.VILLAIN), [characters]);

  const totalPower = heroData.finalScore + villainData.finalScore;
  const heroPercentage = totalPower === 0 ? 50 : Math.round((heroData.finalScore / totalPower) * 100);
  const villainPercentage = totalPower === 0 ? 50 : 100 - heroPercentage;

  return (
    <div className="bg-[#2a2a2a] p-5 rounded-xl border border-[#404040] shadow-lg mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-gray-200 font-bold flex items-center gap-2">
          <Scale className="w-5 h-5 text-gray-400" />
          세력 균형 (Power Balance)
        </h3>
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-gray-500 hover:text-blue-400 flex items-center gap-1 transition-colors"
        >
          <Calculator className="w-3 h-3" />
          계산식 {showDetails ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="relative h-6 bg-[#1c1c1c] rounded-full overflow-hidden flex border border-[#333333]">
        <div 
          style={{ width: `${heroPercentage}%` }} 
          className="bg-gradient-to-r from-blue-700 to-blue-500 h-full transition-all duration-1000 ease-out relative group"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
        <div 
          style={{ width: `${villainPercentage}%` }} 
          className="bg-gradient-to-l from-red-700 to-red-500 h-full transition-all duration-1000 ease-out relative group"
        >
           <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
        
        {/* VS Badge */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#2a2a2a] rounded-full px-1.5 py-0.5 border border-[#404040] z-10">
          <span className="text-[10px] font-black text-gray-400">VS</span>
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-2 text-sm font-mono font-bold">
        <div className="text-blue-400 flex flex-col items-start">
          <span>HERO {heroPercentage}%</span>
          <span className="text-xs text-gray-500 font-normal">{heroData.finalScore.toLocaleString()} CP</span>
        </div>
        <div className="text-red-400 flex flex-col items-end">
          <span>VILLAIN {villainPercentage}%</span>
          <span className="text-xs text-gray-500 font-normal">{villainData.finalScore.toLocaleString()} CP</span>
        </div>
      </div>

      {/* Calculation Details Toggle */}
      {showDetails && (
        <div className="mt-4 p-3 bg-[#1c1c1c] rounded-lg text-xs space-y-3 animate-fade-in border border-[#333333]">
          <div className="flex items-center gap-2 text-gray-400 border-b border-[#333] pb-2">
            <Info className="w-3 h-3" />
            <span className="font-bold">전투력(CP) 산출 공식</span>
          </div>
          
          <div className="space-y-1 font-mono text-gray-500">
            <p>(1) 인원 점수 = <span className="text-gray-300">생존자 수 × 500</span></p>
            <p>(2) 스탯 점수 = <span className="text-gray-300">∑(근력+지능+체력+행운)</span></p>
            <p className="text-yellow-500/80 pt-1 border-t border-[#333] mt-1">
              (1) + (2) = 총 세력 전투력
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <span className="text-blue-400 font-bold block mb-1">히어로</span>
              <div className="flex justify-between text-gray-500"><span>인원({heroData.count})</span> <span>{heroData.headcountScore}</span></div>
              <div className="flex justify-between text-gray-500"><span>스탯합</span> <span>{heroData.totalStats}</span></div>
            </div>
            <div>
              <span className="text-red-400 font-bold block mb-1">빌런</span>
              <div className="flex justify-between text-gray-500"><span>인원({villainData.count})</span> <span>{villainData.headcountScore}</span></div>
              <div className="flex justify-between text-gray-500"><span>스탯합</span> <span>{villainData.totalStats}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FactionBalance;
