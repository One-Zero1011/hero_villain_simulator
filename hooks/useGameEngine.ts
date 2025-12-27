import { useState, useCallback } from 'react';
import { Character, LogEntry, Role, Status, Housing } from '../types/index';
import { processDailyEvents } from '../services/simulationService';

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
    battlesWon: 5 
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
    battlesWon: 4 
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
    battlesWon: 0 
  },
];

export const useGameEngine = () => {
  const [day, setDay] = useState(1);
  const [characters, setCharacters] = useState<Character[]>(INITIAL_CHARACTERS);
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
    // Update Battle Stats
    const updatedChars = [...characters];
    const winnerIdx = updatedChars.findIndex(c => c.id === winner.id);
    const loserIdx = updatedChars.findIndex(c => c.id === loser.id);

    // Apply Stats
    updatedChars[winnerIdx].battlesWon += 1;
    updatedChars[winnerIdx].power = Math.min(100, updatedChars[winnerIdx].power + 2); // Cap at 100

    // Determine Loser Fate
    const isDeath = Math.random() < 0.2; // 20% chance of death
    updatedChars[loserIdx].status = isDeath ? Status.DEAD : Status.INJURED;
    
    // Create Log Entries
    const battleLogs: LogEntry[] = [
      {
        id: `battle-${Date.now()}`,
        day: day + 1,
        message: `⚔️ 긴급 속보! ${winner.name}와(과) ${loser.name}의 치열한 전투가 벌어졌습니다!`,
        type: 'BATTLE',
        timestamp: Date.now()
      },
      ...battleLogTexts.slice(-3).map((text, i) => ({ // Add last 3 lines of combat log to main log
        id: `battle-detail-${i}-${Date.now()}`,
        day: day + 1,
        message: `> ${text}`,
        type: 'INFO' as const,
        timestamp: Date.now()
      })),
      {
        id: `battle-result-${Date.now()}`,
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

  const handleAddCharacter = (newCharData: Omit<Character, 'id' | 'status' | 'kills' | 'saves' | 'battlesWon'>) => {
    const newChar: Character = {
      id: Date.now().toString(),
      ...newCharData,
      status: Status.NORMAL,
      kills: 0,
      saves: 0,
      battlesWon: 0
    };
    
    setCharacters(prev => [...prev, newChar]);
    
    // Default system log
    const systemLogs: LogEntry[] = [{
      id: `new-${newChar.id}`,
      day: day,
      message: `[관리자] 새로운 ${newChar.role} "${newChar.name}"(이)가 시스템에 등록되었습니다.`,
      type: 'INFO',
      timestamp: Date.now()
    }];

    // Relationship logs
    if (newChar.relationships && newChar.relationships.length > 0) {
      newChar.relationships.forEach((rel, idx) => {
        systemLogs.push({
          id: `rel-${newChar.id}-${idx}`,
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
        id: `del-${id}`,
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
      id: `house-${Date.now()}`,
      day: day,
      message: `[시스템] ${charName}의 본거지가 리모델링 되었습니다.`,
      type: 'INFO',
      timestamp: Date.now()
    }]);
  };

  const handleReset = () => {
    setDay(1);
    setCharacters(INITIAL_CHARACTERS);
    setLogs([{
      id: 'init',
      day: 1,
      message: '시스템이 초기화되었습니다. 시뮬레이션을 다시 시작합니다.',
      type: 'INFO',
      timestamp: Date.now()
    }]);
  };

  return {
    day,
    characters,
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
    handleBattleComplete
  };
};