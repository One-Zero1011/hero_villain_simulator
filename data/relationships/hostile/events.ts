
import { RolePairKey } from '../../../types/index';

export const HOSTILE_LOG_EVENTS: Record<string, Partial<Record<RolePairKey, string[]>>> = {
  '라이벌': {
    'HERO_HERO': [
      "{actor}이(가) {target}보다 먼저 현장에 도착하기 위해 전속력으로 질주했습니다.",
      "{actor}이(가) {target}의 랭킹이 오르자 샌드백을 터뜨리며 분해했습니다.",
      "{actor}이(가) 방송 인터뷰에서 {target}의 슈트 디자인이 촌스럽다고 디스했습니다."
    ],
    'VILLAIN_VILLAIN': [
      "{actor}이(가) {target}의 나와바리(구역)를 침범하여 도발했습니다.",
      "{actor}이(가) {target}보다 더 사악한 범죄를 저지르겠다고 공언했습니다.",
      "{actor}이(가) {target}의 부하들을 매수하려고 시도했습니다."
    ],
    'HERO_VILLAIN': [
      "{actor}이(가) {target}에게 '다음번엔 반드시 잡는다'고 경고장을 보냈습니다.",
      "{actor}이(가) {target}의 범죄 예고장을 보고 투지를 불태웠습니다.",
      "{actor}이(가) {target}과의 지난 전투 영상을 분석하며 약점을 찾고 있습니다."
    ],
    'COMMON': [
      "{actor}이(가) {target}에게 승부를 제안했습니다.",
      "{actor}이(가) {target}을(를) 의식하며 훈련 강도를 높였습니다."
    ]
  },
  '원수': {
    'HERO_VILLAIN': [
      "{actor}이(가) {target}의 이름만 들어도 이를 갈았습니다.",
      "{actor}이(가) {target}을(를) 사회에서 영원히 격리시키겠다고 맹세했습니다.",
      "{actor}이(가) {target}에게 당했던 과거의 상처를 어루만지며 복수를 다짐합니다."
    ],
    'VILLAIN_VILLAIN': [
      "{actor}이(가) {target}의 비밀 기지 위치를 경찰에 익명 제보했습니다.",
      "{actor}이(가) {target}이 훔친 장물을 다시 훔쳐갔습니다."
    ],
    'CIVILIAN_VILLAIN': [
      "{actor}이(가) {target}의 현상금 수배 전단지를 찢어발겼습니다.",
      "{actor}이(가) 꿈속에서 {target}에게 쫓기다 비명을 지르며 깼습니다."
    ],
    'COMMON': [
      "{actor}이(가) {target}을(를) 저주하는 글을 일기장에 적었습니다.",
      "{actor}이(가) {target}의 불행한 소식을 듣고 미소를 지었습니다."
    ]
  },
  '스토커': {
    'HERO_VILLAIN': [
      "{actor}이(가) {target}의 약점을 캐기 위해 24시간 감시 중입니다.",
      "{actor}이(가) {target}의 슈트 조각을 수집하여 진열해 두었습니다."
    ],
    'COMMON': [
      "{actor}이(가) {target}의 집 앞 쓰레기통을 뒤지다 걸렸습니다.",
      "{actor}이(가) {target}의 모든 동선을 파악하고 있습니다."
    ]
  }
};
