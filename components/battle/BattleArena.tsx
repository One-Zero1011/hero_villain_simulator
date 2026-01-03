
import React, { useEffect, useState, useRef } from 'react';
import { Character, Role } from '../../types/index';
import { Shield, Skull, Sword, SkipForward, User } from 'lucide-react';
import { calculateBattleDamage, getBattleFlavorText } from '../../utils/battleLogic';

interface Props {
  hero: Character; // Treated as Left Side (Player 1 / Attacker initially)
  villain: Character; // Treated as Right Side (Player 2 / Defender initially)
  onComplete: (winner: Character, loser: Character, logs: string[], winnerHp: number, loserHp: number) => void;
}

type Side = 'left' | 'right';

interface FloatingText {
  id: number;
  side: Side;
  text: string;
  type: 'damage' | 'crit' | 'glancing';
}

const HP_MULTIPLIER = 2;

const BattleArena: React.FC<Props> = ({ hero, villain, onComplete }) => {
  // Stats
  const leftMaxHp = (hero.stats?.stamina || 50) * HP_MULTIPLIER;
  const rightMaxHp = (villain.stats?.stamina || 50) * HP_MULTIPLIER;

  // Initialize with currentHp if available, otherwise max
  const [leftHp, setLeftHp] = useState(hero.currentHp ?? leftMaxHp);
  const [rightHp, setRightHp] = useState(villain.currentHp ?? rightMaxHp);
  
  const [turn, setTurn] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [actingSide, setActingSide] = useState<Side | null>(null); // Who is attacking now
  
  // Visuals
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [hitFlash, setHitFlash] = useState<Side | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);
  
  // Timer Refs for cleanup
  const turnTimerRef = useRef<number | null>(null);
  const visualTimerRef = useRef<number | null>(null);
  const damageTimerRef = useRef<number | null>(null);
  const finishTimerRef = useRef<number | null>(null);
  const textTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (turnTimerRef.current) clearTimeout(turnTimerRef.current);
      if (visualTimerRef.current) clearTimeout(visualTimerRef.current);
      if (damageTimerRef.current) clearTimeout(damageTimerRef.current);
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
      if (textTimerRef.current) clearTimeout(textTimerRef.current);
    };
  }, []);

  // Turn Loop
  useEffect(() => {
    if (isFinished) return;

    turnTimerRef.current = setTimeout(() => {
      handleTurn();
    }, 1500);

    return () => {
      if (turnTimerRef.current) clearTimeout(turnTimerRef.current);
    };
  }, [turn, isFinished]);

  const addFloatingText = (side: Side, text: string, type: 'damage' | 'crit' | 'glancing') => {
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, side, text, type }]);
    
    // We don't track individual text timers, just let them float. 
    // React state update on unmount is safe in modern React (no-op), but good practice to avoid if possible.
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
    }, 800);
  };

  const handleTurn = () => {
    if (isFinished) return;

    const isLeftTurn = turn % 2 === 0;
    const attackerSide = isLeftTurn ? 'left' : 'right';
    const defenderSide = isLeftTurn ? 'right' : 'left';
    
    const attackerChar = isLeftTurn ? hero : villain;
    const defenderChar = isLeftTurn ? villain : hero;

    setActingSide(attackerSide);

    // Calculate Damage
    const result = calculateBattleDamage(attackerChar, defenderChar);
    const damage = result.damage;

    // Visuals Delay
    visualTimerRef.current = setTimeout(() => {
       if (isFinished) return;
       setHitFlash(defenderSide);
       
       let floatType: 'damage' | 'crit' | 'glancing' = 'damage';
       let floatText = `-${damage}`;
       
       if (result.isCrit) {
         floatType = 'crit';
         floatText = `CRIT! -${damage}`;
       } else if (result.isGlancing) {
         floatType = 'glancing';
         floatText = `Glancing -${damage}`;
       }
       
       addFloatingText(defenderSide, floatText, floatType);
    }, 200);

    // Apply Damage & Logic Delay
    damageTimerRef.current = setTimeout(() => {
        if (isFinished) return;

        let newLeftHp = leftHp;
        let newRightHp = rightHp;

        if (isLeftTurn) {
            newRightHp = Math.max(0, rightHp - damage);
            setRightHp(newRightHp);
        } else {
            newLeftHp = Math.max(0, leftHp - damage);
            setLeftHp(newLeftHp);
        }

        const logMsg = getBattleFlavorText(attackerChar.name, defenderChar.name, result);
        setLogs(prev => [...prev, `[Turn ${turn + 1}] ${logMsg}`]);

        // Check Death
        const newDefenderHp = isLeftTurn ? newRightHp : newLeftHp;

        if (newDefenderHp === 0) {
            setIsFinished(true);
            finishTimerRef.current = setTimeout(() => {
                const winnerHp = isLeftTurn ? newLeftHp : newRightHp;
                onComplete(attackerChar, defenderChar, [...logs, `[Turn ${turn + 1}] ${logMsg}`], winnerHp, 0);
            }, 2000);
        } else {
            setTurn(prev => prev + 1);
            setActingSide(null);
            setHitFlash(null);
        }
    }, 500);
  };

  const handleSkip = () => {
    if (isFinished) return;
    setIsFinished(true);
    
    // Clear any pending turn logic
    if (turnTimerRef.current) clearTimeout(turnTimerRef.current);
    if (visualTimerRef.current) clearTimeout(visualTimerRef.current);
    if (damageTimerRef.current) clearTimeout(damageTimerRef.current);

    let currentLeftHp = leftHp;
    let currentRightHp = rightHp;
    let currentTurn = turn;
    let newLogs: string[] = [];

    while (currentLeftHp > 0 && currentRightHp > 0) {
        const isLeftTurn = currentTurn % 2 === 0;
        const attackerChar = isLeftTurn ? hero : villain;
        const defenderChar = isLeftTurn ? villain : hero;
        
        const result = calculateBattleDamage(attackerChar, defenderChar);
        const damage = result.damage;
        const logMsg = getBattleFlavorText(attackerChar.name, defenderChar.name, result);
        
        newLogs.push(`[Turn ${currentTurn + 1}] ${logMsg} (-${damage})`);

        if (isLeftTurn) {
            currentRightHp = Math.max(0, currentRightHp - damage);
        } else {
            currentLeftHp = Math.max(0, currentLeftHp - damage);
        }
        currentTurn++;
    }

    setLeftHp(currentLeftHp);
    setRightHp(currentRightHp);
    setLogs(prev => [...prev, ...newLogs]);
    setTurn(currentTurn);

    const winner = currentLeftHp > 0 ? hero : villain;
    const loser = currentLeftHp > 0 ? villain : hero;
    const winnerHp = currentLeftHp > 0 ? currentLeftHp : currentRightHp;

    finishTimerRef.current = setTimeout(() => {
        onComplete(winner, loser, [...logs, ...newLogs], winnerHp, 0);
    }, 1000);
  };

  // Helper for role styles
  const getRoleColor = (role: Role) => {
    switch (role) {
      case Role.HERO: return 'text-blue-400 border-blue-500 shadow-blue-500/50';
      case Role.VILLAIN: return 'text-red-400 border-red-500 shadow-red-500/50';
      case Role.CIVILIAN: return 'text-green-400 border-green-500 shadow-green-500/50';
      default: return 'text-gray-400 border-gray-500';
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
        case Role.HERO: return <Shield className="w-4 h-4" />;
        case Role.VILLAIN: return <Skull className="w-4 h-4" />;
        case Role.CIVILIAN: return <User className="w-4 h-4" />;
    }
  };

  const leftStyle = getRoleColor(hero.role);
  const rightStyle = getRoleColor(villain.role);

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

          {/* Left Side (Hero Position) */}
          <div className={`relative z-10 flex flex-col items-center w-full md:w-1/3 transition-all duration-300 ${actingSide === 'left' ? 'scale-110 z-20' : 'z-10'}`}>
             <div className={`relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-slate-800 transition-colors duration-200
               ${leftStyle.split(' ').filter(c => c.startsWith('border')).join(' ')} 
               ${hitFlash === 'left' ? 'animate-shake bg-red-500/50' : ''}`}>
                <img src={hero.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${hero.id}`} className="w-full h-full object-cover" />
                {leftHp === 0 && <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-red-500 font-bold text-2xl rotate-12">DEFEAT</div>}
             </div>
             
             {/* Left HP Bar */}
             <div className="w-full mt-4 bg-gray-700 rounded-full h-4 overflow-hidden border border-gray-600 relative">
               <div 
                 className={`h-full transition-all duration-300 ${hero.role === Role.VILLAIN ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-blue-600 to-blue-400'}`}
                 style={{ width: `${(leftHp / leftMaxHp) * 100}%` }}
               ></div>
               <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">
                 {Math.ceil(leftHp)} / {leftMaxHp}
               </span>
             </div>
             
             <div className="mt-2 text-center">
               <div className={`font-bold text-lg flex items-center justify-center gap-2 ${leftStyle.split(' ').find(c => c.startsWith('text-'))}`}>
                 {getRoleIcon(hero.role)} {hero.name}
               </div>
               <div className="text-xs text-gray-400">{hero.role}</div>
             </div>

             {/* Floating Text Left */}
             {floatingTexts.filter(t => t.side === 'left').map(t => (
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

          {/* Right Side (Villain Position) */}
          <div className={`relative z-10 flex flex-col items-center w-full md:w-1/3 transition-all duration-300 ${actingSide === 'right' ? 'scale-110 z-20' : 'z-10'}`}>
             <div className={`relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-slate-800 transition-colors duration-200
               ${rightStyle.split(' ').filter(c => c.startsWith('border')).join(' ')}
               ${hitFlash === 'right' ? 'animate-shake bg-red-500/50' : ''}`}>
                <img src={villain.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${villain.id}`} className="w-full h-full object-cover" />
                {rightHp === 0 && <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-red-500 font-bold text-2xl rotate-12">DEFEAT</div>}
             </div>

             {/* Right HP Bar */}
             <div className="w-full mt-4 bg-gray-700 rounded-full h-4 overflow-hidden border border-gray-600 relative">
               <div 
                 className={`h-full transition-all duration-300 ${villain.role === Role.HERO ? 'bg-gradient-to-r from-blue-600 to-blue-400' : 'bg-gradient-to-r from-red-600 to-red-400'}`} 
                 style={{ width: `${(rightHp / rightMaxHp) * 100}%` }}
               ></div>
               <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">
                 {Math.ceil(rightHp)} / {rightMaxHp}
               </span>
             </div>

             <div className="mt-2 text-center">
               <div className={`font-bold text-lg flex items-center justify-center gap-2 ${rightStyle.split(' ').find(c => c.startsWith('text-'))}`}>
                 {getRoleIcon(villain.role)} {villain.name}
               </div>
               <div className="text-xs text-gray-400">{villain.role}</div>
             </div>

             {/* Floating Text Right */}
             {floatingTexts.filter(t => t.side === 'right').map(t => (
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
