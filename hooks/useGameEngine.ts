
import { useState, useCallback } from 'react';
import { Character, LogEntry, Role, Status, Housing, FactionResources, Item, SaveData, SaveType, GameSettings, EquipmentSlot } from '../types/index';
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
    effectValue: def.effectValue,
    equipSlot: def.equipSlot, // Map new props
    statBonus: def.statBonus // Map new props
  };
};

const INITIAL_RESOURCES: Record<Role, FactionResources> = {
  [Role.HERO]: {
    money: 0, 
    inventory: [
      createItem('h_bandage', 5),
      createItem('h_potion', 2),
      createItem('com_water', 10),
      createItem('eq_suit_tactical', 1) // Free equipment for testing
    ].filter((i): i is Item => i !== null)
  },
  [Role.VILLAIN]: {
    money: 0, 
    inventory: [
      createItem('v_smoke', 3),
      createItem('v_serum', 1),
      createItem('com_water', 20),
      createItem('eq_acc_neck_amulet', 1) // Free equipment for testing
    ].filter((i): i is Item => i !== null)
  },
  [Role.CIVILIAN]: {
    money: 0, 
    inventory: [
      createItem('c_lotto', 10),
      createItem('com_water', 2),
      createItem('com_bandaid', 3),
      createItem('eq_shoes_running', 1) // Free equipment for testing
    ].filter((i): i is Item => i !== null)
  }
};

const INITIAL_SETTINGS: GameSettings = {
  preventMinorAdultDating: true,
  allowFamilyDating: false,
  pureLoveMode: true,    
  allowSameSex: false,   
  allowHetero: true,     
  globalNoRomance: false,
  debugMode: false,      
};

export const useGameEngine = () => {
  const [day, setDay] = useState(1);
  const [characters, setCharacters] = useState<Character[]>(INITIAL_CHARACTERS);
  const [factionResources, setFactionResources] = useState<Record<Role, FactionResources>>(INITIAL_RESOURCES);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [gameSettings, setGameSettings] = useState<GameSettings>(INITIAL_SETTINGS);
  
  // Battle State
  const [currentBattle, setCurrentBattle] = useState<{hero: Character, villain: Character} | null>(null);

  // Housing State
  const [housingModalChar, setHousingModalChar] = useState<Character | null>(null);

  // Add Character Modal State
  const [isAddCharModalOpen, setIsAddCharModalOpen] = useState(false);

  // Modified proceedDay to accept an optional 'currentChars' override.
  // This allows passing the updated state immediately after a battle without waiting for React re-render.
  const proceedDay = (battleLogs: LogEntry[], battleParticipants: string[] = [], currentChars: Character[] = characters) => {
    // Pass gameSettings to processDailyEvents
    const { updatedCharacters, newLogs, income } = processDailyEvents(day, currentChars, battleParticipants, gameSettings);
    
    const dayStartLog: LogEntry = {
      id: `day-start-${day + 1}`,
      day: day + 1,
      message: `──────── Day ${day + 1} 시작 ────────`,
      type: 'INFO',
      timestamp: Date.now()
    };

    // Apply Income from Events
    setFactionResources(prev => ({
      [Role.HERO]: { ...prev[Role.HERO], money: prev[Role.HERO].money + (income[Role.HERO] || 0) },
      [Role.VILLAIN]: { ...prev[Role.VILLAIN], money: prev[Role.VILLAIN].money + (income[Role.VILLAIN] || 0) },
      [Role.CIVILIAN]: { ...prev[Role.CIVILIAN], money: prev[Role.CIVILIAN].money + (income[Role.CIVILIAN] || 0) },
    }));

    setCharacters(updatedCharacters);
    setLogs(prev => [...prev, dayStartLog, ...battleLogs, ...newLogs]);
    setDay(prev => prev + 1);
  };

  const handleNextDay = useCallback(() => {
    // 1. Identify active characters
    const activeChars = characters.filter(c => c.status !== Status.DEAD);
    const insaneChars = activeChars.filter(c => c.isInsane);
    
    // 2. Insanity Battle Trigger (25% chance)
    if (insaneChars.length > 0 && activeChars.length > 1 && Math.random() < 0.25) {
      const attacker = insaneChars[Math.floor(Math.random() * insaneChars.length)];
      // Can attack anyone except self
      const potentialTargets = activeChars.filter(c => c.id !== attacker.id);
      
      if (potentialTargets.length > 0) {
        const defender = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
        
        setCurrentBattle({ hero: attacker, villain: defender });
        
        setLogs(prev => [...prev, {
          id: generateId(),
          day: day + 1,
          message: `[광기] 이성을 잃은 ${attacker.name}이(가) 피아식별 없이 ${defender.name}을(를) 공격합니다!`,
          type: 'INSANITY',
          timestamp: Date.now(),
          statChanges: { sanity: -10 }
        }]);
        return;
      }
    }

    // 3. Normal Battle Probability (10% chance if both Hero and Villain exist)
    const heroes = activeChars.filter(c => c.role === Role.HERO && c.status === Status.NORMAL);
    const villains = activeChars.filter(c => c.role === Role.VILLAIN && c.status === Status.NORMAL);

    if (heroes.length > 0 && villains.length > 0 && Math.random() < 0.1) {
      // Start Battle Mode
      const randomHero = heroes[Math.floor(Math.random() * heroes.length)];
      const randomVillain = villains[Math.floor(Math.random() * villains.length)];
      setCurrentBattle({ hero: randomHero, villain: randomVillain });
    } else {
      // No Battle, just normal day
      proceedDay([]);
    }
  }, [day, characters, gameSettings]);

  const handleBattleComplete = (winner: Character, loser: Character, battleLogTexts: string[], winnerHp: number, loserHp: number) => {
    // Determine Loser Fate
    const isDeath = Math.random() < 0.2; // 20% chance of death

    // Update Characters immutably
    // IMPORTANT: Calculate the new state here to pass to proceedDay
    const updatedChars = characters.map(char => {
      // Sanity damage
      const sanityDamage = Math.floor(Math.random() * 15) + 5; 
      let newSanity = char.currentSanity ?? ((char.stats?.intelligence || 50) * 2);
      newSanity = Math.max(0, newSanity - sanityDamage);

      if (char.id === winner.id) {
        return {
          ...char,
          currentHp: winnerHp,
          currentSanity: newSanity,
          battlesWon: char.battlesWon + 1,
          power: Math.min(100, char.power + 2)
        };
      }
      if (char.id === loser.id) {
        return {
          ...char,
          currentHp: 0, 
          currentSanity: Math.max(0, newSanity - 10),
          status: isDeath ? Status.DEAD : Status.INJURED
        };
      }
      return char;
    });

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
        timestamp: Date.now(),
        statChanges: { hp: winnerHp - (winner.currentHp || 0) } // Approximate tracking
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
        timestamp: Date.now(),
        statChanges: { hp: - (loser.currentHp || 100) }
      }
    ];

    setCurrentBattle(null);
    // Pass the 'updatedChars' explicitly so proceedDay uses the post-battle state
    // including deaths and injuries, instead of the stale 'characters' state.
    proceedDay(battleLogs, [winner.id, loser.id], updatedChars);
  };

  // --- Shop Logic ---
  const handleBuyItem = (role: Role, itemId: string) => {
    const itemDef = GAME_ITEMS.find(i => i.id === itemId);
    if (!itemDef) return;

    setFactionResources(prev => {
      const currentFaction = prev[role];
      if (currentFaction.money < itemDef.price) return prev; // Not enough money

      const newInventory = [...currentFaction.inventory];
      const existingItemIndex = newInventory.findIndex(i => i.id === itemId);

      if (existingItemIndex >= 0) {
        newInventory[existingItemIndex] = {
          ...newInventory[existingItemIndex],
          count: newInventory[existingItemIndex].count + 1
        };
      } else {
        newInventory.push({
          id: itemDef.id,
          name: itemDef.name,
          icon: itemDef.icon,
          count: 1,
          description: itemDef.description,
          price: itemDef.price,
          role: itemDef.role,
          effectType: itemDef.effectType,
          effectValue: itemDef.effectValue,
          equipSlot: itemDef.equipSlot,
          statBonus: itemDef.statBonus
        });
      }

      return {
        ...prev,
        [role]: {
          money: currentFaction.money - itemDef.price,
          inventory: newInventory
        }
      };
    });

    setLogs(prev => [...prev, {
      id: generateId(),
      day,
      message: `[상점] ${role} 진영이 '${itemDef.name}'을(를) 구매했습니다. (-${itemDef.price}G)`,
      type: 'INFO',
      timestamp: Date.now()
    }]);
  };

  // --- Cheat / Debug Logic ---
  const handleDebugSetMoney = (role: Role, amount: number) => {
    setFactionResources(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        money: amount
      }
    }));
  };

  const handleDebugAddItem = (role: Role, itemId: string, count: number) => {
    const itemDef = GAME_ITEMS.find(i => i.id === itemId);
    if (!itemDef) return;

    setFactionResources(prev => {
      const currentFaction = prev[role];
      const newInventory = [...currentFaction.inventory];
      const existingItemIndex = newInventory.findIndex(i => i.id === itemId);

      if (existingItemIndex >= 0) {
        newInventory[existingItemIndex] = {
          ...newInventory[existingItemIndex],
          count: newInventory[existingItemIndex].count + count
        };
      } else {
        newInventory.push({
          id: itemDef.id,
          name: itemDef.name,
          icon: itemDef.icon,
          count: count,
          description: itemDef.description,
          price: itemDef.price,
          role: itemDef.role,
          effectType: itemDef.effectType,
          effectValue: itemDef.effectValue,
          equipSlot: itemDef.equipSlot,
          statBonus: itemDef.statBonus
        });
      }

      return {
        ...prev,
        [role]: {
          ...currentFaction,
          inventory: newInventory
        }
      };
    });
  };

  const handleUnequipItem = (charId: string, slotName: string) => {
    const char = characters.find(c => c.id === charId);
    if (!char) return;

    const slot = slotName.toLowerCase() as keyof typeof char.equipment;
    const equippedItem = char.equipment[slot];
    if (!equippedItem) return;

    // 1. Calculate new stats (Remove item bonuses)
    const newStats = { ...char.stats } as any;
    if (char.stats && equippedItem.statBonus) {
      if (equippedItem.statBonus.strength) newStats.strength = Math.max(1, newStats.strength - (equippedItem.statBonus.strength || 0));
      if (equippedItem.statBonus.intelligence) newStats.intelligence = Math.max(1, newStats.intelligence - (equippedItem.statBonus.intelligence || 0));
      if (equippedItem.statBonus.stamina) newStats.stamina = Math.max(1, newStats.stamina - (equippedItem.statBonus.stamina || 0));
      if (equippedItem.statBonus.luck) newStats.luck = Math.max(1, newStats.luck - (equippedItem.statBonus.luck || 0));
    }

    // 2. Update Character
    const updatedChar: Character = {
      ...char,
      stats: newStats,
      equipment: {
        ...char.equipment,
        [slot]: null
      }
    };

    setCharacters(prev => prev.map(c => c.id === charId ? updatedChar : c));

    // 3. Return item to faction inventory
    const factionRole = char.role;
    setFactionResources(prev => {
      const currentFaction = prev[factionRole];
      const newInventory = [...currentFaction.inventory];
      const existingIdx = newInventory.findIndex(i => i.id === equippedItem.id);

      if (existingIdx >= 0) {
        newInventory[existingIdx] = { 
          ...newInventory[existingIdx], 
          count: newInventory[existingIdx].count + 1 
        };
      } else {
        newInventory.push({ ...equippedItem, count: 1 });
      }

      return {
        ...prev,
        [factionRole]: {
          ...currentFaction,
          inventory: newInventory
        }
      };
    });

    setLogs(prev => [...prev, {
      id: generateId(),
      day,
      message: `[장비] ${char.name}이(가) ${equippedItem.name}을(를) 해제했습니다.`,
      type: 'INFO',
      timestamp: Date.now(),
      statChanges: { hp: 0, sanity: 0 } 
    }]);
  };

  const handleUseItem = (itemId: string, targetCharId: string, factionRole: Role) => {
    const resources = factionResources[factionRole];
    const itemIndex = resources.inventory.findIndex(i => i.id === itemId);
    
    if (itemIndex === -1) return;
    const item = resources.inventory[itemIndex];

    if (item.count <= 0) return;

    const targetChar = characters.find(c => c.id === targetCharId);
    if (!targetChar) return;

    let logMessage = '';
    let updatedChar = { ...targetChar };
    let gainedMoney = 0;
    let hpChange = 0;
    let sanityChange = 0;
    
    // --- Equipment Logic ---
    if (item.effectType === 'EQUIPMENT' && item.equipSlot) {
      const slot = item.equipSlot.toLowerCase() as keyof typeof updatedChar.equipment;
      const currentEquipped = updatedChar.equipment[slot];
      
      // Calculate Stats: Remove old item stats, Add new item stats
      if (updatedChar.stats) {
        let newStats = { ...updatedChar.stats };
        
        // Remove old stats (Use || 0 to prevent NaN if stat is undefined)
        if (currentEquipped?.statBonus) {
          newStats.strength -= (currentEquipped.statBonus.strength || 0);
          newStats.intelligence -= (currentEquipped.statBonus.intelligence || 0);
          newStats.stamina -= (currentEquipped.statBonus.stamina || 0);
          newStats.luck -= (currentEquipped.statBonus.luck || 0);
        }

        // Add new stats (Use || 0 to prevent NaN)
        if (item.statBonus) {
          newStats.strength += (item.statBonus.strength || 0);
          newStats.intelligence += (item.statBonus.intelligence || 0);
          newStats.stamina += (item.statBonus.stamina || 0);
          newStats.luck += (item.statBonus.luck || 0);
        }
        
        // Clamp stats
        updatedChar.stats = {
          strength: Math.max(1, newStats.strength),
          intelligence: Math.max(1, newStats.intelligence),
          stamina: Math.max(1, newStats.stamina),
          luck: Math.max(1, newStats.luck),
        };
      }

      // Unequip logic: Return old item to inventory
      let itemsReturned: Item[] = [];
      if (currentEquipped) {
        itemsReturned.push(currentEquipped);
      }

      // Equip new item
      updatedChar.equipment = {
        ...updatedChar.equipment,
        [slot]: { ...item, count: 1 } // Store single item in slot
      };

      logMessage = `${targetChar.name}이(가) ${item.name}을(를) 장착했습니다.`;

      // Update Inventory: Remove used item, Add returned item
      setFactionResources(prev => {
        const currentFaction = prev[factionRole];
        let newInventory = [...currentFaction.inventory];
        
        // Reduce count or remove used item
        if (newInventory[itemIndex].count > 1) {
          newInventory[itemIndex] = { ...newInventory[itemIndex], count: newInventory[itemIndex].count - 1 };
        } else {
          newInventory.splice(itemIndex, 1);
        }

        // Add returned item if any
        if (itemsReturned.length > 0) {
          itemsReturned.forEach(returnedItem => {
            const existingIdx = newInventory.findIndex(i => i.id === returnedItem.id);
            if (existingIdx >= 0) {
              newInventory[existingIdx] = { ...newInventory[existingIdx], count: newInventory[existingIdx].count + 1 };
            } else {
              newInventory.push(returnedItem);
            }
          });
        }

        return {
          ...prev,
          [factionRole]: {
            ...currentFaction,
            money: currentFaction.money + gainedMoney, // usually 0 for equip
            inventory: newInventory
          }
        };
      });

      setCharacters(prev => prev.map(c => c.id === targetCharId ? updatedChar : c));
      setLogs(prev => [...prev, {
        id: generateId(),
        day,
        message: `[장비] ${logMessage}`,
        type: 'INFO',
        timestamp: Date.now()
      }]);

      return; // Exit function for equipment
    }

    // --- Consumable Logic ---
    switch (item.effectType) {
      case 'HEAL':
        const healAmount = item.effectValue || 10;
        const maxHp = (updatedChar.stats?.stamina || 50) * 2;
        const currentHp = updatedChar.currentHp ?? maxHp;
        updatedChar.currentHp = Math.min(maxHp, currentHp + healAmount);
        hpChange = updatedChar.currentHp - currentHp;

        if (updatedChar.status === Status.INJURED) {
          updatedChar.status = Status.NORMAL;
          logMessage = `${item.name}을(를) 사용하여 ${targetChar.name}의 부상을 치료하고 체력을 회복했습니다!`;
        } else {
          const maxSanity = (updatedChar.stats?.intelligence || 50) * 2;
          const currentSanity = updatedChar.currentSanity || maxSanity;
          updatedChar.currentSanity = Math.min(maxSanity, currentSanity + 5);
          sanityChange = updatedChar.currentSanity - currentSanity;
          logMessage = `${item.name}을(를) 사용하여 ${targetChar.name}의 체력을 회복했습니다.`;
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

    setCharacters(prev => prev.map(c => c.id === targetCharId ? updatedChar : c));
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

    setLogs(prev => [...prev, {
      id: generateId(),
      day,
      message: `[아이템] ${logMessage}`,
      type: 'INFO',
      timestamp: Date.now(),
      statChanges: { hp: hpChange, sanity: sanityChange }
    }]);
  };

  const handleAddCharacter = (newCharData: Omit<Character, 'id' | 'status' | 'kills' | 'saves' | 'battlesWon'>) => {
    // Calculate derived stats
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
      housing: { themeId: 'default_room', items: [] },
      equipment: {} // Initialize empty equipment
    };
    
    // Update State (Add new char AND update targets of mutual relationships)
    setCharacters(prev => {
      const updatedPrev = prev.map(existingChar => {
        // Check if newChar has a mutual relationship pointing to this existingChar
        const relFromNew = newChar.relationships.find(r => r.targetId === existingChar.id && r.isMutual);
        
        if (relFromNew) {
          // Verify reciprocation doesn't already exist (it shouldn't for a new char, but for safety)
          const alreadyExists = existingChar.relationships.some(r => r.targetId === newChar.id);
          
          if (!alreadyExists) {
            return {
              ...existingChar,
              relationships: [
                ...existingChar.relationships,
                {
                  targetId: newChar.id,
                  targetName: newChar.name,
                  type: relFromNew.type,
                  isMutual: true,
                  affinity: relFromNew.affinity
                }
              ]
            };
          }
        }
        return existingChar;
      });
      return [...updatedPrev, newChar];
    });
    
    const systemLogs: LogEntry[] = [{
      id: generateId(),
      day: day,
      message: `[관리자] 새로운 ${newChar.role} "${newChar.name}"(이)가 시스템에 등록되었습니다.`,
      type: 'INFO',
      timestamp: Date.now()
    }];

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

  const handleUpdateCharacter = (updatedChar: Character) => {
    // BUG FIX: When a character name changes, update all relationships pointing to this character
    setCharacters(prev => prev.map(c => {
      if (c.id === updatedChar.id) return updatedChar;
      
      // Check if this character has a relationship with the updated character
      const needsUpdate = c.relationships.some(r => r.targetId === updatedChar.id);
      if (needsUpdate) {
        return {
          ...c,
          relationships: c.relationships.map(r => {
            if (r.targetId === updatedChar.id) {
              return { ...r, targetName: updatedChar.name };
            }
            return r;
          })
        };
      }
      return c;
    }));

    setLogs(prev => [...prev, {
      id: generateId(),
      day: day,
      message: `[관리자] "${updatedChar.name}"의 정보가 수정되었습니다.`,
      type: 'INFO',
      timestamp: Date.now()
    }]);
  };

  const handleDeleteCharacter = (id: string) => {
    const char = characters.find(c => c.id === id);
    if (char) {
      // BUG FIX: Remove references to this character from everyone else's relationships
      setCharacters(prev => 
        prev
          .filter(c => c.id !== id) // Remove the character itself
          .map(c => ({
            ...c,
            relationships: c.relationships.filter(r => r.targetId !== id) // Remove dangling relationships
          }))
      );

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
    // Removed window.confirm. 
    // The confirmation UI logic is now handled in App.tsx using ConfirmModal.
    setDay(1);
    setCharacters(INITIAL_CHARACTERS);
    setFactionResources(INITIAL_RESOURCES);
    setGameSettings(INITIAL_SETTINGS);
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
      characters, 
    };

    if (type === 'FULL') {
      return {
        ...baseData,
        day,
        factionResources,
        logs
      };
    } else {
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
      if (data.day) setDay(data.day);
      if (data.characters) setCharacters(data.characters);
      if (data.factionResources) setFactionResources(data.factionResources);
      if (data.logs) setLogs(data.logs);
      
      setLogs(prev => [...prev, {
        id: generateId(),
        day: data.day || 1,
        message: '💾 저장된 게임을 불러왔습니다.',
        type: 'INFO',
        timestamp: Date.now()
      }]);

    } else if (data.type === 'ROSTER') {
      const importedChars = data.characters ? data.characters.map(c => ({
        ...c,
        status: Status.NORMAL,
        currentHp: (c.stats?.stamina || 50) * 2,
        currentSanity: (c.stats?.intelligence || 50) * 2,
        isInsane: false,
        kills: 0,
        saves: 0,
        battlesWon: 0
      })) : [];

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
    gameSettings, // Export Settings
    setGameSettings, // Export Setter
    handleNextDay,
    handleAddCharacter,
    handleUpdateCharacter,
    handleDeleteCharacter,
    handleHousingSave,
    handleReset,
    handleBattleComplete,
    handleUseItem,
    handleBuyItem,
    handleDebugSetMoney, // Export Cheat Function
    handleDebugAddItem, // Export Cheat Function
    handleUnequipItem, // Export Unequip
    exportData,
    importData
  };
};
