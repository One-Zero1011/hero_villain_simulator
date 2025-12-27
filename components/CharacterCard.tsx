import React from 'react';
import { Character, Role, Status } from '../types';
import { Shield, Skull, User, Activity, Ban, Home } from 'lucide-react';

interface Props {
  character: Character;
  onDelete: (id: string) => void;
  onOpenHousing: (char: Character) => void;
}

const CharacterCard: React.FC<Props> = ({ character, onDelete, onOpenHousing }) => {
  const isDead = character.status === Status.DEAD;

  const getRoleStyle = (role: Role) => {
    switch (role) {
      case Role.HERO: 
        return {
          wrapper: 'bg-slate-800 border-l-4 border-blue-500',
          badge: 'bg-blue-900/50 text-blue-200 border border-blue-700',
          icon: <Shield className="w-4 h-4 text-blue-400" />
        };
      case Role.VILLAIN: 
        return {
          wrapper: 'bg-slate-800 border-l-4 border-red-500',
          badge: 'bg-red-900/50 text-red-200 border border-red-700',
          icon: <Skull className="w-4 h-4 text-red-400" />
        };
      case Role.CIVILIAN: 
        return {
          wrapper: 'bg-slate-800 border-l-4 border-green-500',
          badge: 'bg-green-900/50 text-green-200 border border-green-700',
          icon: <User className="w-4 h-4 text-green-400" />
        };
      default: return { wrapper: '', badge: '', icon: null };
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.NORMAL: return 'text-emerald-400';
      case Status.INJURED: return 'text-orange-400 font-bold';
      case Status.DEAD: return 'text-slate-500 line-through';
      case Status.RETIRED: return 'text-yellow-400';
      default: return 'text-white';
    }
  };

  const styles = getRoleStyle(character.role);

  return (
    <div className={`relative p-4 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${styles.wrapper} ${isDead ? 'opacity-60 grayscale' : ''}`}>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-full bg-slate-700/50`}>
            {styles.icon}
          </div>
          <div>
            <h3 className="font-bold text-slate-100 leading-tight">{character.name}</h3>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${styles.badge} inline-block mt-1`}>
              {character.role === Role.HERO ? 'HERO' : character.role === Role.VILLAIN ? 'VILLAIN' : 'CIVILIAN'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Activity className="w-3 h-3 text-slate-500" />
          <span className={`text-xs ${getStatusColor(character.status)}`}>{character.status}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-900/50 p-2 rounded text-xs">
        {character.role !== Role.CIVILIAN && (
          <div className="flex flex-col">
            <span className="text-slate-500">전투력</span>
            <span className="font-mono text-yellow-500 font-bold text-sm">{character.power}</span>
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-slate-500">
            {character.role === Role.HERO ? '구조/승리' : character.role === Role.VILLAIN ? '처치/승리' : '생존일'}
          </span>
          <span className="font-mono text-slate-300 font-bold text-sm">
            {character.role === Role.HERO && `${character.saves} / ${character.battlesWon}`}
            {character.role === Role.VILLAIN && `${character.kills} / ${character.battlesWon}`}
            {character.role === Role.CIVILIAN && `-`}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between border-t border-slate-700 pt-3">
        {!isDead && (
          <button 
            onClick={() => onOpenHousing(character)}
            className="px-3 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors flex items-center gap-1 border border-slate-600"
            title="본거지 꾸미기"
          >
            <Home className="w-3 h-3" /> 본거지
          </button>
        )}
        
        <button 
          onClick={() => onDelete(character.id)}
          className={`px-3 py-1 text-xs font-medium text-slate-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors flex items-center gap-1 ${isDead ? 'ml-auto' : ''}`}
          title="세계관에서 제거"
        >
          <Ban className="w-3 h-3" /> {isDead ? '기록 말소' : '은퇴'}
        </button>
      </div>
      
      {isDead && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none rounded-lg">
          <span className="text-2xl font-bold text-red-500 -rotate-12 border-4 border-red-500 px-4 py-1 opacity-80">DEAD</span>
        </div>
      )}
    </div>
  );
};

export default CharacterCard;