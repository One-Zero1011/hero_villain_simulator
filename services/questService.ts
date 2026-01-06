
import { Character, Quest, Role, Status, LogEntry, QuestType } from '../types/index';
import { generateId, getRandom, formatTemplate } from '../utils/helpers';

const getQuestTypeName = (type: QuestType) => {
    switch(type) {
        case 'SUBJUGATION': return '토벌';
        case 'ASSASSINATION': return '암살';
        case 'ESCORT': return '호위';
        default: return '임무';
    }
}

// Ongoing Progress Flavor Text
const PROGRESS_LOGS: Record<QuestType, string[]> = {
  'SUBJUGATION': [
    "{assignee}이(가) {target}의 은신처에 대한 단서를 찾고 있습니다.",
    "{assignee}이(가) {target}의 뒤를 쫓으며 포위망을 좁히고 있습니다.",
    "{assignee}이(가) {target}을(를) 잡기 위해 탐문 수사를 진행했습니다.",
    "{assignee}이(가) {target}과의 결전을 대비해 장비를 점검했습니다."
  ],
  'ASSASSINATION': [
    "{assignee}이(가) 어둠 속에서 {target}의 동선을 파악하고 있습니다.",
    "{assignee}이(가) {target}을(를) 처리하기 위한 독극물을 제조했습니다.",
    "{assignee}이(가) {target}의 저격 지점을 확보하고 기회를 엿보고 있습니다.",
    "{assignee}이(가) {target}에게 접근하기 위해 변장을 시도했습니다."
  ],
  'ESCORT': [
    "{assignee}이(가) {target}의 곁을 그림자처럼 지키고 있습니다.",
    "{assignee}이(가) {target}을(를) 위협하는 수상한 인물을 쫓아냈습니다.",
    "{assignee}이(가) {target}과 이동 경로를 상의하며 경계를 늦추지 않습니다.",
    "{assignee}이(가) 밤새 {target}의 집 앞을 지켰습니다."
  ]
};

// Helper to determine if a character accepts a quest
export const checkQuestAcceptance = (
  quest: Quest,
  candidate: Character,
  day: number
): { accepted: boolean; reason?: string } => {
  // 1. Basic Checks
  if (candidate.status === Status.DEAD || candidate.status === Status.RETIRED) return { accepted: false };
  if (candidate.isInsane) return { accepted: false }; // Insane chars don't take quests
  if (candidate.id === quest.targetId) return { accepted: false }; // Cannot accept quest against self

  // 2. Role Compatibility
  if (quest.type === 'SUBJUGATION') {
    // Usually Heroes accept this to catch Villains
    // Villains might accept to eliminate rivals
    if (candidate.role === Role.CIVILIAN) return { accepted: false };
  } else if (quest.type === 'ESCORT') {
    // Heroes accept this. Villains rarely do.
    if (candidate.role !== Role.HERO) return { accepted: false };
  } else if (quest.type === 'ASSASSINATION') {
    // Villains accept this. Heroes never do.
    if (candidate.role !== Role.VILLAIN) return { accepted: false };
  }

  // 3. Relationship Check (Don't hurt friends)
  const rel = candidate.relationships.find(r => r.targetId === quest.targetId);
  if (rel && (rel.affinity || 0) > 20) {
    return { accepted: false, reason: "친분으로 인한 거절" };
  }

  // 4. Probability Calculation based on Personality & Greed
  let baseChance = 0.3; // 30% base chance

  // Personality Modifiers
  if (candidate.personality === '탐욕스러운') {
    if (quest.reward >= 3000) baseChance += 0.4;
    else baseChance -= 0.1;
  }
  if (candidate.personality === '정의로운' && quest.type !== 'ASSASSINATION') {
    baseChance += 0.3;
  }
  if (candidate.personality === '게으른') {
    baseChance -= 0.2;
  }
  if (candidate.personality === '잔혹한' && (quest.type === 'ASSASSINATION' || quest.type === 'SUBJUGATION')) {
    baseChance += 0.3;
  }

  // Reward Modifier
  if (quest.reward >= 5000) baseChance += 0.2;
  if (quest.reward < 1000) baseChance -= 0.1;

  return { accepted: Math.random() < baseChance };
};

export const processQuestDaily = (
  quests: Quest[],
  characters: Character[],
  currentDay: number
): { updatedQuests: Quest[], questLogs: LogEntry[], finishedQuests: Quest[] } => {
  let updatedQuests = [...quests];
  const questLogs: LogEntry[] = [];
  const finishedQuests: Quest[] = [];

  // 1. Process Open Quests (Matching)
  updatedQuests = updatedQuests.map(q => {
    if (q.status !== 'OPEN') return q;

    // Find eligible candidates (who don't have a quest yet?) 
    const activeCandidates = characters.filter(c => 
      c.status !== Status.DEAD && 
      !updatedQuests.some(uq => uq.status === 'IN_PROGRESS' && uq.assignedCharId === c.id)
    );

    const shuffled = activeCandidates.sort(() => 0.5 - Math.random());
    
    for (const candidate of shuffled) {
      const { accepted } = checkQuestAcceptance(q, candidate, currentDay);
      if (accepted) {
        questLogs.push({
          id: generateId(),
          day: currentDay,
          message: `📜 [의뢰 수락] ${candidate.name}이(가) "${q.targetName} ${getQuestTypeName(q.type)}" 의뢰를 수락했습니다.`,
          type: 'QUEST',
          timestamp: Date.now()
        });
        return { ...q, status: 'IN_PROGRESS', assignedCharId: candidate.id, assignedCharName: candidate.name };
      }
    }
    return q;
  });

  // 2. Process In-Progress Quests (Checks)
  updatedQuests = updatedQuests.map(q => {
    if (q.status !== 'IN_PROGRESS') return q;

    const assignee = characters.find(c => c.id === q.assignedCharId);
    const target = characters.find(c => c.id === q.targetId);

    // Fail conditions
    if (!assignee || assignee.status === Status.DEAD) {
      questLogs.push({
        id: generateId(),
        day: currentDay,
        message: `❌ [의뢰 실패] 의뢰 수행자 ${q.assignedCharName}의 신변 이상으로 의뢰가 실패했습니다.`,
        type: 'QUEST',
        timestamp: Date.now()
      });
      return { ...q, status: 'FAILED' };
    }

    // Ongoing Flavor Text (30% chance per day if not finished)
    let isFinished = false;
    
    // Success/Fail Logic based on Type
    if (q.type === 'SUBJUGATION' || q.type === 'ASSASSINATION') {
      if (!target || target.status === Status.DEAD) {
        questLogs.push({
          id: generateId(),
          day: currentDay,
          message: `💰 [의뢰 완료] 목표 ${q.targetName} 제거 확인. ${assignee.name}에게 보상금 ${q.reward}G가 자동 지급되었습니다.`,
          type: 'QUEST',
          timestamp: Date.now()
        });
        finishedQuests.push(q);
        return { ...q, status: 'COMPLETED' };
      }
    } else if (q.type === 'ESCORT') {
        if (!target || target.status === Status.DEAD) {
             questLogs.push({
                id: generateId(),
                day: currentDay,
                message: `❌ [의뢰 실패] 호위 대상 ${q.targetName}이(가) 사망하여 의뢰가 실패했습니다.`,
                type: 'QUEST',
                timestamp: Date.now()
            });
            return { ...q, status: 'FAILED' };
        }
        
        // Decrement duration
        const newDuration = (q.duration || 1) - 1;
        if (newDuration <= 0) {
             questLogs.push({
                id: generateId(),
                day: currentDay,
                message: `💰 [의뢰 완료] ${assignee.name}이(가) ${q.targetName} 호위 임무를 완수했습니다. 보상금 ${q.reward}G가 자동 지급되었습니다.`,
                type: 'QUEST',
                timestamp: Date.now()
            });
            finishedQuests.push(q);
            return { ...q, status: 'COMPLETED', duration: 0 };
        }
        
        // If not finished, just update duration
        q = { ...q, duration: newDuration };
    }

    // Generate flavor text if not finished
    if (!isFinished && Math.random() < 0.4) {
      const templates = PROGRESS_LOGS[q.type];
      if (templates) {
        const msg = formatTemplate(getRandom(templates), { assignee: assignee.name, target: q.targetName });
        questLogs.push({
          id: generateId(),
          day: currentDay,
          message: `🔍 [진행] ${msg}`,
          type: 'QUEST',
          timestamp: Date.now()
        });
      }
    }

    return q;
  });

  return { updatedQuests, questLogs, finishedQuests };
};
