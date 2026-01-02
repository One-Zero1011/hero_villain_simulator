
import React, { useEffect, useState, useRef } from 'react';
import { Character, Role } from '../../types/index';
import { Shield, Skull, Sword, Zap, HeartPulse, Flame, AlertTriangle, SkipForward } from 'lucide-react';
import { calculateBattleDamage, getBattleFlavorText } from '../../utils/battleLogic';

interface Props {
  hero: Character;
  villain: Character;
  onComplete: (winner: Character, loser: Character, logs: string[]) => void;
}

interface FloatingText {
  id: number;
  role: Role;
  text: string;
  type: 'damage' | 'crit' | 'glancing';
}

const BattleArena: React.FC<Props> = ({ hero, villain, onComplete }) => {
  // Battle State
  const [heroHp, setHeroHp] = useState(100);
  const [villainHp, setVillainHp] = useState(100);
  const [turn, setTurn] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [attacker, setAttacker] = useState<Role | null>(null);
  
  // Visual Effects State
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [hitFlash, setHitFlash] = useState<Role | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Turn Logic Loop
  useEffect(() => {
    if (isFinished) return;

    const timer = setTimeout(() => {
      handleTurn();
    }, 1500); // 1.5s per turn normal speed

    return () => clearTimeout(timer);
  }, [turn, isFinished]);

  const addFloatingText = (role: Role, text: string, type: 'damage' | 'crit' | 'glancing') => {
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, role, text, type }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
    }, 800);
  };

  const handleTurn = () => {
    if (isFinished) return;

    const isHeroTurn = turn % 2 === 0;
    const attackerRole = isHeroTurn ? Role.HERO : Role.VILLAIN;
    const defenderRole = isHeroTurn ? Role.VILLAIN : Role.HERO;
    const attackerChar = isHeroTurn ? hero : villain;
    const defenderChar = isHeroTurn ? villain : hero;

    setAttacker(attackerRole);

    // Calculate Damage Logic
    const result = calculateBattleDamage(attackerChar, defenderChar);
    const damage = result.damage;

    // Trigger Visuals
    setTimeout(() => {
       if (isFinished) return; // Prevent visuals if skipped
       setHitFlash(defenderRole);
       
       let floatType: 'damage' | 'crit' | 'glancing' = 'damage';
       let floatText = `-${damage}`;
       
       if (result.isCrit) {
         floatType = 'crit';
         floatText = `CRIT! -${damage}`;
       } else if (result.isGlancing) {
         floatType = 'glancing';
         floatText = `Glancing -${damage}`;
       }
       
       addFloatingText(defenderRole, floatText, floatType);
    }, 200);

    // Apply Damage
    setTimeout(() => {
        if (isFinished) return;

        const newHp = isHeroTurn 
          ? Math.max(0, villainHp - damage) 
          : Math.max(0, heroHp - damage);
        
        if (isHeroTurn) setVillainHp(newHp);
        else setHeroHp(newHp);

        const logMsg = getBattleFlavorText(attackerChar.name, defenderChar.name, result);
        setLogs(prev => [...prev, `[Turn ${turn + 1}] ${logMsg}`]);

        if (newHp === 0) {
            setIsFinished(true);
            setTimeout(() => {
                onComplete(attackerChar, defenderChar, [...logs, `[Turn ${turn + 1}] ${logMsg}`]);
            }, 2000);
        } else {
            setTurn(prev => prev + 1);
            setAttacker(null);
            setHitFlash(null);
        }
    }, 500);
  };

  const handleSkip = () => {
    if (isFinished) return;
    setIsFinished(true); // Stop loop

    let currentHeroHp = heroHp;
    let currentVillainHp = villainHp;
    let currentTurn = turn;
    let newLogs: string[] = [];

    // Simulate instant battle
    while (currentHeroHp > 0 && currentVillainHp > 0) {
        const isHeroTurn = currentTurn % 2 === 0;
        const attackerChar = isHeroTurn ? hero : villain;
        const defenderChar = isHeroTurn ? villain : hero;
        
        const result = calculateBattleDamage(attackerChar, defenderChar);
        const damage = result.damage;
        
        const logMsg = getBattleFlavorText(attackerChar.name, defenderChar.name, result);
        newLogs.push(`[Turn ${currentTurn + 1}] ${logMsg} (-${damage})`);

        if (isHeroTurn) {
            currentVillainHp = Math.max(0, currentVillainHp - damage);
        } else {
            currentHeroHp = Math.max(0, currentHeroHp - damage);
        }
        currentTurn++;
    }

    // Final Update
    setHeroHp(currentHeroHp);
    setVillainHp(currentVillainHp);
    setLogs(prev => [...prev, ...newLogs]);
    setTurn(currentTurn);

    // Determine Winner
    const winner = currentHeroHp > 0 ? hero : villain;
    const loser = currentHeroHp > 0 ? villain : hero;

    setTimeout(() => {
        onComplete(winner, loser, [...logs, ...newLogs]);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-[#1a1a1a] rounded-2xl border border-[#333] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-[#252525] border-b border-[#333] flex justify-between items-center relative">
          <div className="flex items-center gap-2">
            <Sword className="w-5 h-5 text-yellow-500 animate-pulse" />
            <span className="font-bold text-gray-200">전투 시뮬레이션</span>
          </div>
          
          <div className="absolute left-1/2 -translate-x-1/2 bg-black/50 px-4 py-1 rounded-full border border-[#444] text-xs font-mono text-gray-400 flex items-center gap-2">
             <span>Turn {turn + 1}</span>
             <button 
               onClick={handleSkip}
               disabled={isFinished}
               className="flex items-center gap-1 hover:text-white transition-colors border-l border-[#444] pl-2 ml-2"
               title="결과까지 스킵"
             >
               <SkipForward className="w-3 h-3" /> 스킵
             </button>
          </div>

          <div className="flex gap-2">
             <div className="w-3 h-3 rounded-full bg-red-500 animate-ping"></div>
             <div className="w-3 h-3 rounded-full bg-yellow-500 animate-ping delay-75"></div>
          </div>
        </div>

        {/* Battle Scene */}
        <div className="flex-1 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center relative">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

          {/* Hero Side */}
          <div className={`relative z-10 flex flex-col items-center w-full md:w-1/3 transition-all duration-300 ${attacker === Role.HERO ? 'scale-110' : ''}`}>
             <div className={`relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-blue-500 overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.5)] bg-slate-800 ${hitFlash === Role.HERO ? 'animate-shake bg-red-500/50' : ''}`}>
                <img src={hero.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${hero.id}`} className="w-full h-full object-cover" />
                {heroHp === 0 && <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-red-500 font-bold text-2xl rotate-12">DEFEAT</div>}
             </div>
             
             {/* Hero HP Bar */}
             <div className="w-full mt-4 bg-gray-700 rounded-full h-4 overflow-hidden border border-gray-600 relative">
               <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300" style={{ width: `${heroHp}%` }}></div>
               <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">{heroHp}%</span>
             </div>
             
             <div className="mt-2 text-center">
               <div className="font-bold text-blue-400 text-lg flex items-center justify-center gap-2">
                 <Shield className="w-4 h-4" /> {hero.name}
               </div>
               <div className="text-xs text-gray-400">HERO</div>
             </div>

             {/* Floating Text */}
             {floatingTexts.filter(t => t.role === Role.HERO).map(t => (
               <div key={t.id} className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full text-2xl font-black animate-float-up pointer-events-none whitespace-nowrap
                 ${t.type === 'crit' ? 'text-yellow-400 text-3xl' : t.type === 'glancing' ? 'text-gray-400 text-lg' : 'text-red-500'}
               `}>
                 {t.text}
               </div>
             ))}
          </div>

          {/* VS Divider */}
          <div className="relative z-10 flex flex-col items-center justify-center">
             <div className="text-4xl md:text-6xl font-black text-white/20 italic">VS</div>
          </div>

          {/* Villain Side */}
          <div className={`relative z-10 flex flex-col items-center w-full md:w-1/3 transition-all duration-300 ${attacker === Role.VILLAIN ? 'scale-110' : ''}`}>
             <div className={`relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-red-500 overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.5)] bg-slate-800 ${hitFlash === Role.VILLAIN ? 'animate-shake bg-red-500/50' : ''}`}>
                <img src={villain.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${villain.id}`} className="w-full h-full object-cover" />
                {villainHp === 0 && <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-red-500 font-bold text-2xl rotate-12">DEFEAT</div>}
             </div>

             {/* Villain HP Bar */}
             <div className="w-full mt-4 bg-gray-700 rounded-full h-4 overflow-hidden border border-gray-600 relative">
               <div className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300" style={{ width: `${villainHp}%` }}></div>
               <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">{villainHp}%</span>
             </div>

             <div className="mt-2 text-center">
               <div className="font-bold text-red-400 text-lg flex items-center justify-center gap-2">
                 <Skull className="w-4 h-4" /> {villain.name}
               </div>
               <div className="text-xs text-gray-400">VILLAIN</div>
             </div>

             {/* Floating Text */}
             {floatingTexts.filter(t => t.role === Role.VILLAIN).map(t => (
               <div key={t.id} className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full text-2xl font-black animate-float-up pointer-events-none whitespace-nowrap
                 ${t.type === 'crit' ? 'text-yellow-400 text-3xl' : t.type === 'glancing' ? 'text-gray-400 text-lg' : 'text-red-500'}
               `}>
                 {t.text}
               </div>
             ))}
          </div>
        </div>

        {/* Logs */}
        <div className="h-40 bg-[#111] p-4 border-t border-[#333] overflow-y-auto font-mono text-sm space-y-1">
           {logs.length === 0 && <div className="text-gray-600 text-center italic">전투 시작...</div>}
           {logs.map((log, idx) => (
             <div key={idx} className="text-gray-300 animate-fade-in">{log}</div>
           ))}
           <div ref={logsEndRef}></div>
        </div>
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px) rotate(-5deg); }
          75% { transform: translateX(5px) rotate(5deg); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        @keyframes float-up {
          0% { transform: translate(-50%, 0); opacity: 1; }
          100% { transform: translate(-50%, -30px); opacity: 0; }
        }
        .animate-float-up {
          animation: float-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default BattleArena;
