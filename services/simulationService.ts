import { Character, Role, Status, LogEntry } from '../types/index';
import { 
  HERO_DAILY_EVENTS, 
  VILLAIN_DAILY_EVENTS, 
  CIVILIAN_DAILY_EVENTS, 
  VILLAIN_ATTACK_CIVILIAN_TEMPLATES,
  RECOVERY_EVENTS
} from '../data/events';

// Helper to get random item from array
const getRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper to format string templates
const format = (template: string, args: Record<string, string>) => {
  let str = template;
  for (const key in args) {
    str = str.replace(new RegExp(`\\{${key}\\}`, 'g'), args[key]);
  }
  return str;
};

// Generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export const processDailyEvents = (
  currentDay: number,
  characters: Character[],
  excludeIds: string[] = [] // Characters involved in battle shouldn't get daily events
): { updatedCharacters: Character[]; newLogs: LogEntry[] } => {
  let updatedCharacters = [...characters];
  const newLogs: LogEntry[] = [];
  const nextDay = currentDay + 1;

  // 1. Recovery Phase (Process for everyone)
  updatedCharacters = updatedCharacters.map(char => {
    if (char.status === Status.INJURED) {
      // 30% chance to recover
      if (Math.random() < 0.3) {
        newLogs.push({
          id: generateId(),
          day: nextDay,
          message: format(getRandom(RECOVERY_EVENTS), { name: char.name }),
          type: 'INFO',
          timestamp: Date.now()
        });
        return { ...char, status: Status.NORMAL };
      }
    }
    return char;
  });

  // 2. Villain Harassment (Only for those not excluded)
  const activeVillains = updatedCharacters.filter(c => c.role === Role.VILLAIN && c.status === Status.NORMAL && !excludeIds.includes(c.id));
  const potentialVictims = updatedCharacters.filter(c => c.role === Role.CIVILIAN && c.status === Status.NORMAL && !excludeIds.includes(c.id));

  activeVillains.forEach(villain => {
    // 30% chance to harass a civilian if no battle happened for this villain
    if (potentialVictims.length > 0 && Math.random() < 0.3) {
      const victim = getRandom(potentialVictims);
      
      newLogs.push({
        id: generateId(),
        day: nextDay,
        message: format(getRandom(VILLAIN_ATTACK_CIVILIAN_TEMPLATES), { villain: villain.name, civilian: victim.name }),
        type: 'EVENT',
        timestamp: Date.now()
      });

      // 10% chance civilian dies from harassment
      if (Math.random() < 0.1) {
        const vicIndex = updatedCharacters.findIndex(c => c.id === victim.id);
        const vilIndex = updatedCharacters.findIndex(c => c.id === villain.id);
        
        updatedCharacters[vicIndex].status = Status.DEAD;
        updatedCharacters[vilIndex].kills += 1;
        
        newLogs.push({ 
          id: generateId(), 
          day: nextDay, 
          message: `비극적인 소식입니다. ${victim.name}이(가) ${villain.name}의 손에 희생되었습니다.`, 
          type: 'DEATH', 
          timestamp: Date.now() 
        });
      }
    }
  });

  // 3. Daily Flavor Text (For random characters not doing anything else)
  updatedCharacters.forEach(char => {
    if (char.status === Status.DEAD || excludeIds.includes(char.id)) return;
    
    // 20% chance for flavor text
    if (Math.random() < 0.2) {
      let template = "";
      switch (char.role) {
        case Role.HERO: template = getRandom(HERO_DAILY_EVENTS); break;
        case Role.VILLAIN: template = getRandom(VILLAIN_DAILY_EVENTS); break;
        case Role.CIVILIAN: template = getRandom(CIVILIAN_DAILY_EVENTS); break;
      }
      
      if (template) {
        newLogs.push({
          id: generateId(),
          day: nextDay,
          message: format(template, { name: char.name }),
          type: 'INFO',
          timestamp: Date.now()
        });
      }
    }
  });

  return { updatedCharacters, newLogs };
};