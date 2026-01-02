
import { RolePairKey } from '../../../types/index';

export const FRIENDLY_LOG_EVENTS: Record<string, Partial<Record<RolePairKey, string[]>>> = {
  '동료': {
    'HERO_HERO': [
      "{actor}이(가) {target}과 합동 순찰 경로를 짰습니다.",
      "{actor}이(가) {target}의 부서진 장비를 자신의 예산으로 수리해 주었습니다.",
      "{actor}이(가) {target}과 콤비네이션 기술을 연습했습니다."
    ],
    'VILLAIN_VILLAIN': [
      "{actor}이(가) {target}에게 훔친 보석의 일부를 나눠주었습니다.",
      "{actor}이(가) {target}이 탈옥할 루트를 미리 확보해 두었습니다.",
      "{actor}이(가) {target}과 함께 세계 정복 후의 지분을 논의했습니다."
    ],
    'CIVILIAN_HERO': [
      "{actor}이(가) {target}에게 비상 호출기를 선물했습니다.",
      "{actor}이(가) {target}의 귀굣길을 몰래 호위해 주었습니다."
    ],
    'COMMON': [
      "{actor}이(가) {target}의 어깨를 두드리며 격려했습니다.",
      "{actor}이(가) {target}과 함께 밥을 먹으며 회포를 풀었습니다."
    ]
  },
  '절친': {
    'HERO_VILLAIN': [
      "{actor}이(가) {target}과 가면을 벗고 사적인 술자리를 가졌습니다.",
      "{actor}이(가) {target}에게 '이번 사건은 서로 모른 척하자'고 합의했습니다."
    ],
    'COMMON': [
      "{actor}이(가) {target}과 밤새도록 수다를 떨었습니다.",
      "{actor}이(가) {target}의 흑역사를 폭로하며 놀렸습니다."
    ]
  }
};
