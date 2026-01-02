
import { Character, Role, Status, LogEntry, RolePairKey } from '../types/index';
import { 
  HERO_DAILY_EVENTS, 
  VILLAIN_DAILY_EVENTS, 
  CIVILIAN_DAILY_EVENTS, 
  VILLAIN_ATTACK_CIVILIAN_TEMPLATES,
  RECOVERY_EVENTS
} from '../data/events';
import { MBTI_LOGS, COMBINATION_LOGS } from '../data/mbti/index';
import { INSANITY_LOGS } from '../data/insanityEvents';
import { COMBINED_RELATIONSHIP_EVENTS as RELATIONSHIP_EVENTS } from '../data/relationships/index';
import { generateId, getRandom, formatTemplate, getRoleKey } from '../utils/helpers';

// Helper to get Role-based log template
const getRoleBasedLog = (role: Role): string => {
  switch (role) {
    case Role.HERO: return getRandom(HERO_DAILY_EVENTS);
    case Role.VILLAIN: return getRandom(VILLAIN_DAILY_EVENTS);
    case Role.CIVILIAN: return getRandom(CIVILIAN_DAILY_EVENTS);
    default: return "";
  }
};

export const processDailyEvents = (
  currentDay: number,
  characters: Character[],
  excludeIds: string[] = [] // Characters involved in battle shouldn't get daily events
): { updatedCharacters: Character[]; newLogs: LogEntry[] } => {
  let updatedCharacters = [...characters];
  const nextDay = currentDay + 1;
  
  // Log Containers (To maintain order: System -> Individual -> Interaction)
  const systemLogs: LogEntry[] = [];
  const individualLogs: LogEntry[] = [];
  const interactionLogs: LogEntry[] = [];

  // --- Phase 0: Sanity Check & Decay ---
  updatedCharacters = updatedCharacters.map(char => {
    if (char.status === Status.DEAD || excludeIds.includes(char.id)) return char;

    const maxSanity = (char.stats?.intelligence || 50) * 2;
    let newSanity = char.currentSanity ?? maxSanity;
    
    // Natural Decay or Recovery
    if (char.status === Status.INJURED) {
      newSanity = Math.max(0, newSanity - Math.floor(Math.random() * 10));
    } else {
      // Small fluctuation
      newSanity = Math.max(0, Math.min(maxSanity, newSanity + (Math.random() > 0.6 ? 5 : -5)));
    }

    // Check Sanity Threshold (10%)
    const sanityThreshold = maxSanity * 0.1;
    let isInsane = char.isInsane;

    if (newSanity <= sanityThreshold) {
      // 0~10% range: 60% chance to go INSANE
      if (!isInsane && Math.random() < 0.6) {
        isInsane = true;
        systemLogs.push({
          id: generateId(),
          day: nextDay,
          message: `[경고] ${char.name}의 정신력이 한계에 도달하여 정신 착란 증세를 보입니다!`,
          type: 'INSANITY',
          timestamp: Date.now()
        });
      }
    } else if (newSanity > sanityThreshold * 2) {
      // Recover if sanity goes back up safely (above 20%)
      if (isInsane) {
        isInsane = false;
        systemLogs.push({
          id: generateId(),
          day: nextDay,
          message: `${char.name}이(가) 안정을 되찾고 제정신으로 돌아왔습니다.`,
          type: 'INFO',
          timestamp: Date.now()
        });
      }
    }

    return { ...char, currentSanity: newSanity, isInsane };
  });

  // --- Phase 1: Recovery (System) ---
  updatedCharacters = updatedCharacters.map(char => {
    if (char.status === Status.INJURED) {
      // 30% chance to recover
      if (Math.random() < 0.3) {
        systemLogs.push({
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

  // --- Phase 2: Villain Harassment (System/Critical Event) ---
  const updates = new Map<string, Partial<Character>>();
  // Active characters excluding battle participants and dead ones
  const activeVillains = updatedCharacters.filter(c => c.role === Role.VILLAIN && c.status === Status.NORMAL && !c.isInsane && !excludeIds.includes(c.id));
  const potentialVictims = updatedCharacters.filter(c => c.role === Role.CIVILIAN && c.status === Status.NORMAL && !excludeIds.includes(c.id));

  activeVillains.forEach(villain => {
    if (potentialVictims.length > 0 && Math.random() < 0.3) {
      const victim = getRandom(potentialVictims);
      
      systemLogs.push({
        id: generateId(),
        day: nextDay,
        message: formatTemplate(getRandom(VILLAIN_ATTACK_CIVILIAN_TEMPLATES), { villain: villain.name, civilian: victim.name }),
        type: 'EVENT',
        timestamp: Date.now()
      });

      // 10% chance civilian dies
      if (Math.random() < 0.1) {
        updates.set(victim.id, { status: Status.DEAD });
        const currentKills = updates.get(villain.id)?.kills ?? villain.kills;
        updates.set(villain.id, { ...updates.get(villain.id), kills: currentKills + 1 });
        
        systemLogs.push({ 
          id: generateId(), 
          day: nextDay, 
          message: `비극적인 소식입니다. ${victim.name}이(가) ${villain.name}의 손에 희생되었습니다.`, 
          type: 'DEATH', 
          timestamp: Date.now() 
        });
      }
    }
  });

  // Apply Villain/Victim updates immediately so dead chars don't get logs
  updatedCharacters = updatedCharacters.map(char => {
    if (updates.has(char.id)) {
      return { ...char, ...updates.get(char.id) };
    }
    return char;
  });

  // Filter Active Characters for Logs (Alive & Not in Battle)
  const activeCharacters = updatedCharacters.filter(c => c.status !== Status.DEAD && !excludeIds.includes(c.id));

  // --- Phase 3: Individual Daily Logs ---
  // Updated Logic for Insanity:
  // - If Insane: 55% Special Log, 30% MBTI/Personality, 15% Role
  // - If Normal: 70% MBTI/Personality, 30% Role
  activeCharacters.forEach(char => {
    if (Math.random() > 0.4) return; // Skip logic (reduced trigger rate slightly to avoid clutter)

    let template = "";
    const rand = Math.random() * 100;

    if (char.isInsane) {
      // Insane Logic
      if (rand < 55) {
        // 55% Insanity Log
        template = getRandom(INSANITY_LOGS);
      } else if (rand < 85) {
        // 30% MBTI/Personality
        template = getPersonalityLog(char);
      } else {
        // 15% Role
        template = getRoleBasedLog(char.role);
      }
    } else {
      // Normal Logic
      if (rand < 70) {
        // 70% MBTI/Personality
        template = getPersonalityLog(char);
      } else {
        // 30% Role
        template = getRoleBasedLog(char.role);
      }
    }

    if (template) {
      individualLogs.push({
        id: generateId(),
        day: nextDay,
        message: formatTemplate(template, { name: char.name }),
        type: char.isInsane ? 'INSANITY' : 'INFO',
        timestamp: Date.now()
      });
    }
  });

  // --- Phase 4: Relationship Interactions ---
  // Collect ALL valid relationship pairs
  const possibleInteractions: { actor: Character, target: Character, relType: string }[] = [];

  activeCharacters.forEach(actor => {
    // Insane characters are less likely to have normal interactions
    if (actor.isInsane && Math.random() > 0.2) return; 

    actor.relationships.forEach(rel => {
      const target = activeCharacters.find(c => c.id === rel.targetId);
      if (target) {
        possibleInteractions.push({ actor, target, relType: rel.type });
      }
    });
  });

  const targetInteractionCount = Math.max(1, Math.floor(activeCharacters.length * 0.4));
  
  const selectedInteractions = possibleInteractions
    .sort(() => 0.5 - Math.random())
    .slice(0, targetInteractionCount);

  selectedInteractions.forEach(({ actor, target, relType }) => {
    const typeGroup = RELATIONSHIP_EVENTS[relType];
    if (typeGroup) {
      const roleKey = getRoleKey(actor.role, target.role);
      const templates = typeGroup[roleKey] || typeGroup['COMMON'] || [];
      
      if (templates.length > 0) {
        interactionLogs.push({
          id: generateId(),
          day: nextDay,
          message: formatTemplate(getRandom(templates), { actor: actor.name, target: target.name }),
          type: 'EVENT',
          timestamp: Date.now()
        });
      }
    }
  });

  return { 
    updatedCharacters, 
    newLogs: [...systemLogs, ...individualLogs, ...interactionLogs] 
  };
};

// Helper function to extract personality/MBTI logic
const getPersonalityLog = (char: Character): string => {
  let template = "";
  if (char.personality) {
    const key = `${char.mbti}_${char.personality}`;
    const combos = COMBINATION_LOGS[key];
    if (combos && combos.length > 0) {
      template = getRandom(combos);
    } else {
      template = getRoleBasedLog(char.role);
    }
  } else {
    const mbtiLogs = MBTI_LOGS[char.mbti];
    if (mbtiLogs && mbtiLogs.length > 0) {
      template = getRandom(mbtiLogs);
    } else {
      template = getRoleBasedLog(char.role);
    }
  }
  return template;
}
