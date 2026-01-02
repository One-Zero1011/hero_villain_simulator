
export enum Role {
  HERO = 'HERO',
  VILLAIN = 'VILLAIN',
  CIVILIAN = 'CIVILIAN'
}

export enum Status {
  NORMAL = 'NORMAL',
  INJURED = 'INJURED',
  RETIRED = 'RETIRED',
  DEAD = 'DEAD'
}

// Role combinations for relationship interactions
export type RolePairKey = 
  | 'HERO_HERO' 
  | 'VILLAIN_VILLAIN' 
  | 'CIVILIAN_CIVILIAN' 
  | 'HERO_VILLAIN' 
  | 'CIVILIAN_HERO' 
  | 'CIVILIAN_VILLAIN' 
  | 'COMMON';

export type Gender = '남성' | '여성' | '기타';

export interface Stats {
  strength: number;
  intelligence: number;
  stamina: number;
  luck: number;
}

export interface Relationship {
  targetId: string;
  targetName: string;
  type: string;
  isMutual?: boolean;
}

export interface HousingItem {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// 가구 배치 정보 (좌표 포함)
export interface PlacedHousingItem {
  uuid: string; // 고유 인스턴스 ID
  itemId: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
}

export interface Housing {
  themeId: string;
  items: PlacedHousingItem[];
}

export interface Character {
  id: string;
  name: string;
  role: Role;
  status: Status;
  
  // Visuals
  imageUrl?: string;

  // Demographics
  gender: Gender;
  age: number;
  mbti: string;
  personality?: string; // 성격 (선택사항)
  
  // Identity (Hero Specific)
  isIdentityRevealed?: boolean;

  // Stats & Abilities
  power: number;
  stats?: Stats;
  superpower?: string;
  
  // Mental State
  currentSanity?: number; // 현재 정신력 (Max = intelligence * 2)
  isInsane?: boolean;     // 정신 착란 상태 여부

  // Social
  relationships: Relationship[];
  
  // Records
  kills: number;
  saves: number;
  battlesWon: number;
  housing?: Housing;
}

// --- Item Effects ---
export type EffectType = 'HEAL' | 'BUFF_STRENGTH' | 'BUFF_LUCK' | 'GAMBLE_MONEY';

export interface Item {
  id: string;
  name: string;
  icon: string; 
  count: number;
  description?: string;
  price?: number; 
  role?: Role | 'COMMON';
  effectType?: EffectType; 
  effectValue?: number;    
}

export interface FactionResources {
  money: number;
  inventory: Item[];
}
// --------------------------------

export interface LogEntry {
  id: string;
  day: number;
  message: string;
  type: 'INFO' | 'BATTLE' | 'DEATH' | 'EVENT' | 'INTERVENTION' | 'INSANITY';
  timestamp: number;
}

export interface SimulationState {
  day: number;
  characters: Character[];
  logs: LogEntry[];
  isAutoPlaying: boolean;
}

export interface BattleResult {
  winnerId: string;
  loserId: string;
  isDraw?: boolean;
  logs: string[];
}
