
import { Character, Role, Status, LogEntry, GameSettings } from '../types/index';
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
import { SUPERPOWERS } from '../data/options';
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

// Helper to determine affinity change based on relationship type
// Returns a random change value
const getAffinityChange = (relType: string): number => {
  // Friendly types -> Increase affinity
  if (['동료', '절친', '소꿉친구', '생명의 은인', '부부', '연인', '가족', '사이드킥'].includes(relType)) {
    return Math.floor(Math.random() * 5) + 1; // +1 to +5
  }
  // Hostile types -> Decrease affinity
  if (['라이벌', '원수', '배신자', '스토커', '애증'].includes(relType)) {
    return -(Math.floor(Math.random() * 5) + 1); // -1 to -5
  }
  // Neutral/Professional -> Small random fluctuation
  return Math.floor(Math.random() * 5) - 2; // -2 to +2
};

const FAMILY_RELATIONSHIPS = ['가족', '부모', '자식', '형제자매', '쌍둥이', '보호자', '피보호자'];

export const processDailyEvents = (
  currentDay: number,
  characters: Character[],
  excludeIds: string[] = [], // Characters involved in battle shouldn't get daily events
  settings: GameSettings // Passed from hook
): { updatedCharacters: Character[]; newLogs: LogEntry[] } => {
  let updatedCharacters = [...characters];
  const nextDay = currentDay + 1;
  
  // Log Containers (To maintain order: System -> Individual -> Interaction -> Romance -> Awakening)
  const systemLogs: LogEntry[] = [];
  const individualLogs: LogEntry[] = [];
  const interactionLogs: LogEntry[] = [];
  const romanceLogs: LogEntry[] = [];
  const awakeningLogs: LogEntry[] = [];

  // --- Phase 0: Sanity & HP Check ---
  updatedCharacters = updatedCharacters.map(char => {
    if (char.status === Status.DEAD || excludeIds.includes(char.id)) return char;

    const maxSanity = (char.stats?.intelligence || 50) * 2;
    let newSanity = char.currentSanity ?? maxSanity;
    
    const maxHp = (char.stats?.stamina || 50) * 2;
    let newHp = char.currentHp ?? maxHp;

    // Natural Recovery (Rest)
    // Recover 10% + 5 HP naturally per day if not dead
    const hpRecovery = Math.floor(maxHp * 0.1) + 5;
    if (newHp < maxHp) {
      newHp = Math.min(maxHp, newHp + hpRecovery);
    }
    
    // Natural Sanity Decay or Recovery
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

    return { ...char, currentSanity: newSanity, currentHp: newHp, isInsane };
  });

  // --- Phase 1: Recovery (Status) ---
  updatedCharacters = updatedCharacters.map(char => {
    // If Injured, try to recover to NORMAL if HP is sufficient (e.g. > 50%)
    // Or random small chance to recover anyway
    if (char.status === Status.INJURED) {
      const maxHp = (char.stats?.stamina || 50) * 2;
      const currentHp = char.currentHp ?? 0;
      
      const isRecovered = (currentHp > maxHp * 0.5) || (Math.random() < 0.3); // High HP or 30% luck

      if (isRecovered) {
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
        updates.set(victim.id, { status: Status.DEAD, currentHp: 0 });
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

  // Map to store affinity updates to apply at the end of phase 4
  const affinityUpdates = new Map<string, Map<string, number>>(); 
  // Key: CharID, Value: Map<TargetID, NewAffinity>

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

        // Calculate Affinity Change
        const affinityChange = getAffinityChange(relType);
        
        // Prepare update for Actor -> Target
        const actorRel = actor.relationships.find(r => r.targetId === target.id);
        if (actorRel) {
          const currentAffinity = actorRel.affinity || 0;
          const newAffinity = Math.max(-100, Math.min(100, currentAffinity + affinityChange));
          
          if (!affinityUpdates.has(actor.id)) affinityUpdates.set(actor.id, new Map());
          affinityUpdates.get(actor.id)?.set(target.id, newAffinity);
        }

        // If mutual (or if target also has relationship), update target -> actor too
        const targetRel = target.relationships.find(r => r.targetId === actor.id);
        if (targetRel) {
           const currentAffinity = targetRel.affinity || 0;
           const newAffinity = Math.max(-100, Math.min(100, currentAffinity + affinityChange));

           if (!affinityUpdates.has(target.id)) affinityUpdates.set(target.id, new Map());
           affinityUpdates.get(target.id)?.set(actor.id, newAffinity);
        }
      }
    }
  });

  // Apply Affinity Updates
  if (affinityUpdates.size > 0) {
    updatedCharacters = updatedCharacters.map(char => {
      const updatesForChar = affinityUpdates.get(char.id);
      if (updatesForChar) {
        const newRelationships = char.relationships.map(rel => {
          if (updatesForChar.has(rel.targetId)) {
            return { ...rel, affinity: updatesForChar.get(rel.targetId) };
          }
          return rel;
        });
        return { ...char, relationships: newRelationships };
      }
      return char;
    });
  }

  // --- Phase 5: Relationship Evolution (Lovers) ---
  // Logic: 10% chance if affinity >= 100
  
  const romanceUpdates = new Map<string, string>(); // Key: "id1-id2", Value: New RelationType

  // Check if global no romance setting is active
  if (!settings.globalNoRomance) {
    updatedCharacters.forEach(actor => {
      // Dead characters cannot start romances
      if (actor.status === Status.DEAD) return;

      actor.relationships.forEach(rel => {
        // 1. Check eligibility conditions
        if ((rel.affinity || 0) < 100) return; // Must be 100
        if (rel.type === '연인' || rel.type === '부부') return; // Already lovers
        
        // Insanity check removed per request: Insane characters CAN romance now.

        const target = updatedCharacters.find(c => c.id === rel.targetId);
        if (!target || target.status === Status.DEAD) return;

        // Ensure we haven't already processed this pair in this loop
        const keyForward = `${actor.id}-${target.id}`;
        const keyBackward = `${target.id}-${actor.id}`;
        if (romanceUpdates.has(keyForward) || romanceUpdates.has(keyBackward)) return;

        // 2. Check Settings Constraints
        
        // Constraint A: Pure Love Mode (Monogamy)
        if (settings.pureLoveMode) {
          const actorHasLover = actor.relationships.some(r => r.type === '연인' || r.type === '부부');
          const targetHasLover = target.relationships.some(r => r.type === '연인' || r.type === '부부');
          
          // Race condition check: Check if they ALREADY got a lover in this specific loop cycle
          const actorGettingLover = Array.from(romanceUpdates.keys()).some(k => k.includes(actor.id));
          const targetGettingLover = Array.from(romanceUpdates.keys()).some(k => k.includes(target.id));

          if (actorHasLover || targetHasLover || actorGettingLover || targetGettingLover) return; // One of them is taken
        }

        // Constraint B: Gender Settings (Same-Sex / Hetero)
        const isSameSex = actor.gender === target.gender;
        if (isSameSex && !settings.allowSameSex) return;
        if (!isSameSex && !settings.allowHetero) return;

        // Constraint C: Minor-Adult Dating
        if (settings.preventMinorAdultDating) {
          const isActorAdult = actor.age >= 20;
          const isTargetAdult = target.age >= 20;
          if (isActorAdult !== isTargetAdult) return; // Different age groups -> Block
        }

        // Constraint D: Family Dating
        if (!settings.allowFamilyDating) {
          // Check if current relationship is family type
          if (FAMILY_RELATIONSHIPS.includes(rel.type)) return;
        }

        // 3. Check Random Chance (10%)
        if (Math.random() > 0.1) return;

        // 4. Evolve to Lovers
        romanceLogs.push({
          id: generateId(),
          day: nextDay,
          message: `💖 [축하합니다] ${actor.name}와(과) ${target.name}의 호감도가 극에 달해 연인이 되었습니다!`,
          type: 'ROMANCE',
          timestamp: Date.now()
        });

        // Mark for update (Both directions)
        romanceUpdates.set(keyForward, '연인');
      });
    });
  }

  // Apply Phase 5 Updates
  if (romanceUpdates.size > 0) {
    updatedCharacters = updatedCharacters.map(char => {
      const newRelationships = char.relationships.map(rel => {
        const keyForward = `${char.id}-${rel.targetId}`;
        const keyBackward = `${rel.targetId}-${char.id}`;
        
        if (romanceUpdates.has(keyForward) || romanceUpdates.has(keyBackward)) {
          return { ...rel, type: '연인' };
        }
        return rel;
      });
      return { ...char, relationships: newRelationships };
    });
  }

  // --- Phase 6: Relationship Dissolution (Breakups) ---
  // Logic: 
  // - Affinity < 0: 30% chance
  // - Affinity < 50: 5% chance
  // - Affinity >= 50: 1% chance
  
  const breakupUpdates = new Set<string>(); // Key: "id1-id2"

  updatedCharacters.forEach(actor => {
    // Dead characters do not initiate breakups
    if (actor.status === Status.DEAD) return;

    actor.relationships.forEach(rel => {
      // Only process '연인' relationships
      if (rel.type !== '연인') return;

      const target = updatedCharacters.find(c => c.id === rel.targetId);
      if (!target) return;

      // Avoid double processing
      const keyForward = `${actor.id}-${target.id}`;
      const keyBackward = `${target.id}-${actor.id}`;
      if (breakupUpdates.has(keyForward) || breakupUpdates.has(keyBackward)) return;

      // Probability Calculation
      const aff = rel.affinity || 0;
      let breakupChance = 0;

      if (aff < 0) breakupChance = 0.3;      // 30% if they hate each other
      else if (aff < 50) breakupChance = 0.05; // 5% if passion cooled
      else breakupChance = 0.01;             // 1% unexpected breakup

      if (Math.random() < breakupChance) {
        romanceLogs.push({
          id: generateId(),
          day: nextDay,
          message: `💔 [이별] ${actor.name}와(과) ${target.name}의 관계가 끝났습니다. 이제 그들은 남남(전 연인)입니다.`,
          type: 'ROMANCE', // Using ROMANCE type for visual consistency in logs
          timestamp: Date.now()
        });
        
        breakupUpdates.add(keyForward);
      }
    });
  });

  // Apply Phase 6 Updates
  if (breakupUpdates.size > 0) {
    updatedCharacters = updatedCharacters.map(char => {
      const newRelationships = char.relationships.map(rel => {
        const keyForward = `${char.id}-${rel.targetId}`;
        const keyBackward = `${rel.targetId}-${char.id}`;
        
        if (breakupUpdates.has(keyForward) || breakupUpdates.has(keyBackward)) {
          // Change type to '전 연인' and significantly reduce affinity
          const currentAff = rel.affinity || 0;
          return { 
            ...rel, 
            type: '전 연인', 
            affinity: Math.max(-100, currentAff - 30) 
          };
        }
        return rel;
      });
      return { ...char, relationships: newRelationships };
    });
  }

  // --- Phase 7: Awakening (Civilian -> Super) ---
  // Logic: 1% chance for any living civilian to awaken
  
  updatedCharacters = updatedCharacters.map(char => {
    if (char.role !== Role.CIVILIAN || char.status === Status.DEAD || excludeIds.includes(char.id)) return char;

    // 1% chance
    if (Math.random() < 0.01) { 
      const newRole = Math.random() > 0.5 ? Role.HERO : Role.VILLAIN;
      const newPowerSource = getRandom(SUPERPOWERS);
      
      // Stats Boost (Civilian stats are usually low, boost to 40-100)
      const newStats = {
        strength: Math.floor(Math.random() * 60) + 40,
        intelligence: Math.floor(Math.random() * 60) + 40,
        stamina: Math.floor(Math.random() * 60) + 40,
        luck: Math.floor(Math.random() * 60) + 40
      };
      
      const powerScore = Math.floor((newStats.strength + newStats.intelligence + newStats.stamina + newStats.luck) / 4);

      const logIcon = newRole === Role.HERO ? "🛡️" : "💀";
      
      awakeningLogs.push({
        id: generateId(),
        day: nextDay,
        message: `⚡ [각성] 평범한 시민이었던 ${char.name}이(가) 갑자기 초능력 [${newPowerSource}]을(를) 개화했습니다! 이제부터 ${newRole === Role.HERO ? '히어로' : '빌런'}으로 활동합니다. ${logIcon}`,
        type: 'EVENT',
        timestamp: Date.now()
      });

      return {
        ...char,
        role: newRole,
        superpower: newPowerSource,
        stats: newStats,
        power: powerScore,
        currentHp: newStats.stamina * 2, // Full heal on awakening
        currentSanity: newStats.intelligence * 2,
        isInsane: false // Reset insanity if they awaken (clarity of mind)
      };
    }
    return char;
  });

  return { 
    updatedCharacters, 
    newLogs: [...systemLogs, ...awakeningLogs, ...individualLogs, ...interactionLogs, ...romanceLogs] 
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
