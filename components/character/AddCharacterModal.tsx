import React, { useState, useRef } from 'react';
import { Character, Role, Gender, Stats, Relationship } from '../../types/index';
import { MBTI_TYPES, SUPERPOWERS, RELATIONSHIP_TYPES } from '../../data/options';
import { X, UserPlus, Plus, Trash2, Shield, Skull, User, Image as ImageIcon, Upload, Link as LinkIcon } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (character: Omit<Character, 'id' | 'status' | 'kills' | 'saves' | 'battlesWon'>) => void;
  existingCharacters: Character[];
}

const AddCharacterModal: React.FC<Props> = ({ isOpen, onClose, onAdd, existingCharacters }) => {
  // Basic Info
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>(Role.HERO);
  const [gender, setGender] = useState<Gender>('남성');
  const [age, setAge] = useState(20);
  const [mbti, setMbti] = useState(MBTI_TYPES[0]);
  const [imageUrl, setImageUrl] = useState('');

  // Hero/Villain Specific
  const [superpower, setSuperpower] = useState(SUPERPOWERS[0]);
  const [stats, setStats] = useState<Stats>({
    strength: 50,
    intelligence: 50,
    stamina: 50,
    luck: 50
  });

  // Relationships
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [relTargetId, setRelTargetId] = useState<string>(existingCharacters[0]?.id || '');
  const [relType, setRelType] = useState(RELATIONSHIP_TYPES[0]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddRelationship = () => {
    if (!relTargetId) return;
    const targetChar = existingCharacters.find(c => c.id === relTargetId);
    if (!targetChar) return;

    // Prevent duplicates
    if (relationships.some(r => r.targetId === relTargetId)) {
      alert("이미 관계가 설정된 캐릭터입니다.");
      return;
    }

    setRelationships([...relationships, {
      targetId: relTargetId,
      targetName: targetChar.name,
      type: relType
    }]);
  };

  const removeRelationship = (targetId: string) => {
    setRelationships(relationships.filter(r => r.targetId !== targetId));
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }

    // Calculate average power for compatibility
    const power = role === Role.CIVILIAN 
      ? 5 
      : Math.floor((stats.strength + stats.intelligence + stats.stamina + stats.luck) / 4);

    const newCharacterData: Omit<Character, 'id' | 'status' | 'kills' | 'saves' | 'battlesWon'> = {
      name,
      role,
      gender,
      age,
      mbti,
      imageUrl,
      power,
      relationships,
      ...(role !== Role.CIVILIAN && {
        superpower,
        stats
      })
    };

    onAdd(newCharacterData);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setRole(Role.HERO);
    setGender('남성');
    setAge(20);
    setStats({ strength: 50, intelligence: 50, stamina: 50, luck: 50 });
    setImageUrl('');
    setRelationships([]);
  };

  const handleStatChange = (key: keyof Stats, value: string) => {
    const num = parseInt(value);
    setStats(prev => ({ ...prev, [key]: num }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-2xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-500" /> 캐릭터 생성
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* 1. Image & Basic Info Wrapper */}
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Image Upload Section */}
            <div className="flex-shrink-0 flex flex-col items-center gap-3">
              <div 
                className="w-32 h-32 rounded-xl bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center overflow-hidden relative group cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-2">
                    <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-1 group-hover:text-blue-400" />
                    <span className="text-[10px] text-slate-500">이미지 추가</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                   <Upload className="w-6 h-6 text-white" />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              
              <div className="w-32">
                <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded px-2 py-1">
                  <LinkIcon className="w-3 h-3 text-slate-500" />
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="이미지 URL"
                    className="w-full bg-transparent text-[10px] text-white outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>
            </div>

            {/* Basic Info Inputs */}
            <div className="flex-1 space-y-4">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">기본 정보</h3>
               <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">이름</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
                      placeholder="캐릭터 이름"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">역할</label>
                    <div className="flex gap-2 bg-slate-800 p-1 rounded border border-slate-600">
                      {[Role.HERO, Role.VILLAIN, Role.CIVILIAN].map((r) => (
                        <button
                          key={r}
                          onClick={() => setRole(r)}
                          className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors flex items-center justify-center gap-1 ${
                            role === r 
                              ? r === Role.HERO ? 'bg-blue-600 text-white' : r === Role.VILLAIN ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                              : 'text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {r === Role.HERO && <Shield className="w-3 h-3"/>}
                          {r === Role.VILLAIN && <Skull className="w-3 h-3"/>}
                          {r === Role.CIVILIAN && <User className="w-3 h-3"/>}
                          {r === Role.HERO ? '히어로' : r === Role.VILLAIN ? '빌런' : '시민'}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                     <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">성별</label>
                        <select 
                          value={gender} 
                          onChange={(e) => setGender(e.target.value as Gender)}
                          className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-2 text-white text-sm outline-none"
                        >
                          <option value="남성">남성</option>
                          <option value="여성">여성</option>
                          <option value="기타">기타</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">나이</label>
                        <input
                          type="number"
                          value={age}
                          onChange={(e) => setAge(parseInt(e.target.value))}
                          className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-2 text-white text-sm outline-none"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">MBTI</label>
                        <select 
                          value={mbti} 
                          onChange={(e) => setMbti(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-2 text-white text-sm outline-none"
                        >
                          {MBTI_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* 2. Stats Section (Hero/Villain Only) */}
          {role !== Role.CIVILIAN && (
            <section className="space-y-4 pt-4 border-t border-slate-700">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">능력치 및 스탯</h3>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">초능력</label>
                <select 
                  value={superpower} 
                  onChange={(e) => setSuperpower(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white outline-none"
                >
                  {SUPERPOWERS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {Object.entries(stats).map(([key, val]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs font-medium text-slate-300 capitalize">
                        {key === 'strength' ? '근력' : key === 'intelligence' ? '지능' : key === 'stamina' ? '체력' : '행운'}
                      </label>
                      <span className="text-xs font-mono text-yellow-500">{val}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={val}
                      onChange={(e) => handleStatChange(key as keyof Stats, e.target.value)}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 3. Relationships Section */}
          <section className="space-y-4 pt-4 border-t border-slate-700">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">인간 관계</h3>
            
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div className="flex flex-col md:flex-row gap-2 mb-4">
                <select 
                  value={relTargetId}
                  onChange={(e) => setRelTargetId(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm outline-none"
                  disabled={existingCharacters.length === 0}
                >
                  <option value="">대상 캐릭터 선택...</option>
                  {existingCharacters.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                   <span className="text-slate-500 text-sm whitespace-nowrap">의</span>
                   <select 
                    value={relType}
                    onChange={(e) => setRelType(e.target.value)}
                    className="w-32 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm outline-none"
                  >
                    {RELATIONSHIP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <span className="text-slate-500 text-sm whitespace-nowrap">가 됨</span>
                </div>
                <button 
                  onClick={handleAddRelationship}
                  disabled={!relTargetId || existingCharacters.length === 0}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2 rounded transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Relationship List */}
              <div className="space-y-2">
                {relationships.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-2">설정된 관계가 없습니다.</p>
                ) : (
                  relationships.map((rel, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-900/50 px-3 py-2 rounded border border-slate-700">
                      <span className="text-sm text-slate-300">
                        <span className="text-blue-400 font-bold">{rel.targetName}</span>의 <span className="text-yellow-400 font-bold">{rel.type}</span>
                      </span>
                      <button 
                        onClick={() => removeRelationship(rel.targetId)}
                        className="text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-800">
          <button 
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg"
          >
            캐릭터 등록 완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCharacterModal;