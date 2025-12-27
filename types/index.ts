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
  targetName: string; // Store name snapshot for easier display
  type: string; // e.g., "라이벌", "가족", "친구"
}

export interface HousingItem {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Housing {
  themeId: string;
  items: string[];
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
  power: number; // Calculated average of stats for backward compatibility/battle logic
  stats?: Stats; // Optional because Civilians might not have detailed combat stats
  superpower?: string;
  
  // Social
  relationships: Relationship[];
  
  // Records
  kills: number;
  saves: number;
  battlesWon: number;
  housing?: Housing;
}

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