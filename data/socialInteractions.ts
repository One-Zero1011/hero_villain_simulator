
import { Character, Role, RolePairKey } from '../types/index';
import { getRoleKey } from '../utils/helpers';
import { COMBINED_RELATIONSHIP_ACTIONS } from './relationships/index';

// 관계별 + 진영별 행동(Action) 템플릿 통합
export const RELATIONSHIP_ACTIONS: Record<string, Partial<Record<RolePairKey, string[]>>> = {
  ...COMBINED_RELATIONSHIP_ACTIONS,
  '초면': { // 관계가 없을 때 기본 행동
    'HERO_VILLAIN': [
      "(경계 태세)",
      "수상한 놈...",
      "움직이면 쏜다.",
      "(탐색전을 벌인다)"
    ],
    'COMMON': [
      "(가볍게 목례)",
      "누구시죠?",
      "(지나간다)",
      "(멀뚱멀뚱 쳐다본다)",
      "안녕하세요."
    ]
  }
};

// 두 캐릭터 간의 관계를 파악하여 행동 지문을 반환하는 함수
export const getInteractionAction = (actor: Character, target: Character): string => {
  // 1. 관계 유형 파악
  const relationship = actor.relationships.find(r => r.targetId === target.id);
  const reverseRelationship = target.relationships.find(r => r.targetId === actor.id);
  
  // 우선순위: actor가 정의한 관계 -> target이 정의한 관계 -> 초면
  let relType = '초면';
  if (relationship) {
    relType = relationship.type;
  } else if (reverseRelationship && reverseRelationship.isMutual) {
    relType = reverseRelationship.type;
  }

  // 2. 진영(Role) 조합 키 생성
  const roleKey = getRoleKey(actor.role, target.role);

  // 3. 텍스트 풀 가져오기
  const typeGroup = RELATIONSHIP_ACTIONS[relType] || RELATIONSHIP_ACTIONS['초면'];
  
  // 3-1. 해당 Role 조합에 맞는 대사가 있는지 확인
  let actionPool = typeGroup[roleKey];
  
  // 3-2. 없으면 'COMMON' 대사 확인
  if (!actionPool) {
    actionPool = typeGroup['COMMON'];
  }
  
  // 3-3. 그래도 없으면(초면인 경우 등) 초면-COMMON으로 폴백
  if (!actionPool) {
    const fallbackGroup = RELATIONSHIP_ACTIONS['초면'];
    actionPool = fallbackGroup[roleKey] || fallbackGroup['COMMON'];
  }

  // 랜덤 행동 반환
  if (actionPool && actionPool.length > 0) {
    return actionPool[Math.floor(Math.random() * actionPool.length)];
  }
  
  return "(멍하니 바라본다)";
};
