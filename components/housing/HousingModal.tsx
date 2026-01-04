
import React, { useState, useRef, useEffect } from 'react';
import { Character, Housing, PlacedHousingItem } from '../../types/index';
import { HOUSING_THEMES, HOUSING_ITEMS } from '../../data/housingOptions';
import { getInteractionAction } from '../../data/socialInteractions';
import ConfirmModal from '../common/ConfirmModal';
import { 
  X, Save, Home, Monitor, Armchair, Sword, Cat, 
  Flower2, Vault, Tv, Coffee, Target, Bed, Box, Trash2,
  Users, UserPlus, UserMinus, Activity
} from 'lucide-react';

// --- Assets & Helpers ---

const getIcon = (iconName: string, className: string) => {
  const icons: Record<string, React.ReactNode> = {
    'Monitor': <Monitor className={className} />,
    'Armchair': <Armchair className={className} />,
    'Sword': <Sword className={className} />,
    'Cat': <Cat className={className} />,
    'Flower2': <Flower2 className={className} />,
    'Vault': <Vault className={className} />,
    'Tv': <Tv className={className} />,
    'Coffee': <Coffee className={className} />,
    'Target': <Target className={className} />,
    'Bed': <Bed className={className} />,
  };
  return icons[iconName] || <Box className={className} />;
};

const getActionClass = (itemId: string) => {
  switch(itemId) {
    case 'sofa': 
    case 'armchair': return 'animate-sit';
    case 'bed': return 'animate-sleep';
    case 'pc': return 'animate-type';
    case 'weapon': return 'animate-attack';
    case 'target': return 'animate-punch';
    case 'coffee': return 'animate-drink';
    case 'tv': return 'animate-watch';
    case 'cat': 
    case 'plant': return 'animate-bob';
    case 'safe': return 'animate-shake-fast';
    default: return 'animate-bob';
  }
};

// --- Types for Physics ---

interface PhysicsState {
  pos: { x: number, y: number };
  target: { x: number, y: number };
  isWaiting: boolean;
  isInteracting: boolean;
  interactingItemId?: string | null; // Currently interacting item ID
  lastSocialTime: number; // Cooldown for talking to others
  lastFurnitureTime: number; // Cooldown for furniture
}

interface ChatBubbleState {
  charId: string;
  text: string;
  type: 'SOCIAL' | 'FURNITURE';
}

interface Props {
  character: Character;
  allCharacters: Character[]; // Changed to accept full list for invites
  isOpen: boolean;
  onClose: () => void;
  onSave: (charId: string, housing: Housing) => void;
}

const HousingModal: React.FC<Props> = ({ character, allCharacters, isOpen, onClose, onSave }) => {
  // --- State ---
  const [themeId, setThemeId] = useState(character.housing?.themeId || 'default_room');
  const [placedItems, setPlacedItems] = useState<PlacedHousingItem[]>(character.housing?.items || []);
  const [activeTab, setActiveTab] = useState<'THEME' | 'ITEM' | 'VISITORS'>('THEME');
  
  // Visitors State (List of invited characters)
  const [visitors, setVisitors] = useState<Character[]>([]);
  
  // Chat Bubbles (Visual only)
  const [chatBubbles, setChatBubbles] = useState<ChatBubbleState[]>([]);

  // Drag & Drop State
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const roomRef = useRef<HTMLDivElement>(null);
  
  // Alert State
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Direct DOM Access for Performance (Map of CharID -> DivElement)
  const charRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Physics Logic Storage
  const physicsRefs = useRef<Map<string, PhysicsState>>(new Map());
  const animationFrameRef = useRef<number>(0);

  // Refs for Animation Loop (to avoid re-binding useEffect on state change)
  const placedItemsRef = useRef(placedItems);
  const visitorsRef = useRef(visitors);
  const characterRef = useRef(character);

  // Update Refs when state changes
  useEffect(() => { placedItemsRef.current = placedItems; }, [placedItems]);
  useEffect(() => { visitorsRef.current = visitors; }, [visitors]);
  useEffect(() => { characterRef.current = character; }, [character]);

  // Clean up on unmount or close
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const currentTheme = HOUSING_THEMES.find(t => t.id === themeId) || HOUSING_THEMES[0];
  // We construct this for rendering, but physics uses refs
  const allActiveCharacters = [character, ...visitors];

  // --- Handlers ---

  const addItem = (itemId: string) => {
    if (placedItems.length >= 6) {
      setAlertMessage("가구는 최대 6개까지 배치할 수 있습니다!");
      return;
    }
    setPlacedItems(prev => [...prev, {
      uuid: Date.now().toString(),
      itemId,
      x: 45 + (Math.random() * 10),
      y: 45 + (Math.random() * 10)
    }]);
  };

  const removeItem = (uuid: string) => {
    setPlacedItems(prev => prev.filter(i => i.uuid !== uuid));
  };

  const toggleVisitor = (char: Character) => {
    if (visitors.find(v => v.id === char.id)) {
      setVisitors(prev => prev.filter(v => v.id !== char.id));
      // Remove physics state
      physicsRefs.current.delete(char.id);
      // Remove DOM ref
      charRefs.current.delete(char.id);
    } else {
      setVisitors(prev => [...prev, char]);
      // Initialize physics state at random entrance
      physicsRefs.current.set(char.id, {
        pos: { x: 50, y: 90 }, // Enter from bottom
        target: { x: 50, y: 50 },
        isWaiting: false,
        isInteracting: false,
        interactingItemId: null,
        lastSocialTime: Date.now() + 2000, // Initial delay
        lastFurnitureTime: Date.now() + Math.random() * 5000
      });
    }
  };

  // --- Drag Logic ---
  const handleMouseDown = (e: React.MouseEvent, uuid: string) => {
    e.stopPropagation();
    setDraggingId(uuid);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !roomRef.current) return;
    const rect = roomRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPlacedItems(prev => prev.map(item => 
      item.uuid === draggingId 
        ? { ...item, x: Math.max(0, Math.min(90, x)), y: Math.max(0, Math.min(90, y)) } 
        : item
    ));
  };

  const handleMouseUp = () => setDraggingId(null);

  // --- Interaction Trigger Helper ---
  const triggerChat = (charId: string, text: string, type: 'SOCIAL' | 'FURNITURE') => {
    setChatBubbles(prev => {
      // Remove existing bubble for this char if any
      const filtered = prev.filter(b => b.charId !== charId);
      return [...filtered, { charId, text, type }];
    });

    // Auto remove after 3s
    setTimeout(() => {
      setChatBubbles(prev => prev.filter(b => !(b.charId === charId && b.text === text)));
    }, 3000);
  };

  // --- Main Animation Loop ---

  useEffect(() => {
    // Initialize owner physics if not exists
    if (!physicsRefs.current.has(character.id)) {
      physicsRefs.current.set(character.id, {
        pos: { x: 50, y: 50 },
        target: { x: 50, y: 50 },
        isWaiting: false,
        isInteracting: false,
        interactingItemId: null,
        lastSocialTime: Date.now(),
        lastFurnitureTime: Date.now()
      });
    }

    let lastTime = performance.now();
    const SOCIAL_DIST = 10; // % distance
    const SOCIAL_COOLDOWN = 8000; // ms
    const SOCIAL_CHANCE = 0.2; // 20%
    const FURNITURE_DIST = 15;
    const FURNITURE_COOLDOWN = 5000;

    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1); // Cap at 0.1s
      lastTime = time;

      // Use Refs for current data to prevent loop restart
      const currentItems = placedItemsRef.current;
      const currentVisitors = visitorsRef.current;
      const owner = characterRef.current;
      
      const activePhysicsChars = [owner, ...currentVisitors];
      
      activePhysicsChars.forEach(char => {
        let state = physicsRefs.current.get(char.id);
        if (!state) return;

        // 1. Movement Logic
        if (!state.isInteracting && !state.isWaiting) {
          const dx = state.target.x - state.pos.x;
          const dy = state.target.y - state.pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 1) {
            // Arrived
            state.isWaiting = true;
            setTimeout(() => {
               if (!state) return;
               state.target = { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 };
               state.isWaiting = false;
            }, Math.random() * 3000 + 1000);
          } else {
            // Move (Prevent divide by zero)
            if (dist > 0.01) {
              const speed = Math.max(5, Math.min(20, dist * 0.8)); // Adaptive speed
              const moveStep = speed * dt;
              state.pos.x += (dx / dist) * moveStep;
              state.pos.y += (dy / dist) * moveStep;
            }
            
            // DOM Update
            const el = charRefs.current.get(char.id);
            if (el) {
              el.style.left = `${state.pos.x}%`;
              el.style.top = `${state.pos.y}%`;
              // Simple z-index based on Y position (depth)
              el.style.zIndex = `${Math.floor(state.pos.y)}`;
            }
          }
        }

        // 2. Interactions (Only if not already doing something)
        if (!state.isInteracting) {
          const now = Date.now();

          // A. Furniture Interaction
          if (now - state.lastFurnitureTime > FURNITURE_COOLDOWN) {
            for (const item of currentItems) {
              const dx = item.x - state.pos.x;
              const dy = item.y - state.pos.y;
              if (Math.sqrt(dx*dx + dy*dy) < FURNITURE_DIST) {
                if (Math.random() < 0.01) { // Low chance per frame
                  const def = HOUSING_ITEMS.find(d => d.id === item.itemId);
                  if (def) {
                    const text = def.interactions[Math.floor(Math.random() * def.interactions.length)];
                    state.isInteracting = true;
                    state.interactingItemId = item.itemId; // Set Interaction Item
                    state.lastFurnitureTime = now;
                    triggerChat(char.id, text, 'FURNITURE');
                    setTimeout(() => { 
                      if (state) {
                        state.isInteracting = false; 
                        state.interactingItemId = null;
                      }
                    }, 3000);
                  }
                }
              }
            }
          }

          // B. Social Interaction
          if (state.isInteracting) return; // Skip if busy with furniture

          if (now - state.lastSocialTime > SOCIAL_COOLDOWN) {
            for (const other of activePhysicsChars) {
              if (char.id === other.id) continue;
              const otherState = physicsRefs.current.get(other.id);
              if (!otherState) continue;

              const dx = otherState.pos.x - state.pos.x;
              const dy = otherState.pos.y - state.pos.y;
              
              if (Math.sqrt(dx*dx + dy*dy) < SOCIAL_DIST) {
                // Chance check
                if (Math.random() < SOCIAL_CHANCE * dt * 5) { // Scaled by dt to be frame independent approx
                   // Use the new helper function from data/socialInteractions.ts
                   const actionText = getInteractionAction(char, other);
                   
                   // Both chars interact
                   state.isInteracting = true;
                   state.interactingItemId = 'SOCIAL';
                   state.lastSocialTime = now;
                   triggerChat(char.id, actionText, 'SOCIAL');
                   
                   // Simplified: Just lock current char
                   setTimeout(() => { 
                     if (state) {
                       state.isInteracting = false; 
                       state.interactingItemId = null;
                     }
                   }, 3000);
                   break; // Talk to one person at a time
                }
              }
            }
          }
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, []); // Empty dependency array ensures loop doesn't restart on state changes

  const handleSave = () => {
    onSave(character.id, { themeId, items: placedItems });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      
      {/* Alert Modal */}
      <ConfirmModal 
        isOpen={!!alertMessage}
        title="알림"
        message={alertMessage}
        confirmText="확인"
        onClose={() => setAlertMessage(null)}
        onlyOk={true}
      />

      <div className="bg-[#232323] w-full max-w-6xl h-[90vh] rounded-2xl border border-[#404040] shadow-2xl overflow-hidden flex flex-col md:flex-row text-gray-200">
        
        {/* Left: Interactive Room Area */}
        <div 
          ref={roomRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`relative flex-1 transition-all duration-500 ${currentTheme.styleClass} overflow-hidden cursor-crosshair`}
        >
          {/* ... (Existing Room Render Logic - No changes needed) ... */}
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full border border-white/10 text-white text-sm flex items-center gap-2 z-10 select-none">
            <Home className="w-4 h-4" />
            <span>{character.name}의 {currentTheme.name}</span>
            <span className="text-xs text-gray-400 ml-2">손님 {visitors.length}명</span>
          </div>

          {/* Placed Furniture */}
          {placedItems.map((item) => {
            const itemDef = HOUSING_ITEMS.find(i => i.id === item.itemId);
            if (!itemDef) return null;
            return (
              <div 
                key={item.uuid}
                onMouseDown={(e) => handleMouseDown(e, item.uuid)}
                className={`absolute flex flex-col items-center gap-1 group cursor-grab active:cursor-grabbing transition-transform`}
                style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)', zIndex: Math.floor(item.y) }}
              >
                <button 
                  onClick={(e) => { e.stopPropagation(); removeItem(item.uuid); }}
                  className="absolute -top-6 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-50 hover:bg-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <div className="w-14 h-14 md:w-20 md:h-20 bg-white/10 backdrop-blur border border-white/20 rounded-xl flex items-center justify-center shadow-lg hover:border-white/50">
                  {getIcon(itemDef.icon, "w-8 h-8 md:w-10 md:h-10 text-white")}
                </div>
                <span className="text-[10px] text-white/80 bg-black/40 px-2 rounded whitespace-nowrap select-none">{itemDef.name}</span>
              </div>
            );
          })}

          {/* Characters (Owner + Visitors) */}
          {allActiveCharacters.map(char => {
            const bubble = chatBubbles.find(b => b.charId === char.id);
            const isOwner = char.id === character.id;
            
            const physicsState = physicsRefs.current.get(char.id);
            const interactingId = physicsState?.interactingItemId;
            let actionClass = '';

            if (interactingId === 'SOCIAL') {
              actionClass = 'animate-bob';
            } else if (interactingId) {
              actionClass = getActionClass(interactingId);
            } else if (bubble) {
              actionClass = 'animate-shake';
            }
            
            return (
              <div 
                key={char.id}
                ref={(el) => { if(el) charRefs.current.set(char.id, el); }}
                className="absolute flex flex-col items-center transition-none pointer-events-none will-change-[top,left]"
                style={{ 
                  left: `50%`, top: `50%`, transform: 'translate(-50%, -50%)'
                }}
              >
                {/* Chat Bubble */}
                {bubble && (
                  <div className={`absolute -top-16 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap animate-bounce shadow-lg z-[100] border-2
                    ${bubble.type === 'SOCIAL' 
                      ? 'bg-purple-600 text-white border-purple-400 italic'
                      : 'bg-white text-slate-900 border-white'}
                  `}>
                    {bubble.type === 'SOCIAL' && <Activity className="w-3 h-3 inline mr-1 mb-0.5" />}
                    {bubble.text}
                    <div className={`absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 
                      ${bubble.type === 'SOCIAL' ? 'bg-purple-600' : 'bg-white'}`} 
                    />
                  </div>
                )}

                <div className={`w-16 h-16 rounded-full border-4 shadow-xl flex items-center justify-center overflow-hidden relative bg-slate-200 transition-transform
                  ${isOwner ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'border-white'}
                  ${actionClass}
                `}>
                   <img 
                    src={char.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${char.id}`} 
                    alt="avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className={`mt-1 px-2 py-0.5 rounded text-[10px] backdrop-blur text-white flex gap-1
                  ${isOwner ? 'bg-yellow-600/80' : 'bg-black/60'}
                `}>
                  <span>{char.name}</span>
                  {!isOwner && <span className="opacity-70">({char.role})</span>}
                </div>
              </div>
            );
          })}
          
          {placedItems.length === 0 && (
             <div className="absolute inset-0 flex items-center justify-center text-white/30 pointer-events-none select-none">
               <p>우측 패널에서 가구를 배치해보세요.</p>
             </div>
          )}
        </div>

        {/* Right: Controls */}
        <div className="w-full md:w-80 bg-[#2a2a2a] border-l border-[#404040] flex flex-col z-20">
          {/* ... (Existing Right Panel Content - No changes needed) ... */}
          <div className="p-4 border-b border-[#404040] flex justify-between items-center bg-[#1c1c1c]">
            <h2 className="font-bold text-white">공간 관리</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex p-2 gap-1 border-b border-[#404040]">
            <button 
              onClick={() => setActiveTab('THEME')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'THEME' ? 'bg-blue-600 text-white' : 'bg-[#1c1c1c] text-gray-400 hover:bg-[#333]'}`}
            >
              테마
            </button>
            <button 
              onClick={() => setActiveTab('ITEM')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'ITEM' ? 'bg-blue-600 text-white' : 'bg-[#1c1c1c] text-gray-400 hover:bg-[#333]'}`}
            >
              가구 ({placedItems.length})
            </button>
            <button 
              onClick={() => setActiveTab('VISITORS')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${activeTab === 'VISITORS' ? 'bg-blue-600 text-white' : 'bg-[#1c1c1c] text-gray-400 hover:bg-[#333]'}`}
            >
              <Users className="w-3 h-3" /> 초대 ({visitors.length})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {activeTab === 'THEME' && (
              HOUSING_THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setThemeId(theme.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${themeId === theme.id ? 'bg-blue-900/30 border-blue-500' : 'bg-[#1c1c1c] border-transparent hover:bg-[#333]'}`}
                >
                  <div className="text-sm font-bold text-gray-200">{theme.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{theme.description}</div>
                </button>
              ))
            )}
            
            {activeTab === 'ITEM' && (
               <div className="space-y-4">
                <div className="text-xs text-gray-400 px-1">
                  가구를 클릭하여 추가, 드래그하여 이동하세요.
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {HOUSING_ITEMS.map(item => {
                    const count = placedItems.filter(p => p.itemId === item.id).length;
                    return (
                      <button
                        key={item.id}
                        onClick={() => addItem(item.id)}
                        className={`relative p-3 rounded-xl border flex flex-col items-center gap-2 transition-all bg-[#1c1c1c] border-transparent hover:bg-[#333] hover:border-gray-500`}
                      >
                        {getIcon(item.icon, "text-gray-400 w-6 h-6")}
                        <span className="text-xs text-gray-300">{item.name}</span>
                        {count > 0 && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                            {count}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'VISITORS' && (
              <div className="space-y-3">
                <div className="text-xs text-gray-400 px-1">
                  방문할 손님을 초대하세요. 서로 관계에 따라 대화를 나눕니다.
                </div>
                {allCharacters.filter(c => c.id !== character.id).length === 0 ? (
                  <div className="text-center py-10 text-gray-500">초대할 다른 캐릭터가 없습니다.</div>
                ) : (
                  allCharacters.filter(c => c.id !== character.id).map(char => {
                    const isInvited = visitors.some(v => v.id === char.id);
                    return (
                      <button
                        key={char.id}
                        onClick={() => toggleVisitor(char)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${isInvited ? 'bg-green-900/30 border-green-500' : 'bg-[#1c1c1c] border-transparent hover:bg-[#333]'}`}
                      >
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-[#333] overflow-hidden">
                             <img src={char.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${char.id}`} className="w-full h-full object-cover" alt="" />
                           </div>
                           <div className="text-left">
                             <div className={`text-sm font-bold ${isInvited ? 'text-green-300' : 'text-gray-200'}`}>{char.name}</div>
                             <div className="text-[10px] text-gray-500">{char.role}</div>
                           </div>
                         </div>
                         {isInvited ? <UserMinus className="w-4 h-4 text-green-400" /> : <UserPlus className="w-4 h-4 text-gray-400" />}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-[#404040] bg-[#1c1c1c]">
            <button 
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg"
            >
              <Save className="w-4 h-4" />
              변경사항 저장
            </button>
          </div>
        </div>
      </div>
      <style>{`
        /* ... (Same styles as before) ... */
        @keyframes shake {
          0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
          25% { transform: translate(-50%, -50%) rotate(-5deg); }
          75% { transform: translate(-50%, -50%) rotate(5deg); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out infinite;
        }
        .animate-sit {
          transform: translate(-50%, -50%) scale(0.9) translateY(5px);
          transition: transform 0.5s ease-in-out;
        }
        .animate-sleep {
          transform: translate(-50%, -50%) rotate(90deg) scale(0.9);
          transition: transform 0.8s ease-in-out;
        }
        @keyframes type {
          0% { transform: translate(-50%, -50%) translateX(0); }
          25% { transform: translate(-50%, -50%) translateX(-2px); }
          75% { transform: translate(-50%, -50%) translateX(2px); }
          100% { transform: translate(-50%, -50%) translateX(0); }
        }
        .animate-type {
          animation: type 0.1s infinite;
        }
        @keyframes attack {
          0% { transform: translate(-50%, -50%) rotate(0); }
          50% { transform: translate(-50%, -50%) rotate(-20deg) scale(1.1); }
          100% { transform: translate(-50%, -50%) rotate(0); }
        }
        .animate-attack {
          animation: attack 0.5s infinite;
        }
        @keyframes punch {
          0% { transform: translate(-50%, -50%) translateX(0); }
          50% { transform: translate(-50%, -50%) translateX(10px) rotate(5deg); }
          100% { transform: translate(-50%, -50%) translateX(0); }
        }
        .animate-punch {
          animation: punch 0.3s infinite;
        }
        @keyframes drink {
          0% { transform: translate(-50%, -50%) rotate(0); }
          50% { transform: translate(-50%, -50%) rotate(-10deg) translateY(-5px); }
          100% { transform: translate(-50%, -50%) rotate(0); }
        }
        .animate-drink {
          animation: drink 1.5s infinite ease-in-out;
        }
        @keyframes watch {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.05); }
        }
        .animate-watch {
          animation: watch 2s infinite ease-in-out;
        }
        @keyframes bob {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-5px); }
        }
        .animate-bob {
          animation: bob 1s infinite ease-in-out;
        }
        @keyframes shake-fast {
          0%, 100% { transform: translate(-50%, -50%) rotate(0); }
          25% { transform: translate(-50%, -50%) rotate(2deg); }
          75% { transform: translate(-50%, -50%) rotate(-2deg); }
        }
        .animate-shake-fast {
          animation: shake-fast 0.2s infinite;
        }
      `}</style>
    </div>
  );
};

export default HousingModal;
