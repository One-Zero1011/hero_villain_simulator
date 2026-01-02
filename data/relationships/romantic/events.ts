
import { RolePairKey } from '../../../types/index';

export const ROMANTIC_LOG_EVENTS: Record<string, Partial<Record<RolePairKey, string[]>>> = {
  '짝사랑': {
    'HERO_HERO': [
      "{actor}이(가) {target}이 구해준 시민을 질투했습니다.",
      "{actor}이(가) 위기의 순간에 {target}이 나타나주길 바라고 있습니다."
    ],
    'HERO_VILLAIN': [
      "{actor}이(가) {target}과 싸우는 도중 일부러 공격을 빗나갔습니다.",
      "{actor}이(가) {target}의 수배 전단지를 지갑 속에 소중히 간직합니다.",
      "{actor}이(가) '우리가 평범하게 만났다면 어땠을까' 상상했습니다."
    ],
    'CIVILIAN_HERO': [
      "{actor}이(가) {target}의 팬카페에 '우리 결혼하게 해주세요' 글을 올렸습니다.",
      "{actor}이(가) {target}을 보기 위해 일부러 위험한 골목을 서성거립니다."
    ],
    'COMMON': [
      "{actor}이(가) {target}의 SNS를 염탐하다 밤을 새웠습니다.",
      "{actor}이(가) {target}과 눈이 마주치자 얼굴이 홍당무가 되었습니다."
    ]
  },
  '전 연인': {
    'HERO_VILLAIN': [
      "{actor}이(가) 전투 중 {target}의 향수 냄새를 맡고 멈칫했습니다.",
      "{actor}이(가) {target}에게 '넌 변했어'라고 차갑게 말했습니다."
    ],
    'COMMON': [
      "{actor}이(가) 술에 취해 {target}에게 부재중 전화를 남겼습니다.",
      "{actor}이(가) {target}과 우연히 마주치고 황급히 자리를 피했습니다."
    ]
  }
};
