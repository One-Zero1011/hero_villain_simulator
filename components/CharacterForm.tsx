import React, { useState } from 'react';
import { Role } from '../types';

interface Props {
  onAdd: (name: string, role: Role, power: number) => void;
}

const CharacterForm: React.FC<Props> = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>(Role.HERO);
  const [power, setPower] = useState(50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name, role, power);
    setName('');
    // Randomize power slightly for the next input for convenience
    setPower(Math.floor(Math.random() * 80) + 10);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
      <h2 className="text-lg font-bold mb-4 text-white">캐릭터 추가</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            placeholder="예: 아이언 킴"
            maxLength={12}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">역할</label>
          <div className="flex gap-2 p-1 bg-slate-700 rounded">
            {(Object.values(Role) as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-1.5 text-sm rounded transition-colors ${
                  role === r
                    ? r === Role.HERO ? 'bg-blue-600 text-white' : r === Role.VILLAIN ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r === Role.HERO ? '히어로' : r === Role.VILLAIN ? '빌런' : '시민'}
              </button>
            ))}
          </div>
        </div>

        {role !== Role.CIVILIAN && (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">전투력 (1-100)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="100"
                value={power}
                onChange={(e) => setPower(parseInt(e.target.value))}
                className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="w-8 text-right font-mono text-yellow-500">{power}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors mt-2"
        >
          등록하기
        </button>
      </div>
    </form>
  );
};

export default CharacterForm;