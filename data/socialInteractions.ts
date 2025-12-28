
import { Character } from '../types/index';

// 관계별 행동(Action) 템플릿 정의
export const RELATIONSHIP_ACTIONS: Record<string, string[]> = {
  '라이벌': [
    '(어깨를 툭 치고 지나간다)',
    '(매섭게 노려본다)',
    '(자신의 근육을 과시한다)',
    '(비웃음을 날린다)',
    '(도발적인 제스처를 취한다)',
    '(경계하는 눈빛을 보낸다)',
    '(주먹을 들어 보이며 씩 웃는다)'
  ],
  '원수': [
    '(주먹을 꽉 쥔다)',
    '(바닥에 침을 뱉는다)',
    '(살벌한 눈빛을 보낸다)',
    '(모욕적인 손짓을 한다)',
    '(인상을 찌푸리며 고개를 돌린다)',
    '(들으라는 듯이 혀를 찬다)',
    '(당장이라도 덤벼들 기세다)'
  ],
  '동료': [
    '(경쾌하게 하이파이브를 한다)',
    '(어깨동무를 한다)',
    '(엄지를 치켜세운다)',
    '(주먹을 맞대며 인사한다)',
    '(등을 두드려준다)',
    '(미소를 지으며 끄덕인다)',
    '(신뢰의 눈빛을 교환한다)'
  ],
  '가족': [
    '(등짝을 찰싹 때린다)',
    '(옷매무새를 고쳐준다)',
    '(따뜻하게 포옹한다)',
    '(머리를 쓰다듬는다)',
    '(걱정스러운 눈빛으로 살핀다)',
    '(볼을 꼬집는다)',
    '(반갑게 손을 잡는다)'
  ],
  '짝사랑': [
    '(얼굴이 빨개져서 고개를 숙인다)',
    '(힐끔 쳐다보고 황급히 눈을 피한다)',
    '(손을 꼼지락거린다)',
    '(수줍게 웃어 보인다)',
    '(먼발치에서 지켜본다)',
    '(말을 걸려다 멈칫한다)',
    '(심장을 부여잡는다)'
  ],
  '스승과 제자': [
    '(정중하게 고개를 숙인다)',
    '(자세를 교정해준다)',
    '(뒷짐을 지고 흐뭇하게 바라본다)',
    '(존경의 눈빛을 보낸다)',
    '(각 잡힌 경례를 한다)',
    '(가르침을 구하는 눈치다)',
    '(격려의 손짓을 한다)'
  ],
  '채무 관계': [
    '(손바닥을 비비며 아부한다)',
    '(슬금슬금 뒷걸음질 친다)',
    '(돈 내놓으라고 손을 내민다)',
    '(빈 지갑을 뒤집어 보인다)',
    '(무릎을 꿇고 빈다)',
    '(딴청을 피운다)',
    '(멱살을 잡으려다 참는다)'
  ],
  '소꿉친구': [
    '(헤드락을 건다)',
    '(엉덩이를 걷어찬다)',
    '(콧구멍을 찌르는 시늉을 한다)',
    '(서로를 가리키며 낄낄댄다)',
    '(등 뒤에 몰래 낙서를 한다)',
    '(장난스럽게 메롱을 한다)',
    '(옛날 별명을 부른다)'
  ],
  '초면': [ // 관계가 없을 때 기본 행동
    '(가볍게 목례한다)',
    '(손을 흔든다)',
    '(어색하게 웃는다)',
    '(호기심 어린 눈으로 본다)',
    '(거리를 두고 지나간다)',
    '(꾸벅 인사한다)',
    '(주변을 두리번거린다)'
  ]
};

// 두 캐릭터 간의 관계를 파악하여 행동 지문을 반환하는 함수
export const getInteractionAction = (actor: Character, target: Character): string => {
  // actor 입장에서 target과의 관계를 찾음
  const relationship = actor.relationships.find(r => r.targetId === target.id);
  
  // 관계가 없으면 반대쪽(target -> actor) 관계도 확인 (상호 관계일 수 있으므로)
  const reverseRelationship = target.relationships.find(r => r.targetId === actor.id);
  
  // 관계 유형 추출 (우선순위: actor가 정의한 관계 -> target이 정의한 관계 -> 초면)
  let type = '초면';
  
  if (relationship) {
    type = relationship.type;
  } else if (reverseRelationship && reverseRelationship.isMutual) {
    type = reverseRelationship.type;
  }

  // 해당 타입의 행동 목록 가져오기 (없으면 초면 행동)
  const actionPool = RELATIONSHIP_ACTIONS[type] || RELATIONSHIP_ACTIONS['초면'];
  
  // 랜덤 행동 반환
  return actionPool[Math.floor(Math.random() * actionPool.length)];
};
