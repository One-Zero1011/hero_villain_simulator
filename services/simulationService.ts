
import { Character, Role, Status, LogEntry } from '../types/index';
import { 
  HERO_DAILY_EVENTS, 
  VILLAIN_DAILY_EVENTS, 
  CIVILIAN_DAILY_EVENTS, 
  VILLAIN_ATTACK_CIVILIAN_TEMPLATES,
  RECOVERY_EVENTS
} from '../data/events';
import { RELATIONSHIP_EVENTS } from '../data/relationshipEvents';
import { generateId, getRandom, formatTemplate } from '../utils/helpers';

export const processDailyEvents = (
  currentDay: number,
  characters: Character[],
  excludeIds: string[] = [] // Characters involved in battle shouldn't get daily events
): { updatedCharacters: Character[]; newLogs: LogEntry[] } => {
  let updatedCharacters = [...characters];
  const newLogs: LogEntry[] = [];
  const nextDay = currentDay + 1;

  // 1. Recovery Phase
  updatedCharacters = updatedCharacters.map(char => {
    if (char.status === Status.INJURED) {
      // 30% chance to recover
      if (Math.random() < 0.3) {
        newLogs.push({
          id: generateId(),
          day: nextDay,
          message: formatTemplate(getRandom(RECOVERY_EVENTS), { name: char.name }),
          type: 'INFO',
          timestamp: Date.now()
        });
        return { ...char, status: Status.NORMAL };
      }
    }
    return char;
  });

  // 2. Villain Harassment
  // Need to process interactions without mutating immediately, or map again.
  // We'll create a map of updates to apply
  const updates = new Map<string, Partial<Character>>();

  const activeVillains = updatedCharacters.filter(c => c.role === Role.VILLAIN && c.status === Status.NORMAL && !excludeIds.includes(c.id));
  const potentialVictims = updatedCharacters.filter(c => c.role === Role.CIVILIAN && c.status === Status.NORMAL && !excludeIds.includes(c.id));

  activeVillains.forEach(villain => {
    if (potentialVictims.length > 0 && Math.random() < 0.3) {
      const victim = getRandom(potentialVictims);
      
      newLogs.push({
        id: generateId(),
        day: nextDay,
        message: formatTemplate(getRandom(VILLAIN_ATTACK_CIVILIAN_TEMPLATES), { villain: villain.name, civilian: victim.name }),
        type: 'EVENT',
        timestamp: Date.now()
      });

      // 10% chance civilian dies
      if (Math.random() < 0.1) {
        updates.set(victim.id, { status: Status.DEAD });
        
        // Accumulate kills if multiple events (though simplified here)
        const currentKills = updates.get(villain.id)?.kills ?? villain.kills;
        updates.set(villain.id, { ...updates.get(villain.id), kills: currentKills + 1 });
        
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

  // Apply Villain/Victim updates
  updatedCharacters = updatedCharacters.map(char => {
    if (updates.has(char.id)) {
      return { ...char, ...updates.get(char.id) };
    }
    return char;
  });

  // 3. Relationship Events
  updatedCharacters.forEach(actor => {
    if (actor.status === Status.DEAD || excludeIds.includes(actor.id)) return;

    actor.relationships.forEach(rel => {
      const target = updatedCharacters.find(c => c.id === rel.targetId);
      if (!target || target.status === Status.DEAD || excludeIds.includes(target.id)) return;

      if (Math.random() < 0.15) {
        const templates = RELATIONSHIP_EVENTS[rel.type];
        if (templates && templates.length > 0) {
          const template = getRandom(templates);
          newLogs.push({
            id: generateId(),
            day: nextDay,
            message: formatTemplate(template, { actor: actor.name, target: target.name }),
            type: 'EVENT',
            timestamp: Date.now()
          });
        }
      }
    });
  });

  // 4. Daily Flavor Text
  updatedCharacters.forEach(char => {
    if (char.status === Status.DEAD || excludeIds.includes(char.id)) return;
    
    if (Math.random() < 0.15) {
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
          message: formatTemplate(template, { name: char.name }),
          type: 'INFO',
          timestamp: Date.now()
        });
      }
    }
  });

  return { updatedCharacters, newLogs };
};
