
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
  isMutual?: boolean; // Added for bidirectional check
}

export interface HousingItem {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// New interface for items placed in the room
export interface PlacedHousingItem {
  uuid: string; // Unique instance ID for handling multiple of same item
  itemId: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
}

export interface Housing {
  themeId: string;
  items: PlacedHousingItem[]; // Changed from string[] to object array
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
  
  // Stats & Abilities
  power: number;
  stats?: Stats;
  superpower?: string;
  
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
  icon: string; // Lucide icon name or emoji
  count: number;
  description?: string;
  price?: number; 
  role?: Role | 'COMMON';
  effectType?: EffectType; // Added
  effectValue?: number;    // Added
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
  type: 'INFO' | 'BATTLE' | 'DEATH' | 'EVENT' | 'INTERVENTION';
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
