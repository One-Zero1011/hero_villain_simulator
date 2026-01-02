
import { RolePairKey } from '../../../types/index';

export const FAMILY_LOG_EVENTS: Record<string, Partial<Record<RolePairKey, string[]>>> = {
  '가족': {
    'HERO_VILLAIN': [
      "{actor}이(가) {target}의 범죄 뉴스를 보고 남몰래 눈물 흘렸습니다.",
      "{actor}이(가) {target}에게 '제발 돌아오라'는 편지를 남겼습니다.",
      "{actor}이(가) {target}과 마주칠까 봐 두려워하면서도 그리워합니다."
    ],
    'CIVILIAN_HERO': [
      "{actor}이(가) {target}에게 자신의 정체를 들킬까 봐 노심초사했습니다.",
      "{actor}이(가) 바쁜 와중에도 {target}의 생일을 챙겨주었습니다."
    ],
    'COMMON': [
      "{actor}이(가) {target}에게 안부 전화를 걸어 잔소리를 했습니다.",
      "{actor}이(가) {target}을 위해 따뜻한 집밥을 차려주었습니다."
    ]
  },
  '부부': {
    'HERO_VILLAIN': [
      "{actor}이(가) 전투 현장에서 {target}의 결혼반지를 보고 공격을 멈췄습니다.",
      "{actor}이(가) {target}에게 '아이들을 봐서라도 자수해'라고 호소했습니다.",
      "{actor}이(가) {target}이(가) 숨겨둔 비상금을 발견하고 한숨을 쉬었습니다."
    ],
    'HERO_HERO': [
      "{actor}이(가) {target}의 다친 상처를 치료해주며 속상해했습니다.",
      "{actor}이(가) {target}과 함께 장을 보며 평범한 데이트를 즐겼습니다.",
      "{actor}이(가) {target}의 슈트 세탁 당번을 정하기 위해 가위바위보를 했습니다."
    ],
    'COMMON': [
      "{actor}이(가) {target}과 결혼기념일 선물을 교환했습니다.",
      "{actor}이(가) {target}의 코골이 때문에 거실에서 잤습니다.",
      "{actor}이(가) {target}에게 사랑한다는 쪽지를 남겼습니다."
    ]
  },
  '부모': {
    'HERO_VILLAIN': [
      "{actor}이(가) {target}의 수배 전단지를 떼어내며 오열했습니다.",
      "{actor}이(가) {target}이(가) 어릴 적 그린 그림을 보며 추억에 잠겼습니다.",
      "{actor}이(가) {target}에게 줄 따뜻한 옷을 몰래 감방으로 보냈습니다.",
      "{actor}이(가) {target}이(가) 자신을 체포하러 온 것을 보고 씁쓸히 웃었습니다.",
      "{actor}이(가) {target}의 앞길을 막지 않기 위해 자취를 감췄습니다."
    ],
    'COMMON': [
      "{actor}이(가) {target}에게 용돈을 입금해주었습니다.",
      "{actor}이(가) {target}의 건강을 걱정하며 보약을 지어왔습니다.",
      "{actor}이(가) {target}에게 '언제 집에 오니?'라고 문자를 보냈습니다."
    ]
  },
  '자식': {
    'HERO_VILLAIN': [
      "{actor}이(가) {target}의 정의로운 척하는 모습에 구역질을 느꼈습니다.",
      "{actor}이(가) {target}의 명성에 먹칠을 하기 위해 더 큰 사고를 쳤습니다.",
      "{actor}이(가) {target}의 죄를 대신 갚기 위해 더 열심히 활동했습니다.",
      "{actor}이(가) {target}을 자신의 손으로 체포하겠다고 다짐했습니다."
    ],
    'COMMON': [
      "{actor}이(가) {target}에게 반찬 좀 보내달라고 연락했습니다.",
      "{actor}이(가) {target}의 잔소리를 피해 방으로 도망갔습니다.",
      "{actor}이(가) {target}의 흰머리를 보고 마음이 짠해졌습니다."
    ]
  },
  '형제자매': {
    'HERO_VILLAIN': [
      "{actor}이(가) {target}과 마주치자 '형/누나/오빠/언니, 제발 그만해'라고 외쳤습니다.",
      "{actor}이(가) {target}의 뺨을 때리며 정신 차리라고 소리쳤습니다.",
      "{actor}이(가) 어릴 적 함께 놀던 놀이터에서 {target}을 기다립니다."
    ],
    'COMMON': [
      "{actor}이(가) {target}의 옷을 몰래 입고 나갔다가 싸웠습니다.",
      "{actor}이(가) {target}의 라면을 뺏어 먹었습니다.",
      "{actor}이(가) {target}이 누군가에게 맞고 오자 복수하러 달려갔습니다."
    ]
  },
  '보호자': {
    'COMMON': [
      "{actor}이(가) {target}의 학교/직장 생활을 상담해주었습니다.",
      "{actor}이(가) {target}이(가) 사고를 쳤다는 소식에 뒷목을 잡았습니다.",
      "{actor}이(가) {target}의 성장을 흐뭇하게 지켜봅니다."
    ]
  },
  '피보호자': {
    'COMMON': [
      "{actor}이(가) {target}의 뒤에 숨었습니다.",
      "{actor}이(가) {target}에게 칭찬받기 위해 노력했습니다.",
      "{actor}이(가) {target} 몰래 사고를 치고 수습 중입니다."
    ]
  }
};
