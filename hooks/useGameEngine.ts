
import { useState, useCallback, useEffect } from 'react';
import { 
  Character, Role, Status, LogEntry, FactionResources, 
  GameSettings, Housing, Item, SaveData, SaveType, BattleResult, Quest, QuestType 
} from '../types/index';
import { processDailyEvents } from '../services/simulationService';
import { processQuestDaily } from '../services/questService';
import { GAME_ITEMS } from '../data/items';
import { generateId } from '../utils/helpers';

// Helper to get initial resources
const getInitialResources = (): Record<Role, FactionResources> => ({
  [Role.HERO]: { money: 1000, inventory: [] },
  [Role.VILLAIN]: { money: 1000, inventory: [] },
  [Role.CIVILIAN]: { money: 1000, inventory: [] }
});

const DEFAULT_SETTINGS: GameSettings = {
  preventMinorAdultDating: true,
  allowFamilyDating: false,
  pureLoveMode: true,
  allowSameSex: false,
  allowHetero: true,
  globalNoRomance: false,
  debugMode: false
};

export const useGameEngine = () => {
  const [day, setDay] = useState(1);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [factionResources, setFactionResources] = useState<Record<Role, FactionResources>>(getInitialResources());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]); // Quest State
  
  // UI State
  const [currentBattle, setCurrentBattle] = useState<{ hero: Character, villain: Character } | null>(null);
  const [housingModalChar, setHousingModalChar] = useState<Character | null>(null);
  const [isAddCharModalOpen, setIsAddCharModalOpen] = useState(false);
  const [isQuestBoardOpen, setIsQuestBoardOpen] = useState(false); // Quest Modal State
  const [roleChangeCandidate, setRoleChangeCandidate] = useState<{ character: Character, type: 'FALL' | 'REDEEM' } | null>(null);
  
  const [gameSettings, setGameSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

  const addLog = (message: string, type: LogEntry['type'] = 'INFO', statChanges?: { hp?: number, sanity?: number }) => {
    setLogs(prev => [...prev, {
      id: generateId(),
      day,
      message,
      type,
      timestamp: Date.now(),
      statChanges
    }]);
  };

  // --- Handlers ---

  const handleAddCharacter = (newCharData: Omit<Character, 'id' | 'status' | 'kills' | 'saves' | 'battlesWon'>) => {
    const newChar: Character = {
      ...newCharData,
      id: generateId(),
      status: Status.NORMAL,
      kills: 0,
      saves: 0,
      battlesWon: 0,
      // Initialize calculated stats if needed or ensure they are present
      currentHp: (newCharData.stats?.stamina || 50) * 2,
      currentSanity: (newCharData.stats?.intelligence || 50) * 2
    };
    setCharacters(prev => [...prev, newChar]);
    addLog(`${newChar.name}이(가) 세계관에 합류했습니다.`, 'INFO');
  };

  const handleUpdateCharacter = (updatedChar: Character) => {
    setCharacters(prev => prev.map(c => c.id === updatedChar.id ? updatedChar : c));
    addLog(`${updatedChar.name}의 정보가 수정되었습니다.`, 'INFO');
  };

  const handleDeleteCharacter = (id: string) => {
    const char = characters.find(c => c.id === id);
    if (char) {
      setCharacters(prev => prev.filter(c => c.id !== id));
      addLog(`${char.name}이(가) 세계관에서 떠났습니다.`, 'INFO');
    }
  };

  const handlePostQuest = (type: QuestType, targetId: string, reward: number, duration?: number) => {
    const target = characters.find(c => c.id === targetId);
    if (!target) return;

    const newQuest: Quest = {
      id: generateId(),
      type,
      targetId,
      targetName: target.name,
      reward,
      status: 'OPEN',
      createdAt: day,
      duration
    };

    setQuests(prev => [...prev, newQuest]);
    addLog(`📋 [의뢰] 새로운 ${type === 'SUBJUGATION' ? '토벌' : type === 'ESCORT' ? '호위' : '암살'} 의뢰가 게시판에 등록되었습니다. (대상: ${target.name})`, 'INFO');
  };

  const handleDeleteQuest = (questId: string) => {
    setQuests(prev => prev.filter(q => q.id !== questId));
  };

  const checkForRoleChanges = (chars: Character[], currentDay: number) => {
    // 1% chance to trigger check per eligible character
    const candidate = chars.find(c => {
      if (c.status === Status.DEAD || (c.lastRoleCheckDay && currentDay - c.lastRoleCheckDay < 7)) return false;
      
      if (Math.random() > 0.01) return false;

      const maxSanity = (c.stats?.intelligence || 50) * 2;
      const currentSanity = c.currentSanity ?? maxSanity;
      const sanityPercent = (currentSanity / maxSanity) * 100;

      if (c.role === Role.HERO && sanityPercent <= 20) {
        return true;
      }

      if (c.role === Role.VILLAIN && sanityPercent >= 80) {
        const hasHeroBond = c.relationships.some(r => {
          const target = chars.find(t => t.id === r.targetId);
          return target?.role === Role.HERO && (r.affinity || 0) >= 50;
        });
        if (hasHeroBond) return true;
      }

      return false;
    });

    if (candidate) {
      const type = candidate.role === Role.HERO ? 'FALL' : 'REDEEM';
      setRoleChangeCandidate({ character: candidate, type });
      setCharacters(prev => prev.map(c => c.id === candidate.id ? { ...c, lastRoleCheckDay: currentDay } : c));
    }
  };

  const handleNextDay = () => {
    // 1. Process Quests (Acceptance & Progress)
    const questResult = processQuestDaily(quests, characters, day + 1);
    
    // Apply Quest Results (Rewards)
    if (questResult.finishedQuests.length > 0) {
        setFactionResources(prev => {
            const next = { ...prev };
            questResult.finishedQuests.forEach(q => {
               const char = characters.find(c => c.id === q.assignedCharId);
               if (char && q.status === 'COMPLETED') {
                   // Reward goes to faction
                   next[char.role].money += q.reward;
               }
            });
            return next;
        });
    }
    
    // Identify characters occupied by quests to exclude them from general events if needed
    // For now, we'll let them participate in general events too, but battle logic handles quest battles first.
    const busyCharIds = questResult.updatedQuests
      .filter(q => q.status === 'IN_PROGRESS')
      .map(q => q.assignedCharId)
      .filter((id): id is string => !!id);

    // 2. Process Daily Events (Simulation Service)
    const { updatedCharacters, newLogs, income } = processDailyEvents(day, characters, [], gameSettings);
    
    let finalCharacters = updatedCharacters;
    
    // 3. Process Income
    setFactionResources(prev => {
      const next = { ...prev };
      ([Role.HERO, Role.VILLAIN, Role.CIVILIAN] as Role[]).forEach(role => {
        next[role].money += income[role];
      });
      return next;
    });

    // 4. Check for Role Changes (Intervention)
    checkForRoleChanges(finalCharacters, day + 1);

    // 5. Trigger Battle (Quest Priority > Random Chance)
    const activeQuest = questResult.updatedQuests.find(q => 
        q.status === 'IN_PROGRESS' && 
        (q.type === 'SUBJUGATION' || q.type === 'ASSASSINATION')
    );

    if (activeQuest) {
        const attacker = finalCharacters.find(c => c.id === activeQuest.assignedCharId);
        const defender = finalCharacters.find(c => c.id === activeQuest.targetId);
        if (attacker && defender && attacker.status === Status.NORMAL && defender.status !== Status.DEAD) {
             setCurrentBattle({ hero: attacker, villain: defender }); // Note: prop names are hero/villain but logic handles role agnostic
        }
    } else {
        // Random Battle if no quest battle
        const heroes = finalCharacters.filter(c => c.role === Role.HERO && c.status === Status.NORMAL);
        const villains = finalCharacters.filter(c => c.role === Role.VILLAIN && c.status === Status.NORMAL);

        if (heroes.length > 0 && villains.length > 0 && Math.random() < 0.3) {
            const hero = heroes[Math.floor(Math.random() * heroes.length)];
            const villain = villains[Math.floor(Math.random() * villains.length)];
            setCurrentBattle({ hero, villain });
        }
    }

    setCharacters(finalCharacters);
    setQuests(questResult.updatedQuests);
    setLogs(prev => [...prev, ...questResult.questLogs, ...newLogs]);
    setDay(prev => prev + 1);
  };

  const handleRoleChangeDecision = (accepted: boolean) => {
    if (!roleChangeCandidate) return;

    if (accepted) {
      setCharacters(prev => prev.map(c => {
        if (c.id === roleChangeCandidate.character.id) {
          const newRole = roleChangeCandidate.type === 'FALL' ? Role.VILLAIN : Role.HERO;
          return { ...c, role: newRole };
        }
        return c;
      }));
      
      const logMessage = roleChangeCandidate.type === 'FALL' 
        ? `${roleChangeCandidate.character.name}이(가) 정의에 회의감을 느끼고 타락하여 빌런이 되었습니다.`
        : `${roleChangeCandidate.character.name}이(가) 개과천선하여 히어로의 길을 걷기로 했습니다.`;

      addLog(logMessage, 'INTERVENTION');
    }

    setRoleChangeCandidate(null);
  };

  const handleBattleComplete = (winner: Character, loser: Character, battleLogs: string[], winnerHp: number, loserHp: number) => {
    // Add logs
    setLogs(prev => [
      ...prev,
      ...battleLogs.map(msg => ({ id: generateId(), day, message: msg, type: 'BATTLE' as const, timestamp: Date.now() })),
      { id: generateId(), day, message: `전투 종료! 승자: ${winner.name}`, type: 'BATTLE', timestamp: Date.now() }
    ]);

    // Update stats
    setCharacters(prev => prev.map(c => {
        if (c.id === winner.id) {
            return { ...c, battlesWon: c.battlesWon + 1, currentHp: winnerHp };
        }
        if (c.id === loser.id) {
            // Check death chance (if HP 0)
            let newStatus = c.status;
            if (loserHp <= 0) {
                newStatus = Math.random() < 0.3 ? Status.DEAD : Status.INJURED; // 30% chance of death on defeat
            }
            return { ...c, currentHp: loserHp, status: newStatus };
        }
        return c;
    }));

    if (loserHp <= 0) {
        addLog(`${loser.name}이(가) 전투 불능 상태가 되었습니다.`, 'BATTLE');
    }

    setCurrentBattle(null);
  };

  const handleHousingSave = (charId: string, housing: Housing) => {
    setCharacters(prev => prev.map(c => c.id === charId ? { ...c, housing } : c));
    addLog('하우징 정보가 저장되었습니다.', 'INFO');
  };

  const handleReset = () => {
    setDay(1);
    setCharacters([]);
    setQuests([]);
    setLogs([]);
    setFactionResources(getInitialResources());
    setGameSettings(DEFAULT_SETTINGS);
    addLog('게임이 초기화되었습니다.', 'INFO');
  };

  // --- Inventory & Shop Handlers ---

  const handleBuyItem = (role: Role, itemId: string) => {
    const itemDef = GAME_ITEMS.find(i => i.id === itemId);
    if (!itemDef) return;

    setFactionResources(prev => {
      const currentMoney = prev[role].money;
      if (currentMoney < itemDef.price) return prev; 

      const next = { ...prev };
      next[role] = {
        ...next[role],
        money: currentMoney - itemDef.price,
        inventory: [...next[role].inventory]
      };

      const existingItemIndex = next[role].inventory.findIndex(i => i.id === itemId);
      if (existingItemIndex >= 0) {
        next[role].inventory[existingItemIndex].count++;
      } else {
        next[role].inventory.push({ ...itemDef, count: 1 });
      }

      return next;
    });
    addLog(`${role} 진영이 ${itemDef.name}을(를) 구매했습니다.`, 'INFO');
  };

  const handleUseItem = (itemId: string, targetCharId: string, factionRole: Role) => {
    const target = characters.find(c => c.id === targetCharId);
    const itemDef = GAME_ITEMS.find(i => i.id === itemId);
    if (!target || !itemDef) return;

    let consumed = false;
    setFactionResources(prev => {
        const inv = prev[factionRole].inventory;
        const itemIdx = inv.findIndex(i => i.id === itemId);
        if (itemIdx === -1) return prev;

        const nextInv = [...inv];
        if (nextInv[itemIdx].count > 1) {
            nextInv[itemIdx].count--;
        } else {
            nextInv.splice(itemIdx, 1);
        }
        consumed = true;
        return {
            ...prev,
            [factionRole]: { ...prev[factionRole], inventory: nextInv }
        };
    });

    if (!consumed) return;

    setCharacters(prev => prev.map(c => {
        if (c.id === targetCharId) {
            let updated = { ...c };
            let effectLog = "";

            if (itemDef.effectType === 'HEAL') {
                const maxHp = (c.stats?.stamina || 50) * 2;
                const newHp = Math.min(maxHp, (c.currentHp || 0) + itemDef.effectValue);
                updated.currentHp = newHp;
                if (c.status === Status.INJURED) updated.status = Status.NORMAL;
                effectLog = `${itemDef.effectValue}의 체력을 회복했습니다.`;
            } else if (itemDef.effectType === 'BUFF_STRENGTH') {
                updated.stats = { ...c.stats!, strength: (c.stats?.strength || 50) + itemDef.effectValue };
                effectLog = `근력이 ${itemDef.effectValue} 증가했습니다.`;
            } else if (itemDef.effectType === 'BUFF_LUCK') {
                updated.stats = { ...c.stats!, luck: (c.stats?.luck || 50) + itemDef.effectValue };
                effectLog = `행운이 ${itemDef.effectValue} 증가했습니다.`;
            } else if (itemDef.effectType === 'EQUIPMENT') {
                const slot = itemDef.equipSlot;
                if (slot) {
                    updated.equipment = { ...c.equipment, [slot]: itemDef };
                    effectLog = `${itemDef.name}을(를) 장착했습니다.`;
                }
            }

            if (effectLog) addLog(`${c.name}이(가) ${itemDef.name}을(를) 사용하여 ${effectLog}`, 'EVENT');
            return updated;
        }
        return c;
    }));

    if (itemDef.effectType === 'GAMBLE_MONEY') {
        const isWin = Math.random() < 0.1; 
        if (isWin) {
            setFactionResources(prev => ({
                ...prev,
                [factionRole]: { ...prev[factionRole], money: prev[factionRole].money + itemDef.effectValue }
            }));
            addLog(`축하합니다! ${factionRole} 진영이 복권에 당첨되어 ${itemDef.effectValue}G를 획득했습니다!`, 'EVENT');
        } else {
            addLog(`${factionRole} 진영이 복권을 긁었지만 꽝이었습니다.`, 'INFO');
        }
    }
  };

  const handleUnequipItem = (charId: string, slot: string) => {
    let unequippedItem: Item | undefined;
    let charRole: Role | undefined;

    setCharacters(prev => prev.map(c => {
      if (c.id === charId) {
        charRole = c.role;
        unequippedItem = c.equipment?.[slot as keyof typeof c.equipment];
        if (unequippedItem) {
           const newEquip = { ...c.equipment };
           delete newEquip[slot as keyof typeof c.equipment];
           return { ...c, equipment: newEquip };
        }
      }
      return c;
    }));

    if (unequippedItem && charRole) {
      setFactionResources(prev => {
        const next = { ...prev };
        const inv = next[charRole!].inventory;
        const existingIdx = inv.findIndex(i => i.id === unequippedItem!.id);
        
        if (existingIdx >= 0) {
          inv[existingIdx].count++;
        } else {
          inv.push({ ...unequippedItem!, count: 1 });
        }
        return next;
      });
      addLog(`장비가 해제되어 인벤토리로 돌아갔습니다.`, 'INFO');
    }
  };

  const handleDebugSetMoney = (role: Role, amount: number) => {
    setFactionResources(prev => ({
      ...prev,
      [role]: { ...prev[role], money: amount }
    }));
    addLog(`[DEBUG] ${role} 진영 자금 ${amount}G로 변경`, 'INFO');
  };

  const handleDebugAddItem = (role: Role, itemId: string, count: number) => {
    const itemDef = GAME_ITEMS.find(i => i.id === itemId);
    if (!itemDef) return;

    setFactionResources(prev => {
        const next = { ...prev };
        const inv = next[role].inventory;
        const existingIdx = inv.findIndex(i => i.id === itemId);
        if (existingIdx >= 0) {
            inv[existingIdx].count += count;
        } else {
            inv.push({ ...itemDef, count });
        }
        return next;
    });
    addLog(`[DEBUG] ${role} 진영에 ${itemDef.name} ${count}개 추가`, 'INFO');
  };

  const exportData = (type: SaveType): SaveData => {
    const base = {
      version: 1,
      type,
      timestamp: Date.now(),
      characters,
    };

    if (type === 'FULL') {
      return {
        ...base,
        day,
        factionResources,
        logs,
        quests
      };
    }
    return base;
  };

  const importData = (data: SaveData) => {
    if (data.characters) setCharacters(data.characters);
    
    if (data.type === 'FULL') {
      if (data.day) setDay(data.day);
      if (data.factionResources) setFactionResources(data.factionResources);
      if (data.logs) setLogs(data.logs);
      if (data.quests) setQuests(data.quests);
      addLog('데이터를 성공적으로 불러왔습니다.', 'INFO');
    } else {
      setDay(1);
      setLogs([]);
      setQuests([]);
      setFactionResources(getInitialResources());
      addLog('캐릭터 명단을 불러왔습니다. 새 게임을 시작합니다.', 'INFO');
    }
  };

  return {
    day,
    characters,
    setCharacters,
    factionResources,
    logs,
    quests, // Export quests
    currentBattle,
    housingModalChar,
    setHousingModalChar,
    isAddCharModalOpen,
    setIsAddCharModalOpen,
    isQuestBoardOpen, // Export
    setIsQuestBoardOpen, // Export
    roleChangeCandidate,
    gameSettings,
    setGameSettings,
    handleRoleChangeDecision,
    handleNextDay,
    handleAddCharacter,
    handleUpdateCharacter,
    handleDeleteCharacter,
    handlePostQuest, // Export
    handleDeleteQuest, // Export
    handleHousingSave,
    handleReset,
    handleBattleComplete,
    handleUseItem,
    handleBuyItem,
    handleDebugSetMoney,
    handleDebugAddItem,
    handleUnequipItem,
    exportData,
    importData
  };
};
