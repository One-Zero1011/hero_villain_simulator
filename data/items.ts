
import { Role, EffectType, EquipmentSlot, Stats } from '../types/index';

export interface ItemDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  price: number;
  role: Role | 'COMMON';
  effectType: EffectType;
  effectValue: number;
  equipSlot?: EquipmentSlot;
  statBonus?: Partial<Stats>;
}

export const GAME_ITEMS: ItemDefinition[] = [
  // --- CONSUMABLES ---
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
  },

  // --- EQUIPMENT ---
  // Weapons
  {
    id: 'eq_sword_iron',
    name: '철검',
    icon: '⚔️',
    description: '기본적인 무기입니다. 근력을 약간 올려줍니다.',
    price: 2000,
    role: 'COMMON',
    effectType: 'EQUIPMENT',
    effectValue: 0,
    equipSlot: 'WEAPON',
    statBonus: { strength: 10 }
  },
  {
    id: 'eq_gun_laser',
    name: '레이저 건',
    icon: '🔫',
    description: '최첨단 기술로 만든 총입니다. 지능과 근력이 필요합니다.',
    price: 8000,
    role: Role.HERO,
    effectType: 'EQUIPMENT',
    effectValue: 0,
    equipSlot: 'WEAPON',
    statBonus: { strength: 15, intelligence: 10 }
  },
  
  // Head
  {
    id: 'eq_helm_bike',
    name: '오토바이 헬멧',
    icon: '⛑️',
    description: '머리를 보호합니다. 체력이 증가합니다.',
    price: 1500,
    role: 'COMMON',
    effectType: 'EQUIPMENT',
    effectValue: 0,
    equipSlot: 'HEAD',
    statBonus: { stamina: 10 }
  },

  // Body
  {
    id: 'eq_armor_leather',
    name: '가죽 재킷',
    icon: '🧥',
    description: '질긴 가죽으로 만들었습니다. 방어력이 상승합니다.',
    price: 3000,
    role: 'COMMON',
    effectType: 'EQUIPMENT',
    effectValue: 0,
    equipSlot: 'BODY',
    statBonus: { stamina: 15 }
  },
  {
    id: 'eq_suit_tactical',
    name: '전술 슈트',
    icon: '🥋',
    description: '히어로를 위한 특수 슈트입니다.',
    price: 10000,
    role: Role.HERO,
    effectType: 'EQUIPMENT',
    effectValue: 0,
    equipSlot: 'BODY',
    statBonus: { stamina: 30, strength: 5 }
  },

  // Legs
  {
    id: 'eq_pants_jeans',
    name: '튼튼한 청바지',
    icon: '👖',
    description: '어디서나 입기 좋은 바지입니다.',
    price: 800,
    role: 'COMMON',
    effectType: 'EQUIPMENT',
    effectValue: 0,
    equipSlot: 'LEGS',
    statBonus: { stamina: 5 }
  },

  // Feet
  {
    id: 'eq_shoes_running',
    name: '러닝화',
    icon: '👟',
    description: '가볍고 편안합니다. 행운(회피)이 약간 오릅니다.',
    price: 1200,
    role: 'COMMON',
    effectType: 'EQUIPMENT',
    effectValue: 0,
    equipSlot: 'FEET',
    statBonus: { luck: 5, stamina: 2 }
  },

  // Accessories
  {
    id: 'eq_acc_ring_gold',
    name: '금반지',
    icon: '💍',
    description: '반짝이는 금반지입니다. 행운이 상승합니다.',
    price: 5000,
    role: 'COMMON',
    effectType: 'EQUIPMENT',
    effectValue: 0,
    equipSlot: 'RING',
    statBonus: { luck: 15 }
  },
  {
    id: 'eq_acc_neck_amulet',
    name: '신비한 부적 목걸이',
    icon: '🧿',
    description: '알 수 없는 힘이 깃들어 있습니다. 지능이 상승합니다.',
    price: 4500,
    role: Role.VILLAIN,
    effectType: 'EQUIPMENT',
    effectValue: 0,
    equipSlot: 'NECKLACE',
    statBonus: { intelligence: 20 }
  },
  {
    id: 'eq_acc_ear_cross',
    name: '십자가 귀걸이',
    icon: '✝️',
    description: '스타일리시한 귀걸이입니다.',
    price: 1000,
    role: 'COMMON',
    effectType: 'EQUIPMENT',
    effectValue: 0,
    equipSlot: 'EARRING',
    statBonus: { luck: 5 }
  }
];
