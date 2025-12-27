import React, { useEffect, useState, useRef } from 'react';
import { Character, Role } from '../types';
import { Shield, Skull, Sword, Zap, HeartPulse, Flame, AlertTriangle } from 'lucide-react';

interface Props {
  hero: Character;
  villain: Character;
  onComplete: (winner: Character, loser: Character, logs: string[]) => void;
}

interface FloatingText {
  id: number;
  role: Role;
  text: string;
  type: 'damage' | 'crit';
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

  useEffect(() => {
    if (isFinished) return;

    const battleInterval = setInterval(() => {
      handleTurn();
    }, 1500); // Slightly slower to allow animations to play out

    return () => clearInterval(battleInterval);
  }, [turn, isFinished]);

  const addFloatingText = (role: Role, text: string, type: 'damage' | 'crit') => {
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, role, text, type }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
    }, 800);
  };

  const handleTurn = () => {
    // Determine order: Hero acts on even turns, Villain on odd
    const isHeroTurn = turn % 2 === 0;
    const attackerRole = isHeroTurn ? Role.HERO : Role.VILLAIN;
    const defenderRole = isHeroTurn ? Role.VILLAIN : Role.HERO;

    setAttacker(attackerRole);

    const attackerChar = isHeroTurn ? hero : villain;
    // const defenderChar = isHeroTurn ? villain : hero; 
    
    // Damage Calc
    const isCrit = Math.random() < (attackerChar.power / 150); // Increased crit chance slightly for visuals
    const baseDamage = Math.floor(attackerChar.power / 6) + Math.floor(Math.random() * 10);
    const damage = isCrit ? Math.floor(baseDamage * 1.5) : baseDamage;

    // Trigger Visuals
    setTimeout(() => {
       setHitFlash(defenderRole);
       addFloatingText(defenderRole, isCrit ? `${damage}!` : `${damage}`, isCrit ? 'crit' : 'damage');
       setTimeout(() => setHitFlash(null), 200);
    }, 200);

    const logMsg = isCrit 
      ? `💥 CRITICAL! ${attackerChar.name}이(가) ${damage}의 치명적인 피해를 입혔습니다!`
      : `⚔️ ${attackerChar.name}의 공격! ${damage}의 피해를 입혔습니다.`;

    setLogs(prev => [...prev, logMsg]);

    if (isHeroTurn) {
      setVillainHp(prev => {
        const newHp = Math.max(0, prev - damage);
        if (newHp === 0) finishBattle(hero, villain);
        return newHp;
      });
    } else {
      setHeroHp(prev => {
        const newHp = Math.max(0, prev - damage);
        if (newHp === 0) finishBattle(villain, hero);
        return newHp;
      });
    }

    setTurn(prev => prev + 1);
  };

  const finishBattle = (winner: Character, loser: Character) => {
    setIsFinished(true);
    setAttacker(null);
    setLogs(prev => [...prev, `🏆 ${winner.name} 승리!`]);
    
    setTimeout(() => {
      onComplete(winner, loser, logs);
    }, 2500); 
  };

  const getHpColor = (current: number) => {
    if (current > 50) return 'bg-green-500 shadow-[0_0_10px_lime]';
    if (current > 20) return 'bg-yellow-500 shadow-[0_0_10px_yellow]';
    return 'bg-red-600 shadow-[0_0_10px_red] animate-pulse';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col relative min-h-[600px]">
        
        {/* Battle Header */}
        <div className="absolute top-0 w-full p-4 flex justify-between items-center bg-gradient-to-b from-black/80 via-black/40 to-transparent z-20 pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded animate-pulse shadow-lg shadow-red-500/50">LIVE COMBAT</div>
          </div>
          <div className="text-slate-200 font-mono text-lg font-bold drop-shadow-md">TURN {Math.floor(turn / 2) + 1}</div>
        </div>

        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0">
           {/* Base Image */}
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
           {/* Animated Overlay */}
           <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-black/60 mix-blend-overlay animate-pulse-slow"></div>
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#0f172a_100%)]"></div>
        </div>

        {/* Fighters Stage */}
        <div className="flex-1 flex items-center justify-between px-8 md:px-20 py-12 relative z-10">
          
          {/* Hero Side */}
          <div className="relative flex flex-col items-center">
            {/* HP Bar */}
            <div className="w-56 mb-6 bg-slate-900/90 p-3 rounded-xl border border-slate-600 shadow-2xl backdrop-blur-md">
              <div className="flex justify-between text-sm text-blue-200 mb-2 font-bold tracking-wide">
                <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {hero.name}</span>
                <span className="font-mono">{heroHp}%</span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative">
                <div className={`h-full transition-all duration-300 ${getHpColor(heroHp)}`} style={{ width: `${heroHp}%` }}></div>
                {/* Shine effect on HP bar */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
              </div>
              {/* Status Icons */}
              <div className="flex gap-2 mt-2 h-4">
                 {heroHp < 30 && <HeartPulse className="w-4 h-4 text-red-500 animate-pulse" />}
                 {hero.power > 80 && <Zap className="w-4 h-4 text-yellow-400" />}
                 {turn > 5 && <Flame className="w-4 h-4 text-orange-500" />}
              </div>
            </div>

            {/* Character Sprite Area */}
            <div className={`relative transition-all duration-200 
              ${attacker === Role.HERO ? 'translate-x-12 scale-110 z-20' : ''} 
              ${hitFlash === Role.HERO ? 'brightness-200 saturate-0 animate-shake text-red-500' : ''}
            `}>
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-900 to-slate-900 border-4 border-blue-500 flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.6)] relative overflow-hidden group">
                 <Shield className={`w-20 h-20 text-blue-300 transition-transform duration-500 ${attacker === Role.HERO ? 'scale-125' : ''}`} />
                 <div className="absolute inset-0 bg-blue-500/20 mix-blend-overlay"></div>
              </div>
              
              {/* Floating Damage Text */}
              {floatingTexts.filter(ft => ft.role === Role.HERO).map(ft => (
                <div key={ft.id} className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full font-black text-4xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] animate-float-up pointer-events-none whitespace-nowrap z-50 ${ft.type === 'crit' ? 'text-yellow-400 scale-125' : 'text-white'}`}>
                  {ft.text}
                </div>
              ))}
            </div>
            
            {/* Floor Shadow */}
            <div className="w-32 h-4 bg-black/60 rounded-[100%] blur-md mt-4"></div>
          </div>

          {/* VS Center */}
          <div className="flex flex-col items-center justify-center">
             <div className="relative">
               <Sword className="w-16 h-16 text-slate-500/50 animate-pulse" />
               {isFinished && <div className="absolute inset-0 flex items-center justify-center text-4xl">🏁</div>}
             </div>
          </div>

          {/* Villain Side */}
          <div className="relative flex flex-col items-center">
            {/* HP Bar */}
            <div className="w-56 mb-6 bg-slate-900/90 p-3 rounded-xl border border-slate-600 shadow-2xl backdrop-blur-md">
              <div className="flex justify-between text-sm text-red-200 mb-2 font-bold tracking-wide">
                <span className="flex items-center gap-1"><Skull className="w-3 h-3" /> {villain.name}</span>
                <span className="font-mono">{villainHp}%</span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative">
                <div className={`h-full transition-all duration-300 ${getHpColor(villainHp)}`} style={{ width: `${villainHp}%` }}></div>
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
              </div>
              {/* Status Icons */}
              <div className="flex gap-2 mt-2 h-4 justify-end">
                 {villainHp < 30 && <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />}
                 {villain.power > 80 && <Zap className="w-4 h-4 text-purple-400" />}
                 {turn > 5 && <Flame className="w-4 h-4 text-orange-500" />}
              </div>
            </div>

            {/* Character Sprite Area */}
            <div className={`relative transition-all duration-200 
              ${attacker === Role.VILLAIN ? '-translate-x-12 scale-110 z-20' : ''} 
              ${hitFlash === Role.VILLAIN ? 'brightness-200 saturate-0 animate-shake text-red-500' : ''}
            `}>
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-red-900 to-slate-900 border-4 border-red-500 flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.6)] relative overflow-hidden">
                 <Skull className={`w-20 h-20 text-red-300 transition-transform duration-500 ${attacker === Role.VILLAIN ? 'scale-125' : ''}`} />
                 <div className="absolute inset-0 bg-red-500/20 mix-blend-overlay"></div>
              </div>

               {/* Floating Damage Text */}
               {floatingTexts.filter(ft => ft.role === Role.VILLAIN).map(ft => (
                <div key={ft.id} className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full font-black text-4xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] animate-float-up pointer-events-none whitespace-nowrap z-50 ${ft.type === 'crit' ? 'text-yellow-400 scale-125' : 'text-white'}`}>
                  {ft.text}
                </div>
              ))}
            </div>

            {/* Floor Shadow */}
            <div className="w-32 h-4 bg-black/60 rounded-[100%] blur-md mt-4"></div>
          </div>
        </div>

        {/* Combat Log */}
        <div className="h-48 bg-black/80 border-t border-slate-700/50 p-4 font-mono text-sm overflow-y-auto log-scroll relative z-20 backdrop-blur-md">
          {logs.map((log, idx) => (
            <div key={idx} className="mb-1 animate-fade-in text-slate-300 border-b border-slate-800/50 pb-1 last:border-0">
              <span className="text-slate-500 mr-2 text-xs">[{idx + 1}]</span>
              {log}
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px) rotate(-5deg); }
          40% { transform: translateX(10px) rotate(5deg); }
          60% { transform: translateX(-10px) rotate(-5deg); }
          80% { transform: translateX(10px) rotate(5deg); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes float-up {
          0% { transform: translate(-50%, 0) scale(0.5); opacity: 0; }
          20% { transform: translate(-50%, -20px) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -60px) scale(1); opacity: 0; }
        }
        .animate-float-up {
          animation: float-up 0.8s ease-out forwards;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.6; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default BattleArena;