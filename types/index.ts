
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
  affinity?: number; // -100 to 100
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

// --- Equipment System ---
export type EquipmentSlot = 'HEAD' | 'BODY' | 'LEGS' | 'FEET' | 'WEAPON' | 'EARRING' | 'NECKLACE' | 'RING';

export interface Equipment {
  head?: Item | null;
  body?: Item | null;
  legs?: Item | null;
  feet?: Item | null;
  weapon?: Item | null;
  earring?: Item | null;
  necklace?: Item | null;
  ring?: Item | null;
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
  
  // Physical & Mental State
  currentHp?: number;     // 현재 체력 (Max = stamina * 2)
  currentSanity?: number; // 현재 정신력 (Max = intelligence * 2)
  isInsane?: boolean;     // 정신 착란 상태 여부

  // Social
  relationships: Relationship[];
  
  // Inventory & Equipment
  equipment: Equipment; // Added Equipment Slots

  // Records
  kills: number;
  saves: number;
  battlesWon: number;
  housing?: Housing;
}

// --- Item Effects ---
export type EffectType = 'HEAL' | 'BUFF_STRENGTH' | 'BUFF_LUCK' | 'GAMBLE_MONEY' | 'EQUIPMENT';

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
  // Equipment Specifics
  equipSlot?: EquipmentSlot;
  statBonus?: Partial<Stats>;
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
  type: 'INFO' | 'BATTLE' | 'DEATH' | 'EVENT' | 'INTERVENTION' | 'INSANITY' | 'ROMANCE'; 
  timestamp: number;
  // New: Stat changes tracking
  statChanges?: {
    hp?: number;
    sanity?: number;
  };
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

// --- Save System ---
export type SaveType = 'FULL' | 'ROSTER';

export interface SaveData {
  version: number;
  type: SaveType;
  timestamp: number;
  // Common Data
  characters: Character[];
  // Full Save Only Data (Optional)
  day?: number;
  factionResources?: Record<Role, FactionResources>;
  logs?: LogEntry[];
}

// --- Game Settings ---
export interface GameSettings {
  // Constraints
  preventMinorAdultDating: boolean; // 미성년자-성인 연애 금지 (Default: true)
  allowFamilyDating: boolean; // 가족끼리 연애 허용 (Default: false)
  
  // Relationship Modes
  pureLoveMode: boolean; // 순애 모드: 양다리 불가 (Default: true)
  allowSameSex: boolean; // 동성 연애 허용 (Default: false)
  allowHetero: boolean;  // 이성 연애 허용 (Default: true)
  globalNoRomance: boolean; // 우정 모드: 연애 발생 안함 (Default: false)

  // System
  debugMode: boolean; // 디버그(치트) 모드 활성화 여부
}
