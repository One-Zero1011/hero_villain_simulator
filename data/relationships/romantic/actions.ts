
import { RolePairKey } from '../../../types/index';

export const ROMANTIC_HOUSING_ACTIONS: Record<string, Partial<Record<RolePairKey, string[]>>> = {
  '짝사랑': {
    'HERO_VILLAIN': [ // 금단의 사랑
      "널 체포하고 싶지 않아.",
      "우리가 다른 곳에서 만났다면...",
      "(복면 너머를 애틋하게 본다)",
      "도망가, 어서!",
      "(몰래 한숨 쉰다)"
    ],
    'CIVILIAN_HERO': [
      "사인 좀 해주세요!",
      "(얼굴이 빨개진다)",
      "오늘도 멋있어요!",
      "(먼발치서 바라본다)",
      "꺄악! 눈 마주쳤어!"
    ],
    'COMMON': [
      "(힐끔거린다)",
      "(수줍게 고개를 숙인다)",
      "(말을 걸려다 만다)",
      "좋아해..."
    ]
  },
  '전 연인': {
    'COMMON': [
      "(어색한 침묵)",
      "(시선을 피한다)",
      "잘 지내...?",
      "(씁쓸한 미소)",
      "아는 척하지 마."
    ]
  }
};
