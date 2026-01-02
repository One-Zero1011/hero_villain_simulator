
import { RolePairKey } from '../../../types/index';

export const PROFESSIONAL_LOG_EVENTS: Record<string, Partial<Record<RolePairKey, string[]>>> = {
  '스승과 제자': {
    'HERO_HERO': [
      "{actor}이(가) {target}에게 '진정한 영웅의 자세'에 대해 설교했습니다.",
      "{actor}이(가) {target}의 성장을 보며 은퇴를 고민했습니다."
    ],
    'VILLAIN_VILLAIN': [
      "{actor}이(가) {target}에게 더 효율적으로 은행을 터는 법을 전수했습니다.",
      "{actor}이(가) {target}이 저지른 범죄가 너무 어설프다며 혀를 찼습니다."
    ],
    'COMMON': [
      "{actor}이(가) {target}에게 깨달음을 주는 한마디를 던졌습니다.",
      "{actor}이(가) {target}의 옛날 영상을 보며 추억에 잠겼습니다."
    ]
  },
  '계약 관계': {
    'VILLAIN_VILLAIN': [
      "{actor}이(가) {target}에게 용병비를 입금하라고 독촉했습니다.",
      "{actor}이(가) {target}과 이번 작전의 수익 배분을 놓고 다투었습니다."
    ],
    'CIVILIAN_HERO': [
      "{actor}이(가) {target}에게 보험 처리를 위한 피해 입증 서류를 요청했습니다.",
      "{actor}이(가) {target}을 광고 모델로 섭외하려고 연락했습니다."
    ],
    'COMMON': [
      "{actor}이(가) {target}에게 계약서를 들이밀며 조항을 확인시켰습니다."
    ]
  }
};
