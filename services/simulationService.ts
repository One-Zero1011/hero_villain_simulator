
import { Character, Role, Status, LogEntry, GameSettings } from '../types/index';
import { 
  HERO_DAILY_EVENTS, 
  VILLAIN_DAILY_EVENTS, 
  CIVILIAN_DAILY_EVENTS, 
  VILLAIN_ATTACK_CIVILIAN_TEMPLATES,
  RECOVERY_EVENTS,
  DailyEventDefinition
} from '../data/events';
import { MBTI_LOGS, COMBINATION_LOGS } from '../data/mbti/index';
import { INSANITY_LOGS } from '../data/insanityEvents';
import { COMBINED_RELATIONSHIP_EVENTS as RELATIONSHIP_EVENTS } from '../data/relationships/index';
import { SUPERPOWERS } from '../data/options';
import { generateId, getRandom, formatTemplate, getRoleKey } from '../utils/helpers';

// Helper to get Role-based log template (Returns object with message and reward)
const getRoleBasedLog = (role: Role): DailyEventDefinition => {
  switch (role) {
    case Role.HERO: return getRandom(HERO_DAILY_EVENTS);
    case Role.VILLAIN: return getRandom(VILLAIN_DAILY_EVENTS);
    case Role.CIVILIAN: return getRandom(CIVILIAN_DAILY_EVENTS);
    default: return { message: "", reward: 0 };
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
  // Random Encounter (Acquaintance) -> Wider range
  if (relType === '지인') {
    return Math.floor(Math.random() * 11) - 5; // -5 to +5
  }
  // Neutral/Professional -> Small random fluctuation
  return Math.floor(Math.random() * 5) - 2; // -2 to +2
};

const FAMILY_RELATIONSHIPS = ['가족', '부모', '자식', '형제자매', '쌍둥이', '보호자', '피보호자'];

const GENERIC_INTERACTION_TEMPLATES = [
  "{actor}이(가) 우연히 {target}와(과) 마주쳐 가벼운 인사를 나눴습니다.",
  "{actor}이(가) {target}와(과) 날씨 이야기를 하며 어색함을 달랬습니다.",
  "{actor}이(가) {target}의 옷차림을 보고 관심을 보였습니다.",
  "{actor}이(가) {target}와(과) 눈이 마주치자 살짝 미소 지었습니다.",
  "{actor}이(가) {target}에게 길을 물어보며 대화를 텄습니다.",
  "{actor}이(가) {target}와(과) 사소한 일로 의견을 주고받았습니다.",
  "{actor}이(가) 지나가던 {target}을(를) 보고 아는 척을 했습니다."
];

export const processDailyEvents = (
  currentDay: number,
  characters: Character[],
  excludeIds: string[] = [], // Characters involved in battle shouldn't get daily events
  settings: GameSettings // Passed from hook
): { updatedCharacters: Character[]; newLogs: LogEntry[]; income: Record<Role, number> } => {
  let updatedCharacters = [...characters];
  const nextDay = currentDay + 1;
  
  // Log Containers
  const systemLogs: LogEntry[] = [];
  const individualLogs: LogEntry[] = [];
  const interactionLogs: LogEntry[] = [];
  const romanceLogs: LogEntry[] = [];
  const awakeningLogs: LogEntry[] = [];

  // Track stat changes for logs
  const statDeltas = new Map<string, { hp: number, sanity: number }>();
  
  // Track characters who already had a main event today (to prevent double logging)
  const charactersWithLog = new Set<string>();

  // Income Tracker
  const income: Record<Role, number> = {
    [Role.HERO]: 0,
    [Role.VILLAIN]: 0,
    [Role.CIVILIAN]: 0
  };

  // --- Phase 0: Sanity & HP Check ---
  updatedCharacters = updatedCharacters.map(char => {
    if (char.status === Status.DEAD || excludeIds.includes(char.id)) return char;

    const maxSanity = (char.stats?.intelligence || 50) * 2;
    const prevSanity = char.currentSanity ?? maxSanity;
    let newSanity = prevSanity;
    
    const maxHp = (char.stats?.stamina || 50) * 2;
    const prevHp = char.currentHp ?? maxHp;
    let newHp = prevHp;

    // Natural Recovery (Rest)
    const hpRecovery = Math.floor(maxHp * 0.1) + 5;
    if (newHp < maxHp) {
      newHp = Math.min(maxHp, newHp + hpRecovery);
    }
    
    // Natural Sanity Decay or Recovery
    if (char.status === Status.INJURED) {
      newSanity = Math.max(0, newSanity - Math.floor(Math.random() * 10));
    } else {
      newSanity = Math.max(0, Math.min(maxSanity, newSanity + (Math.random() > 0.6 ? 5 : -5)));
    }

    // Record Deltas
    const hpDiff = newHp - prevHp;
    const sanityDiff = newSanity - prevSanity;
    if (hpDiff !== 0 || sanityDiff !== 0) {
      statDeltas.set(char.id, { hp: hpDiff, sanity: sanityDiff });
    }

    // Check Sanity Threshold (10%)
    const sanityThreshold = maxSanity * 0.1;
    let isInsane = char.isInsane;

    if (newSanity <= sanityThreshold) {
      if (!isInsane && Math.random() < 0.6) {
        isInsane = true;
        systemLogs.push({
          id: generateId(),
          day: nextDay,
          message: `[경고] ${char.name}의 정신력이 한계에 도달하여 정신 착란 증세를 보입니다!`,
          type: 'INSANITY',
          timestamp: Date.now(),
          statChanges: { sanity: sanityDiff }
        });
      }
    } else if (newSanity > sanityThreshold * 2) {
      if (isInsane) {
        isInsane = false;
        systemLogs.push({
          id: generateId(),
          day: nextDay,
          message: `${char.name}이(가) 안정을 되찾고 제정신으로 돌아왔습니다.`,
          type: 'INFO',
          timestamp: Date.now(),
          statChanges: { sanity: sanityDiff }
        });
      }
    }

    return { ...char, currentSanity: newSanity, currentHp: newHp, isInsane };
  });

  // --- Phase 1: Recovery (Status) ---
  updatedCharacters = updatedCharacters.map(char => {
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
      
      // Mark as having logged an event
      charactersWithLog.add(villain.id);
      charactersWithLog.add(victim.id);

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
          timestamp: Date.now(),
          statChanges: { hp: -(victim.currentHp || 100) } // Full HP loss
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

  // Filter Active Characters for Logs
  const activeCharacters = updatedCharacters.filter(c => c.status !== Status.DEAD && !excludeIds.includes(c.id));

  // --- Phase 3: Individual Daily Logs & Income ---
  // Ensure EVERY character gets a log (100% chance unless handled by system events above)
  const shuffledActiveChars = [...activeCharacters].sort(() => 0.5 - Math.random());

  shuffledActiveChars.forEach((char) => {
    // If they already had a major event (e.g. Villain attack), skip daily log to prevent spam
    if (charactersWithLog.has(char.id)) return;

    let template = "";
    let reward = 0;
    
    // 1. Insanity Override
    if (char.isInsane) {
      if (Math.random() < 0.6) { // 60% Chance to show Insanity behavior
        template = getRandom(INSANITY_LOGS);
      } 
      // 40% Chance to act semi-normally (flows to next check)
    } 

    // 2. Normal Behavior (Flavor or Role)
    if (!template) {
      // 75% Chance for Flavor, 25% Chance for Role
      const isFlavorTurn = Math.random() < 0.75; 

      if (isFlavorTurn) {
        // Case: Has Personality
        if (char.personality) {
          // Try Combo Log (MBTI + Personality)
          const key = `${char.mbti}_${char.personality}`;
          const combos = COMBINATION_LOGS[key];
          if (combos && combos.length > 0) {
            template = getRandom(combos);
            reward = 50; // Living allowance
          }
        }
        
        // Case: No Personality OR Combo Missing (Fallback)
        if (!template) {
           const mbtiLogs = MBTI_LOGS[char.mbti];
           if (mbtiLogs && mbtiLogs.length > 0) {
             template = getRandom(mbtiLogs);
             reward = 50; // Living allowance
           }
        }
      }

      // 3. Fallback to Role Log (If 25% roll OR Flavor log not found)
      if (!template) {
        const event = getRoleBasedLog(char.role);
        template = event.message;
        reward = event.reward;
      }
    }

    // Apply Income
    if (reward !== 0) {
      income[char.role] += reward;
    }

    if (template) {
      let message = formatTemplate(template, { name: char.name });
      if (reward !== 0) {
        const sign = reward > 0 ? '+' : '';
        message += ` (${sign}${reward}G)`;
      }

      // Attach stat changes calculated in Phase 0 to this log
      const changes = statDeltas.get(char.id);

      individualLogs.push({
        id: generateId(),
        day: nextDay,
        message: message,
        type: char.isInsane && template.includes(INSANITY_LOGS[0]) ? 'INSANITY' : 'INFO', // Simple type check
        timestamp: Date.now(),
        statChanges: changes
      });
      
      statDeltas.delete(char.id);
      charactersWithLog.add(char.id); // Mark as logged
    }
  });

  // Create residual logs for significant stat changes not captured by individual logs (fallback)
  statDeltas.forEach((changes, charId) => {
    if ((Math.abs(changes.hp) > 5 || Math.abs(changes.sanity) > 5) && !charactersWithLog.has(charId)) {
        const char = updatedCharacters.find(c => c.id === charId);
        if (char) {
            individualLogs.push({
                id: generateId(),
                day: nextDay,
                message: `${char.name}이(가) 휴식을 취하며 상태를 점검했습니다.`,
                type: 'INFO',
                timestamp: Date.now(),
                statChanges: changes
            });
        }
    }
  });

  // --- Phase 4: Relationship Interactions ---
  // (Interactions are additional events, they don't replace daily logs but add flavor)
  const possibleInteractions: { actor: Character, target: Character, relType: string }[] = [];

  // 1. Existing Relationships
  activeCharacters.forEach(actor => {
    if (actor.isInsane && Math.random() > 0.2) return; 

    actor.relationships.forEach(rel => {
      const target = activeCharacters.find(c => c.id === rel.targetId);
      if (target) {
        possibleInteractions.push({ actor, target, relType: rel.type });
      }
    });
  });

  // 2. New Random Encounters (Strangers)
  // Try to find pairs that don't have relationships
  const STRANGER_ATTEMPTS = Math.max(2, Math.floor(activeCharacters.length / 2));
  for(let i=0; i<STRANGER_ATTEMPTS; i++) {
      const actor = getRandom(activeCharacters);
      const target = getRandom(activeCharacters);
      
      if (actor.id !== target.id) {
          const hasRel = actor.relationships.some(r => r.targetId === target.id);
          if (!hasRel) {
              possibleInteractions.push({ actor, target, relType: '지인' });
          }
      }
  }

  // Increase interaction count to allow for new connections
  const targetInteractionCount = Math.max(2, Math.floor(activeCharacters.length * 0.6));
  
  const selectedInteractions = possibleInteractions
    .sort(() => 0.5 - Math.random())
    .slice(0, targetInteractionCount);

  const affinityUpdates = new Map<string, Map<string, number>>(); 

  selectedInteractions.forEach(({ actor, target, relType }) => {
    let templates: string[] = [];
    
    const typeGroup = RELATIONSHIP_EVENTS[relType];
    if (typeGroup) {
      const roleKey = getRoleKey(actor.role, target.role);
      templates = typeGroup[roleKey] || typeGroup['COMMON'] || [];
    }
    
    // Fallback for '지인' or undefined types
    if (!templates || templates.length === 0) {
        templates = GENERIC_INTERACTION_TEMPLATES;
    }
      
    if (templates.length > 0) {
        // Calculate affinity change
        const affinityChange = getAffinityChange(relType);
        const sign = affinityChange > 0 ? '+' : '';
        const affinityLogStr = ` (호감도 ${sign}${affinityChange})`;

        interactionLogs.push({
          id: generateId(),
          day: nextDay,
          message: formatTemplate(getRandom(templates), { actor: actor.name, target: target.name }) + affinityLogStr,
          type: 'EVENT',
          timestamp: Date.now()
        });
        
        // Update Actor -> Target
        // Use 0 as base affinity if not existing
        const actorRel = actor.relationships.find(r => r.targetId === target.id);
        const currentAffinityActor = actorRel?.affinity || 0;
        const newAffinityActor = Math.max(-100, Math.min(100, currentAffinityActor + affinityChange));
        
        if (!affinityUpdates.has(actor.id)) affinityUpdates.set(actor.id, new Map());
        affinityUpdates.get(actor.id)?.set(target.id, newAffinityActor);

        // Update Target -> Actor (Mutual effect)
        const targetRel = target.relationships.find(r => r.targetId === actor.id);
        const currentAffinityTarget = targetRel?.affinity || 0;
        const newAffinityTarget = Math.max(-100, Math.min(100, currentAffinityTarget + affinityChange));

        if (!affinityUpdates.has(target.id)) affinityUpdates.set(target.id, new Map());
        affinityUpdates.get(target.id)?.set(actor.id, newAffinityTarget);
    }
  });

  // Apply Affinity Updates (Handle Adding New Relationships)
  if (affinityUpdates.size > 0) {
    updatedCharacters = updatedCharacters.map(char => {
      const updatesForChar = affinityUpdates.get(char.id);
      if (updatesForChar) {
        let newRelationships = [...char.relationships];
        const appliedTargets = new Set<string>();

        // 1. Update existing
        newRelationships = newRelationships.map(rel => {
          if (updatesForChar.has(rel.targetId)) {
            appliedTargets.add(rel.targetId);
            return { ...rel, affinity: updatesForChar.get(rel.targetId) };
          }
          return rel;
        });

        // 2. Add new 'Acquaintance' relationships
        updatesForChar.forEach((newVal, targetId) => {
            if (!appliedTargets.has(targetId)) {
                // Find target name (either in activeCharacters or original list)
                const targetChar = activeCharacters.find(c => c.id === targetId) || updatedCharacters.find(c => c.id === targetId);
                if (targetChar) {
                    newRelationships.push({
                        targetId,
                        targetName: targetChar.name,
                        type: '지인',
                        affinity: newVal,
                        isMutual: false 
                    });
                }
            }
        });

        return { ...char, relationships: newRelationships };
      }
      return char;
    });
  }

  // --- Phase 5: Relationship Evolution (Lovers) ---
  const romanceUpdates = new Map<string, string>(); 

  if (!settings.globalNoRomance) {
    updatedCharacters.forEach(actor => {
      if (actor.status === Status.DEAD) return;

      actor.relationships.forEach(rel => {
        if ((rel.affinity || 0) < 100) return; 
        if (rel.type === '연인' || rel.type === '부부') return; 
        
        const target = updatedCharacters.find(c => c.id === rel.targetId);
        if (!target || target.status === Status.DEAD) return;

        const keyForward = `${actor.id}-${target.id}`;
        const keyBackward = `${target.id}-${actor.id}`;
        if (romanceUpdates.has(keyForward) || romanceUpdates.has(keyBackward)) return;

        // Constraint Checks
        if (settings.pureLoveMode) {
          const actorHasLover = actor.relationships.some(r => r.type === '연인' || r.type === '부부');
          const targetHasLover = target.relationships.some(r => r.type === '연인' || r.type === '부부');
          const actorGettingLover = Array.from(romanceUpdates.keys()).some(k => k.includes(actor.id));
          const targetGettingLover = Array.from(romanceUpdates.keys()).some(k => k.includes(target.id));

          if (actorHasLover || targetHasLover || actorGettingLover || targetGettingLover) return; 
        }

        const isSameSex = actor.gender === target.gender;
        if (isSameSex && !settings.allowSameSex) return;
        if (!isSameSex && !settings.allowHetero) return;

        if (settings.preventMinorAdultDating) {
          const isActorAdult = actor.age >= 20;
          const isTargetAdult = target.age >= 20;
          if (isActorAdult !== isTargetAdult) return; 
        }

        if (!settings.allowFamilyDating) {
          if (FAMILY_RELATIONSHIPS.includes(rel.type)) return;
        }

        if (Math.random() > 0.1) return;

        romanceLogs.push({
          id: generateId(),
          day: nextDay,
          message: `💖 [축하합니다] ${actor.name}와(과) ${target.name}의 호감도가 극에 달해 연인이 되었습니다!`,
          type: 'ROMANCE',
          timestamp: Date.now(),
          statChanges: { sanity: 20 } // Bonus sanity for romance
        });

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
  const breakupUpdates = new Set<string>();

  updatedCharacters.forEach(actor => {
    if (actor.status === Status.DEAD) return;

    actor.relationships.forEach(rel => {
      if (rel.type !== '연인') return;

      const target = updatedCharacters.find(c => c.id === rel.targetId);
      if (!target) return;

      const keyForward = `${actor.id}-${target.id}`;
      const keyBackward = `${target.id}-${actor.id}`;
      if (breakupUpdates.has(keyForward) || breakupUpdates.has(keyBackward)) return;

      const aff = rel.affinity || 0;
      let breakupChance = 0;

      if (aff < 0) breakupChance = 0.3;      
      else if (aff < 50) breakupChance = 0.05; 
      else breakupChance = 0.01;             

      if (Math.random() < breakupChance) {
        romanceLogs.push({
          id: generateId(),
          day: nextDay,
          message: `💔 [이별] ${actor.name}와(과) ${target.name}의 관계가 끝났습니다. 이제 그들은 남남(전 연인)입니다. (호감도 -30)`,
          type: 'ROMANCE',
          timestamp: Date.now(),
          statChanges: { sanity: -15 } // Sanity penalty for breakup
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
  updatedCharacters = updatedCharacters.map(char => {
    if (char.role !== Role.CIVILIAN || char.status === Status.DEAD || excludeIds.includes(char.id)) return char;

    if (Math.random() < 0.01) { 
      const newRole = Math.random() > 0.5 ? Role.HERO : Role.VILLAIN;
      const newPowerSource = getRandom(SUPERPOWERS);
      
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
        timestamp: Date.now(),
        statChanges: { hp: 50, sanity: 50 } // Boost stats
      });

      return {
        ...char,
        role: newRole,
        superpower: newPowerSource,
        stats: newStats,
        power: powerScore,
        currentHp: newStats.stamina * 2,
        currentSanity: newStats.intelligence * 2,
        isInsane: false
      };
    }
    return char;
  });

  return { 
    updatedCharacters, 
    newLogs: [...systemLogs, ...awakeningLogs, ...individualLogs, ...interactionLogs, ...romanceLogs],
    income // Return the calculated income for this day
  };
};
