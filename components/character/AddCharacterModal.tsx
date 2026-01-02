
import React, { useState, useRef } from 'react';
import { Character, Role, Gender, Stats, Relationship } from '../../types/index';
import { MBTI_TYPES, SUPERPOWERS, RELATIONSHIP_TYPES, PERSONALITY_TYPES } from '../../data/options';
import { 
  X, UserPlus, Plus, Trash2, Shield, Skull, User, 
  Image as ImageIcon, Upload, Link as LinkIcon, 
  ArrowRight, ArrowLeftRight, Dice5, Eye, EyeOff 
} from 'lucide-react';

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
  const [personality, setPersonality] = useState(''); // 성격 (선택)
  const [imageUrl, setImageUrl] = useState('');

  // Hero Specific
  const [isIdentityRevealed, setIsIdentityRevealed] = useState(false);

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
  const [isMutual, setIsMutual] = useState(false); // Toggle state for relationship direction

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleRandomize = () => {
    const firstNames = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "서", "신", "권", "황", "안", "송", "류", "전"];
    const lastNames = ["철수", "영희", "민수", "지우", "민지", "준호", "서연", "도윤", "하은", "지훈", "현우", "예은", "건우", "수진", "다은", "우진", "민재", "서윤"];
    const heroPrefixes = ["캡틴", "닥터", "슈퍼", "아이언", "블랙", "화이트", "레드", "블루", "마이티", "울트라", "하이퍼", "메가", "섀도우", "스톰"];
    const heroSuffixes = ["맨", "우먼", "보이", "걸", "킹", "퀸", "마스터", "가디언", "슬레이어", "워리어", "헌터", "레인저", "나이트"];
    
    const roles = [Role.HERO, Role.VILLAIN, Role.CIVILIAN];
    const newRole = roles[Math.floor(Math.random() * roles.length)];
    
    let newName = "";
    if (newRole === Role.CIVILIAN) {
      newName = firstNames[Math.floor(Math.random() * firstNames.length)] + lastNames[Math.floor(Math.random() * lastNames.length)];
    } else {
       if (Math.random() < 0.3) {
         // Korean Name
         newName = firstNames[Math.floor(Math.random() * firstNames.length)] + lastNames[Math.floor(Math.random() * lastNames.length)];
       } else {
         // Hero/Villain Name
         newName = heroPrefixes[Math.floor(Math.random() * heroPrefixes.length)] + " " + heroSuffixes[Math.floor(Math.random() * heroSuffixes.length)];
       }
    }

    setName(newName);
    setRole(newRole);
    
    const genders: Gender[] = ['남성', '여성', '기타'];
    setGender(genders[Math.floor(Math.random() * genders.length)]);
    
    setAge(Math.floor(Math.random() * 50) + 15); // 15-65
    setMbti(MBTI_TYPES[Math.floor(Math.random() * MBTI_TYPES.length)]);
    
    // Random Personality
    if (Math.random() < 0.2) {
        setPersonality('');
    } else {
        setPersonality(PERSONALITY_TYPES[Math.floor(Math.random() * PERSONALITY_TYPES.length)]);
    }

    // Identity revealed chance (10%)
    setIsIdentityRevealed(Math.random() < 0.1);

    // DiceBear Avatar
    const seed = Math.random().toString(36).substring(7);
    setImageUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`);

    // Always randomize stats/superpower just in case user switches role later
    setSuperpower(SUPERPOWERS[Math.floor(Math.random() * SUPERPOWERS.length)]);
    setStats({
        strength: Math.floor(Math.random() * 100) + 1,
        intelligence: Math.floor(Math.random() * 100) + 1,
        stamina: Math.floor(Math.random() * 100) + 1,
        luck: Math.floor(Math.random() * 100) + 1
    });

    setRelationships([]);
    setIsMutual(Math.random() < 0.5);
  };

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
      type: relType,
      isMutual: isMutual
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
      personality: personality || undefined, 
      isIdentityRevealed: role === Role.HERO ? isIdentityRevealed : undefined,
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
    setMbti(MBTI_TYPES[0]);
    setPersonality('');
    setIsIdentityRevealed(false);
    setStats({ strength: 50, intelligence: 50, stamina: 50, luck: 50 });
    setImageUrl('');
    setRelationships([]);
    setIsMutual(false);
  };

  const handleStatChange = (key: keyof Stats, value: string) => {
    const num = parseInt(value);
    setStats(prev => ({ ...prev, [key]: num }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#232323] w-full max-w-2xl max-h-[90vh] rounded-2xl border border-[#333333] shadow-2xl flex flex-col overflow-hidden text-gray-200">
        
        {/* Header */}
        <div className="p-4 border-b border-[#333333] flex justify-between items-center bg-[#1c1c1c]">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-500" /> 캐릭터 생성
            </h2>
            <button 
              onClick={handleRandomize}
              className="flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold transition-all shadow-lg hover:scale-105 active:scale-95"
              title="모든 정보 랜덤 생성"
            >
              <Dice5 className="w-3 h-3" />
              랜덤
            </button>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
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
                className="w-32 h-32 rounded-xl bg-[#2a2a2a] border-2 border-dashed border-[#404040] flex items-center justify-center overflow-hidden relative group cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-2">
                    <ImageIcon className="w-8 h-8 text-gray-500 mx-auto mb-1 group-hover:text-blue-400" />
                    <span className="text-[10px] text-gray-500">이미지 추가</span>
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
                <div className="flex items-center gap-1 bg-[#2a2a2a] border border-[#404040] rounded px-2 py-1">
                  <LinkIcon className="w-3 h-3 text-gray-500" />
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="이미지 URL"
                    className="w-full bg-transparent text-[10px] text-white outline-none placeholder:text-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Basic Info Inputs */}
            <div className="flex-1 space-y-4">
               <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">기본 정보</h3>
               <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">이름</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#2a2a2a] border border-[#404040] rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
                      placeholder="예: 아이언 킴"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">역할</label>
                    <div className="flex gap-2 bg-[#2a2a2a] p-1 rounded border border-[#404040]">
                      {[Role.HERO, Role.VILLAIN, Role.CIVILIAN].map((r) => (
                        <button
                          key={r}
                          onClick={() => setRole(r)}
                          className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors flex items-center justify-center gap-1 ${
                            role === r 
                              ? r === Role.HERO ? 'bg-blue-600 text-white' : r === Role.VILLAIN ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                              : 'text-gray-400 hover:bg-[#333333]'
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
                  
                  {role === Role.HERO && (
                    <div className="flex items-center gap-2 bg-[#2a2a2a] border border-[#404040] p-2 rounded cursor-pointer" onClick={() => setIsIdentityRevealed(!isIdentityRevealed)}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${isIdentityRevealed ? 'bg-blue-500 border-blue-500' : 'border-gray-500'}`}>
                        {isIdentityRevealed && <div className="w-2 h-2 bg-white rounded-sm" />}
                      </div>
                      <span className={`text-xs ${isIdentityRevealed ? 'text-blue-300' : 'text-gray-400'}`}>
                        {isIdentityRevealed ? '대중에게 정체가 알려짐 (공인)' : '비밀 신분 유지 (정체 숨김)'}
                      </span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2">
                     <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">성별</label>
                        <select 
                          value={gender} 
                          onChange={(e) => setGender(e.target.value as Gender)}
                          className="w-full bg-[#2a2a2a] border border-[#404040] rounded px-2 py-2 text-white text-sm outline-none"
                        >
                          <option value="남성">남성</option>
                          <option value="여성">여성</option>
                          <option value="기타">기타</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">나이</label>
                        <input
                          type="number"
                          value={age}
                          onChange={(e) => setAge(parseInt(e.target.value))}
                          className="w-full bg-[#2a2a2a] border border-[#404040] rounded px-2 py-2 text-white text-sm outline-none"
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                     <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">MBTI</label>
                        <select 
                          value={mbti} 
                          onChange={(e) => setMbti(e.target.value)}
                          className="w-full bg-[#2a2a2a] border border-[#404040] rounded px-2 py-2 text-white text-sm outline-none"
                        >
                          {MBTI_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">성격 (선택)</label>
                        <select 
                          value={personality} 
                          onChange={(e) => setPersonality(e.target.value)}
                          className="w-full bg-[#2a2a2a] border border-[#404040] rounded px-2 py-2 text-white text-sm outline-none"
                        >
                          <option value="">선택 안 함</option>
                          {PERSONALITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* 2. Stats Section (Hero/Villain Only) */}
          {role !== Role.CIVILIAN && (
            <section className="space-y-4 pt-4 border-t border-[#333333]">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">능력치 및 스탯</h3>
              
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">초능력</label>
                <select 
                  value={superpower} 
                  onChange={(e) => setSuperpower(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-[#404040] rounded px-3 py-2 text-white outline-none"
                >
                  {SUPERPOWERS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {Object.entries(stats).map(([key, val]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs font-medium text-gray-300 capitalize">
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
                      className="w-full h-2 bg-[#333333] rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 3. Relationships Section */}
          <section className="space-y-4 pt-4 border-t border-[#333333]">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">인간 관계</h3>
            
            <div className="bg-[#2a2a2a] p-4 rounded-xl border border-[#333333]">
              
              {/* Relationship Input Row */}
              <div className="flex flex-col gap-3 mb-4">
                <div className="flex items-center gap-2 w-full">
                  {/* Current Character (You) */}
                  <div className="flex-1 bg-[#1c1c1c] rounded px-3 py-2 text-center border border-[#404040]">
                    <span className="text-sm font-bold text-white truncate block">
                      {name || "나 (현재 캐릭터)"}
                    </span>
                  </div>

                  {/* Direction Toggle Button */}
                  <button 
                    onClick={() => setIsMutual(!isMutual)}
                    className="p-2 bg-[#1c1c1c] hover:bg-blue-600 rounded-full transition-colors group flex-shrink-0 border border-[#404040] hover:border-blue-500"
                    title={isMutual ? "양방향 관계 (서로)" : "단방향 관계 (내가 상대를)"}
                  >
                    {isMutual ? (
                      <ArrowLeftRight className="w-5 h-5 text-blue-300 group-hover:text-white" />
                    ) : (
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white" />
                    )}
                  </button>

                  {/* Target Character Select */}
                  <select 
                    value={relTargetId}
                    onChange={(e) => setRelTargetId(e.target.value)}
                    className="flex-1 bg-[#1c1c1c] border border-[#404040] rounded px-3 py-2 text-white text-sm outline-none"
                    disabled={existingCharacters.length === 0}
                  >
                    <option value="">대상 선택...</option>
                    {existingCharacters.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                    ))}
                  </select>
                </div>
                
                {/* Type & Add Button Row */}
                <div className="flex items-center gap-2">
                   <select 
                    value={relType}
                    onChange={(e) => setRelType(e.target.value)}
                    className="flex-1 bg-[#1c1c1c] border border-[#404040] rounded px-3 py-2 text-white text-sm outline-none"
                  >
                    {RELATIONSHIP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  
                  <button 
                    onClick={handleAddRelationship}
                    disabled={!relTargetId || existingCharacters.length === 0}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded font-bold text-sm transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    추가
                  </button>
                </div>
              </div>

              {/* Relationship List */}
              <div className="space-y-2">
                {relationships.length === 0 ? (
                  <div className="text-center py-4 text-gray-600 text-xs border border-dashed border-[#404040] rounded-lg">
                    설정된 관계가 없습니다.
                  </div>
                ) : (
                  relationships.map((rel, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-[#1c1c1c] px-3 py-2 rounded border border-[#404040]">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <span className="font-bold text-gray-200">{name || '나'}</span>
                        
                        {rel.isMutual ? (
                          <ArrowLeftRight className="w-3 h-3 text-blue-400" />
                        ) : (
                          <ArrowRight className="w-3 h-3 text-gray-500" />
                        )}

                        <span className="font-bold text-blue-400">{rel.targetName}</span>
                        <span className="text-gray-500 mx-1">|</span>
                        <span className="text-yellow-400 font-bold">{rel.type}</span>
                      </div>
                      <button 
                        onClick={() => removeRelationship(rel.targetId)}
                        className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-[#2a2a2a]"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#333333] bg-[#1c1c1c]">
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
