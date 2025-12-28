
import { Role, EffectType } from '../types/index';

export interface ItemDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  price: number;
  role: Role | 'COMMON';
  effectType: EffectType;
  effectValue: number;
}

export const GAME_ITEMS: ItemDefinition[] = [
  // --- HERO ITEMS ---
  { 
    id: 'h_bandage', 
    name: '전문가용 붕대', 
    icon: '🩹', 
    description: '부상 상태를 치료하고 체력을 30 회복합니다.', 
    price: 500, 
    role: Role.HERO,
    effectType: 'HEAL',
    effectValue: 30
  },
  { 
    id: 'h_potion', 
    name: '고농축 에너지 드링크', 
    icon: '⚡', 
    description: '체력을 50 회복하고 활력을 되찾습니다.', 
    price: 1500, 
    role: Role.HERO,
    effectType: 'HEAL',
    effectValue: 50
  },

  // --- VILLAIN ITEMS ---
  { 
    id: 'v_smoke', 
    name: '연막탄', 
    icon: '💣', 
    description: '일시적으로 행운(회피율)을 15 증가시킵니다.', 
    price: 300, 
    role: Role.VILLAIN,
    effectType: 'BUFF_LUCK',
    effectValue: 15
  },
  { 
    id: 'v_serum', 
    name: '강화 혈청', 
    icon: '🧪', 
    description: '근력을 10 영구적으로 증가시키지만 위험할 수 있습니다.', 
    price: 5000, 
    role: Role.VILLAIN,
    effectType: 'BUFF_STRENGTH',
    effectValue: 10
  },

  // --- CIVILIAN ITEMS ---
  { 
    id: 'c_lotto', 
    name: '로또 복권', 
    icon: '🎫', 
    description: '당첨되면 거액의 자금을 얻을 수 있습니다. (최대 50,000 Gold)', 
    price: 5, 
    role: Role.CIVILIAN,
    effectType: 'GAMBLE_MONEY',
    effectValue: 50000 
  },

  // --- COMMON ITEMS (Accessible by everyone) ---
  {
    id: 'com_water',
    name: '생수',
    icon: '💧',
    description: '갈증을 해소하고 체력을 10 회복합니다.',
    price: 10,
    role: 'COMMON',
    effectType: 'HEAL',
    effectValue: 10
  },
  {
    id: 'com_bandaid',
    name: '일회용 밴드',
    icon: '🩹', 
    description: '작은 상처에 붙입니다. 체력을 5 회복합니다.',
    price: 5,
    role: 'COMMON',
    effectType: 'HEAL',
    effectValue: 5
  },
  {
    id: 'com_lunchbox',
    name: '편의점 도시락',
    icon: '🍱', 
    description: '든든한 한 끼입니다. 체력을 20 회복합니다.',
    price: 50,
    role: 'COMMON',
    effectType: 'HEAL',
    effectValue: 20
  }
];
