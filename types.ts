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

export interface HousingItem {
  id: string;
  name: string;
  icon: string; // lucide icon name representation
  description: string;
}

export interface Housing {
  themeId: string;
  items: string[]; // list of item IDs
}

export interface Character {
  id: string;
  name: string;
  role: Role;
  status: Status;
  power: number; // 1-100
  kills: number; // Villains kill civilians/heroes
  saves: number; // Heroes save civilians
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