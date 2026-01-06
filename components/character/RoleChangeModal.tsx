
import React from 'react';
import { Character, Role } from '../../types/index';
import { Skull, Shield, AlertTriangle, ArrowRight } from 'lucide-react';

export type RoleChangeType = 'FALL' | 'REDEEM';

interface Props {
  character: Character;
  type: RoleChangeType;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const RoleChangeModal: React.FC<Props> = ({ character, type, isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  const isFall = type === 'FALL'; // Hero -> Villain
  
  const title = isFall ? "흑화의 징조" : "갱생의 빛";
  const icon = isFall ? <Skull className="w-10 h-10 text-red-500 animate-pulse" /> : <Shield className="w-10 h-10 text-blue-500 animate-pulse" />;
  const borderColor = isFall ? "border-red-600" : "border-blue-600";
  const bgGradient = isFall ? "from-gray-900 to-red-950" : "from-gray-900 to-blue-950";
  
  const flavorText = isFall 
    ? `"${character.name}"의 정의가 흔들리고 있습니다.\n\n끝없는 희생과 고통 속에서, 그들은 '진정한 평화는 강력한 통제에서 온다'는 위험한 생각에 사로잡히기 시작했습니다.\n\n심연이 그를 응시하고 있습니다. 이 타락을 받아들이시겠습니까?`
    : `"${character.name}"의 마음속에 작은 빛이 피어오릅니다.\n\n누군가와의 깊은 유대가 그들의 얼어붙은 심장을 녹이고 있습니다. 과거의 죄를 씻고 새로운 길을 걸을 기회가 찾아왔습니다.\n\n그를 빛의 길로 인도하시겠습니까?`;

  const confirmText = isFall ? "타락을 받아들인다 (빌런으로 전향)" : "손을 내민다 (히어로로 전향)";
  const cancelText = isFall ? "아직은... 이성을 붙잡는다" : "아직은... 죄책감이 무겁다";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-lg rounded-2xl border-2 ${borderColor} shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden bg-gradient-to-br ${bgGradient} text-gray-100`}>
        
        {/* Header Visual */}
        <div className="p-8 flex flex-col items-center justify-center gap-4 text-center border-b border-white/10 relative overflow-hidden">
          {/* Background Effect */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/noise-lines.png')]"></div>
          
          <div className="relative z-10 flex items-center justify-center gap-6">
             <div className="relative">
               <div className={`w-20 h-20 rounded-full border-4 overflow-hidden shadow-lg ${isFall ? 'border-blue-500 grayscale' : 'border-red-500 grayscale'}`}>
                 <img src={character.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${character.id}`} className="w-full h-full object-cover" alt="" />
               </div>
               <div className="absolute -bottom-2 -right-2 bg-black/80 rounded-full p-1 border border-white/20">
                 {isFall ? <Shield className="w-4 h-4 text-blue-500" /> : <Skull className="w-4 h-4 text-red-500" />}
               </div>
             </div>

             <ArrowRight className="w-8 h-8 text-gray-400 animate-pulse" />

             <div className="relative">
               <div className={`w-20 h-20 rounded-full border-4 overflow-hidden shadow-lg ${isFall ? 'border-red-500' : 'border-blue-500'}`}>
                 <img src={character.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${character.id}`} className="w-full h-full object-cover" alt="" />
               </div>
               <div className="absolute -bottom-2 -right-2 bg-black/80 rounded-full p-1 border border-white/20">
                 {isFall ? <Skull className="w-4 h-4 text-red-500" /> : <Shield className="w-4 h-4 text-blue-500" />}
               </div>
             </div>
          </div>
          
          <h2 className="text-2xl font-bold mt-2 flex items-center gap-2 relative z-10">
            {icon}
            {title}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-center">
            <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium text-gray-200">
              {flavorText}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={onConfirm}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg flex items-center justify-center gap-2
                ${isFall 
                  ? 'bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white border border-red-500' 
                  : 'bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white border border-blue-500'
                }`}
            >
              {isFall ? <Skull className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
              {confirmText}
            </button>
            
            <button 
              onClick={onCancel}
              className="w-full py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleChangeModal;
