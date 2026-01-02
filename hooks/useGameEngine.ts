
import { useState, useCallback } from 'react';
import { Character, LogEntry, Role, Status, Housing, FactionResources, Item, SaveData, SaveType } from '../types/index';
import { processDailyEvents } from '../services/simulationService';
import { generateId } from '../utils/helpers';
import { GAME_ITEMS } from '../data/items';

// Updated Initial Characters
const INITIAL_CHARACTERS: Character[] = [];

// Helper to create initial items safely
const createItem = (id: string, count: number): Item | null => {
  const def = GAME_ITEMS.find(i => i.id === id);
  if (!def) return null;
  return {
    id: def.id,
    name: def.name,
    icon: def.icon,
    count,
    description: def.description,
    price: def.price,
    role: def.role,
    effectType: def.effectType,
    effectValue: def.effectValue
  };
};

const INITIAL_RESOURCES: Record<Role, FactionResources> = {
  [Role.HERO]: {
    money: 50000,
    inventory: [
      createItem('h_bandage', 5),
      createItem('h_potion', 2),
      createItem('com_water', 10),
      createItem('com_lunchbox', 5)
    ].filter((i): i is Item => i !== null)
  },
  [Role.VILLAIN]: {
    money: 120000,
    inventory: [
      createItem('v_smoke', 3),
      createItem('v_serum', 1),
      createItem('com_water', 20),
      createItem('com_bandaid', 10)
    ].filter((i): i is Item => i !== null)
  },
  [Role.CIVILIAN]: {
    money: 3500,
    inventory: [
      createItem('c_lotto', 10),
      createItem('com_water', 2),
      createItem('com_bandaid', 3),
      createItem('com_lunchbox', 1)
    ].filter((i): i is Item => i !== null)
  }
};

export const useGameEngine = () => {
  const [day, setDay] = useState(1);
  const [characters, setCharacters] = useState<Character[]>(INITIAL_CHARACTERS);
  const [factionResources, setFactionResources] = useState<Record<Role, FactionResources>>(INITIAL_RESOURCES);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // Battle State
  const [currentBattle, setCurrentBattle] = useState<{hero: Character, villain: Character} | null>(null);

  // Housing State
  const [housingModalChar, setHousingModalChar] = useState<Character | null>(null);

  // Add Character Modal State
  const [isAddCharModalOpen, setIsAddCharModalOpen] = useState(false);

  const proceedDay = (battleLogs: LogEntry[], battleParticipants: string[] = []) => {
    const { updatedCharacters, newLogs } = processDailyEvents(day, characters, battleParticipants);
    
    const dayStartLog: LogEntry = {
      id: `day-start-${day + 1}`,
      day: day + 1,
      message: `──────── Day ${day + 1} 시작 ────────`,
      type: 'INFO',
      timestamp: Date.now()
    };

    setCharacters(updatedCharacters);
    setLogs(prev => [...prev, dayStartLog, ...battleLogs, ...newLogs]);
    setDay(prev => prev + 1);
  };

  const handleNextDay = useCallback(() => {
    // 1. Identify active characters
    const activeChars = characters.filter(c => c.status !== Status.DEAD);
    const insaneChars = activeChars.filter(c => c.isInsane);
    
    // 2. Insanity Battle Trigger (High Priority)
    // If there is an insane character, they have a high chance to attack ANYONE.
    if (insaneChars.length > 0 && activeChars.length > 1 && Math.random() < 0.7) {
      const attacker = insaneChars[Math.floor(Math.random() * insaneChars.length)];
      // Can attack anyone except self
      const potentialTargets = activeChars.filter(c => c.id !== attacker.id);
      
      if (potentialTargets.length > 0) {
        const defender = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
        
        // Use existing battle structure but logs will indicate insanity
        setCurrentBattle({ hero: attacker, villain: defender }); // Note: 'hero' prop just means attacker here visually
        
        setLogs(prev => [...prev, {
          id: generateId(),
          day: day + 1,
          message: `[광기] 이성을 잃은 ${attacker.name}이(가) 피아식별 없이 ${defender.name}을(를) 공격합니다!`,
          type: 'INSANITY',
          timestamp: Date.now()
        }]);
        return;
      }
    }

    // 3. Normal Battle Probability (50% chance if both Hero and Villain exist)
    const heroes = activeChars.filter(c => c.role === Role.HERO && c.status === Status.NORMAL);
    const villains = activeChars.filter(c => c.role === Role.VILLAIN && c.status === Status.NORMAL);

    if (heroes.length > 0 && villains.length > 0 && Math.random() < 0.5) {
      // Start Battle Mode
      const randomHero = heroes[Math.floor(Math.random() * heroes.length)];
      const randomVillain = villains[Math.floor(Math.random() * villains.length)];
      setCurrentBattle({ hero: randomHero, villain: randomVillain });
    } else {
      // No Battle, just normal day
      proceedDay([]);
    }
  }, [day, characters]);

  const handleBattleComplete = (winner: Character, loser: Character, battleLogTexts: string[], winnerHp: number, loserHp: number) => {
    // Determine Loser Fate
    const isDeath = Math.random() < 0.2; // 20% chance of death

    // Update Characters immutably
    const updatedChars = characters.map(char => {
      // Sanity damage for both participants due to stress of battle
      const sanityDamage = Math.floor(Math.random() * 15) + 5; 
      let newSanity = char.currentSanity ?? ((char.stats?.intelligence || 50) * 2);
      newSanity = Math.max(0, newSanity - sanityDamage);

      if (char.id === winner.id) {
        return {
          ...char,
          currentHp: winnerHp, // Persist remaining HP
          currentSanity: newSanity,
          battlesWon: char.battlesWon + 1,
          power: Math.min(100, char.power + 2) // Cap at 100
        };
      }
      if (char.id === loser.id) {
        return {
          ...char,
          currentHp: 0, // Loser is defeated
          currentSanity: Math.max(0, newSanity - 10), // Loser loses more sanity
          status: isDeath ? Status.DEAD : Status.INJURED
        };
      }
      return char;
    });

    // Update Resources (Winner takes money - only if standard roles)
    if (winner.role !== Role.CIVILIAN) { 
      setFactionResources(prev => {
        const reward = 1000 + Math.floor(Math.random() * 500);
        return {
          ...prev,
          [winner.role]: {
            ...prev[winner.role],
            money: prev[winner.role].money + reward
          }
        };
      });
    }
    
    // Create Log Entries
    const battleLogs: LogEntry[] = [
      {
        id: generateId(),
        day: day + 1,
        message: `⚔️ 전투 종료! ${winner.name}의 승리! (남은 체력: ${Math.ceil(winnerHp)})`,
        type: 'BATTLE',
        timestamp: Date.now()
      },
      ...battleLogTexts.slice(-3).map((text) => ({ // Add last 3 lines of combat log
        id: generateId(),
        day: day + 1,
        message: `> ${text}`,
        type: 'INFO' as const,
        timestamp: Date.now()
      })),
      {
        id: generateId(),
        day: day + 1,
        message: isDeath 
          ? `전투 결과: ${loser.name}이(가) 치명상을 입고 사망했습니다...` 
          : `전투 결과: ${loser.name}이(가) 큰 부상을 입고 쓰러졌습니다.`,
        type: isDeath ? 'DEATH' : 'INFO',
        timestamp: Date.now()
      }
    ];

    setCharacters(updatedChars);
    setCurrentBattle(null);
    proceedDay(battleLogs, [winner.id, loser.id]);
  };

  const handleUseItem = (itemId: string, targetCharId: string, factionRole: Role) => {
    // 1. Find and Decrement Item
    const resources = factionResources[factionRole];
    const itemIndex = resources.inventory.findIndex(i => i.id === itemId);
    
    if (itemIndex === -1) return;
    const item = resources.inventory[itemIndex];

    if (item.count <= 0) return;

    // 2. Find Target Character
    const targetChar = characters.find(c => c.id === targetCharId);
    if (!targetChar) return;

    // 3. Apply Effects
    let logMessage = '';
    let updatedChar = { ...targetChar };
    let gainedMoney = 0;

    switch (item.effectType) {
      case 'HEAL':
        const healAmount = item.effectValue || 10;
        const maxHp = (updatedChar.stats?.stamina || 50) * 2;
        const currentHp = updatedChar.currentHp ?? maxHp;
        
        // Heal HP
        updatedChar.currentHp = Math.min(maxHp, currentHp + healAmount);

        // Fix status if injured
        if (updatedChar.status === Status.INJURED) {
          updatedChar.status = Status.NORMAL;
          logMessage = `${item.name}을(를) 사용하여 ${targetChar.name}의 부상을 치료하고 체력을 회복했습니다! (${Math.ceil(currentHp)} -> ${Math.ceil(updatedChar.currentHp)})`;
        } else {
          // Heal Stamina (if mechanism requires, but mostly visual here, let's boost sanity slightly too)
          // Restore Sanity slightly with heal items
          const maxSanity = (updatedChar.stats?.intelligence || 50) * 2;
          updatedChar.currentSanity = Math.min(maxSanity, (updatedChar.currentSanity || maxSanity) + 5);
          
          logMessage = `${item.name}을(를) 사용하여 ${targetChar.name}의 체력을 회복했습니다. (${Math.ceil(currentHp)} -> ${Math.ceil(updatedChar.currentHp)})`;
        }
        break;

      case 'BUFF_STRENGTH':
        const strAmount = item.effectValue || 5;
        if (updatedChar.stats) {
          updatedChar.stats = { ...updatedChar.stats, strength: Math.min(100, updatedChar.stats.strength + strAmount) };
        }
        logMessage = `${item.name} 투여! ${targetChar.name}의 근력이 ${strAmount} 상승했습니다.`;
        break;

      case 'BUFF_LUCK':
        const luckAmount = item.effectValue || 5;
        if (updatedChar.stats) {
          updatedChar.stats = { ...updatedChar.stats, luck: Math.min(100, updatedChar.stats.luck + luckAmount) };
        }
        logMessage = `${item.name} 사용! ${targetChar.name}의 행운이 ${luckAmount} 상승했습니다.`;
        break;

      case 'GAMBLE_MONEY':
        const maxPrize = item.effectValue || 1000;
        // 10% chance for big win, 40% small win, 50% lose
        const roll = Math.random();
        if (roll < 0.05) {
          gainedMoney = maxPrize;
          logMessage = `대박! ${targetChar.name}이(가) ${item.name}에 당첨되어 ${maxPrize}G를 획득했습니다!`;
        } else if (roll < 0.4) {
          gainedMoney = Math.floor(maxPrize * 0.1);
          logMessage = `${targetChar.name}이(가) ${item.name} 소액 당첨으로 ${gainedMoney}G를 얻었습니다.`;
        } else {
          logMessage = `${targetChar.name}이(가) ${item.name}를 긁었지만 꽝이었습니다...`;
        }
        break;
      
      default:
        logMessage = `${targetChar.name}에게 ${item.name}을(를) 사용했습니다.`;
    }

    // 4. Update State
    // Update Character
    setCharacters(prev => prev.map(c => c.id === targetCharId ? updatedChar : c));

    // Update Inventory & Money
    setFactionResources(prev => {
      const currentFaction = prev[factionRole];
      const newInventory = [...currentFaction.inventory];
      
      if (newInventory[itemIndex].count > 1) {
        newInventory[itemIndex] = { ...newInventory[itemIndex], count: newInventory[itemIndex].count - 1 };
      } else {
        newInventory.splice(itemIndex, 1);
      }

      return {
        ...prev,
        [factionRole]: {
          ...currentFaction,
          money: currentFaction.money + gainedMoney,
          inventory: newInventory
        }
      };
    });

    // Add Log
    setLogs(prev => [...prev, {
      id: generateId(),
      day,
      message: `[아이템] ${logMessage}`,
      type: 'INFO',
      timestamp: Date.now()
    }]);
  };

  const handleAddCharacter = (newCharData: Omit<Character, 'id' | 'status' | 'kills' | 'saves' | 'battlesWon'>) => {
    // Sanity & HP Initialization
    const intelligence = newCharData.stats?.intelligence || 50;
    const stamina = newCharData.stats?.stamina || 50;
    const maxSanity = intelligence * 2;
    const maxHp = stamina * 2;

    const newChar: Character = {
      id: generateId(),
      ...newCharData,
      status: Status.NORMAL,
      kills: 0,
      saves: 0,
      battlesWon: 0,
      currentSanity: maxSanity,
      currentHp: maxHp,
      isInsane: false,
      housing: { themeId: 'default_room', items: [] } // Init empty housing
    };
    
    setCharacters(prev => [...prev, newChar]);
    
    // Default system log
    const systemLogs: LogEntry[] = [{
      id: generateId(),
      day: day,
      message: `[관리자] 새로운 ${newChar.role} "${newChar.name}"(이)가 시스템에 등록되었습니다.`,
      type: 'INFO',
      timestamp: Date.now()
    }];

    // Relationship logs
    if (newChar.relationships && newChar.relationships.length > 0) {
      newChar.relationships.forEach((rel, idx) => {
        systemLogs.push({
          id: generateId(),
          day: day,
          message: `[관계 설정] ${newChar.name}이(가) ${rel.targetName}의 "${rel.type}" 관계가 되었습니다.`,
          type: 'INFO',
          timestamp: Date.now() + idx + 1
        });
      });
    }
    
    setLogs(prev => [...prev, ...systemLogs]);
  };

  const handleDeleteCharacter = (id: string) => {
    const char = characters.find(c => c.id === id);
    if (char) {
      setCharacters(prev => prev.filter(c => c.id !== id));
      setLogs(prev => [...prev, {
        id: generateId(),
        day: day,
        message: `[관리자] "${char.name}"(이)가 시스템에서 제거되었습니다.`,
        type: 'INFO',
        timestamp: Date.now()
      }]);
    }
  };

  const handleHousingSave = (charId: string, housing: Housing) => {
    setCharacters(prev => prev.map(c => {
      if (c.id === charId) {
        return { ...c, housing };
      }
      return c;
    }));
    
    const charName = characters.find(c => c.id === charId)?.name;
    setLogs(prev => [...prev, {
      id: generateId(),
      day: day,
      message: `[시스템] ${charName}의 본거지가 리모델링 되었습니다.`,
      type: 'INFO',
      timestamp: Date.now()
    }]);
  };

  const handleReset = () => {
    if (!window.confirm("정말로 게임을 초기화하시겠습니까? 모든 데이터가 사라집니다.")) return;
    setDay(1);
    setCharacters(INITIAL_CHARACTERS);
    setFactionResources(INITIAL_RESOURCES);
    setLogs([{
      id: generateId(),
      day: 1,
      message: '시스템이 초기화되었습니다. 시뮬레이션을 다시 시작합니다.',
      type: 'INFO',
      timestamp: Date.now()
    }]);
  };

  // --- Save/Load Functionality ---

  const exportData = (type: SaveType): SaveData => {
    const baseData = {
      version: 1,
      type,
      timestamp: Date.now(),
      characters, // Always export current state of characters
    };

    if (type === 'FULL') {
      return {
        ...baseData,
        day,
        factionResources,
        logs
      };
    } else {
      // For Roster export, we sanitize character status to default
      const cleanCharacters = characters.map(c => ({
        ...c,
        status: Status.NORMAL,
        currentHp: (c.stats?.stamina || 50) * 2,
        currentSanity: (c.stats?.intelligence || 50) * 2,
        isInsane: false,
        kills: 0,
        saves: 0,
        battlesWon: 0
      }));
      return {
        ...baseData,
        characters: cleanCharacters
      };
    }
  };

  const importData = (data: SaveData) => {
    if (data.type === 'FULL') {
      // Full Game Load
      if (data.day) setDay(data.day);
      if (data.characters) setCharacters(data.characters);
      if (data.factionResources) setFactionResources(data.factionResources);
      if (data.logs) setLogs(data.logs);
      
      // Add a system log indicating load
      setLogs(prev => [...prev, {
        id: generateId(),
        day: data.day || 1,
        message: '💾 저장된 게임을 불러왔습니다.',
        type: 'INFO',
        timestamp: Date.now()
      }]);

    } else if (data.type === 'ROSTER') {
      // Roster Load (New Game with imported chars)
      // We assume data.characters are already sanitized or we sanitize them here again for safety
      const importedChars = data.characters.map(c => ({
        ...c,
        status: Status.NORMAL,
        currentHp: (c.stats?.stamina || 50) * 2,
        currentSanity: (c.stats?.intelligence || 50) * 2,
        isInsane: false,
        kills: 0,
        saves: 0,
        battlesWon: 0
      }));

      setCharacters(importedChars);
      setDay(1);
      setFactionResources(INITIAL_RESOURCES);
      setLogs([{
        id: generateId(),
        day: 1,
        message: '📂 외부 캐릭터 명단을 불러왔습니다. 새로운 시뮬레이션을 시작합니다.',
        type: 'INFO',
        timestamp: Date.now()
      }]);
    }
  };

  return {
    day,
    characters,
    factionResources,
    logs,
    currentBattle,
    housingModalChar,
    isAddCharModalOpen,
    setIsAddCharModalOpen,
    setHousingModalChar,
    handleNextDay,
    handleAddCharacter,
    handleDeleteCharacter,
    handleHousingSave,
    handleReset,
    handleBattleComplete,
    handleUseItem,
    exportData,
    importData
  };
};
