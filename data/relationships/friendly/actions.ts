
import { RolePairKey } from '../../../types/index';

export const FRIENDLY_HOUSING_ACTIONS: Record<string, Partial<Record<RolePairKey, string[]>>> = {
  '동료': {
    'HERO_HERO': [
      "(절도 있는 경례)",
      "오늘 순찰도 수고했어.",
      "등 뒤는 나한테 맡겨.",
      "(하이파이브)",
      "나이스 콤비네이션!"
    ],
    'VILLAIN_VILLAIN': [
      "(음흉하게 킥킥댄다)",
      "이번 작전은 완벽해.",
      "수익은 5:5다?",
      "(주먹을 맞댄다)",
      "뒤통수치기 없기다."
    ],
    'COMMON': [
      "(반갑게 손을 흔든다)",
      "잘 지냈어?",
      "(어깨동무를 한다)",
      "(미소를 짓는다)"
    ]
  },
  '절친': {
    'HERO_VILLAIN': [
      "오늘만 봐준다.",
      "슈트 입고 폼 잡지 마라.",
      "나중에 술 한잔?",
      "(장난스럽게 툭 친다)",
      "너 때문에 미치겠다."
    ],
    'COMMON': [
      "야, 돈 좀 빌려줘.",
      "(서로 낄낄댄다)",
      "너 오늘 옷이 왜 그래?",
      "(헤드락을 건다)",
      "배고프다 밥 먹자."
    ]
  }
};
