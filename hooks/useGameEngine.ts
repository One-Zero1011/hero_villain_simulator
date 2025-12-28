
import { useState, useCallback } from 'react';
import { Character, LogEntry, Role, Status, Housing, FactionResources } from '../types/index';
import { processDailyEvents } from '../services/simulationService';
import { generateId } from '../utils/helpers';
import { GAME_ITEMS } from '../data/items';

// Updated Initial Characters to match new interface
const INITIAL_CHARACTERS: Character[] = [
  { 
    id: '1', 
    name: '캡틴 코리아', 
    role: Role.HERO, 
    status: Status.NORMAL, 
    gender: '남성',
    age: 32,
    mbti: 'ENFJ',
    power: 88, 
    stats: { strength: 90, intelligence: 70, stamina: 95, luck: 80 },
    superpower: '초괴력 (Super Strength)',
    relationships: [],
    kills: 0, 
    saves: 12, 
    battlesWon: 5,
    housing: {
      themeId: 'default_room',
      items: []
    }
  },
  { 
    id: '2', 
    name: '닥터 둠', 
    role: Role.VILLAIN, 
    status: Status.NORMAL, 
    gender: '남성',
    age: 45,
    mbti: 'INTJ',
    power: 92, 
    stats: { strength: 70, intelligence: 100, stamina: 80, luck: 60 },
    superpower: '천재적 지능 (Super Intelligence)',
    relationships: [],
    kills: 2, 
    saves: 0, 
    battlesWon: 4,
    housing: {
      themeId: 'evil_lair',
      items: []
    }
  },
  { 
    id: '3', 
    name: '시민 김철수', 
    role: Role.CIVILIAN, 
    status: Status.NORMAL, 
    gender: '남성',
    age: 28,
    mbti: 'ISFP',
    power: 5, 
    relationships: [],
    kills: 0, 
    saves: 0, 
    battlesWon: 0,
    housing: {
      themeId: 'cozy_house',
      items: []
    }
  },
];

// Helper to create initial items
const createItem = (id: string, count: number) => {
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
    ].filter(i => i !== null) as any
  },
  [Role.VILLAIN]: {
    money: 120000,
    inventory: [
      createItem('v_smoke', 3),
      createItem('v_serum', 1),
      createItem('com_water', 20),
      createItem('com_bandaid', 10)
    ].filter(i => i !== null) as any
  },
  [Role.CIVILIAN]: {
    money: 3500,
    inventory: [
      createItem('c_lotto', 10),
      createItem('com_water', 2),
      createItem('com_bandaid', 3),
      createItem('com_lunchbox', 1)
    ].filter(i => i !== null) as any
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
    // 1. Check for Battle Probability (50% chance if both Hero and Villain exist)
    const heroes = characters.filter(c => c.role === Role.HERO && c.status === Status.NORMAL);
    const villains = characters.filter(c => c.role === Role.VILLAIN && c.status === Status.NORMAL);

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

  const handleBattleComplete = (winner: Character, loser: Character, battleLogTexts: string[]) => {
    // Determine Loser Fate
    const isDeath = Math.random() < 0.2; // 20% chance of death

    // Update Characters immutably
    const updatedChars = characters.map(char => {
      if (char.id === winner.id) {
        return {
          ...char,
          battlesWon: char.battlesWon + 1,
          power: Math.min(100, char.power + 2) // Cap at 100
        };
      }
      if (char.id === loser.id) {
        return {
          ...char,
          status: isDeath ? Status.DEAD : Status.INJURED
        };
      }
      return char;
    });

    // Update Resources (Winner takes money)
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
    
    // Create Log Entries
    const battleLogs: LogEntry[] = [
      {
        id: generateId(),
        day: day + 1,
        message: `⚔️ 긴급 속보! ${winner.name}와(과) ${loser.name}의 치열한 전투가 벌어졌습니다!`,
        type: 'BATTLE',
        timestamp: Date.now()
      },
      ...battleLogTexts.slice(-3).map((text) => ({ // Add last 3 lines of combat log to main log
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
          : `전투 결과: ${loser.name}이(가) 큰 부상을 입고 후퇴했습니다.`,
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
        // Fix status if injured
        if (updatedChar.status === Status.INJURED) {
          updatedChar.status = Status.NORMAL;
          logMessage = `${item.name}을(를) 사용하여 ${targetChar.name}의 부상을 치료했습니다!`;
        } else {
          // Heal stamina
          const currentStamina = updatedChar.stats?.stamina || 50;
          const newStamina = Math.min(100, currentStamina + healAmount);
          if (updatedChar.stats) {
            updatedChar.stats = { ...updatedChar.stats, stamina: newStamina };
          }
          logMessage = `${item.name}을(를) 사용하여 ${targetChar.name}의 체력을 ${healAmount} 회복했습니다.`;
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
    const newChar: Character = {
      id: generateId(),
      ...newCharData,
      status: Status.NORMAL,
      kills: 0,
      saves: 0,
      battlesWon: 0,
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

  return {
    day,
    characters,
    factionResources, // Exported
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
    handleUseItem // New Export
  };
};
