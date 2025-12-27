export interface HousingTheme {
  id: string;
  name: string;
  description: string;
  styleClass: string; // Tailwind classes for background
}

export interface HousingFurniture {
  id: string;
  name: string;
  type: 'DECOR' | 'TECH' | 'COMFORT';
  icon: any; // We will handle icons in the component mapping
  cost: number; // Conceptual cost, free for now
}

export const HOUSING_THEMES: HousingTheme[] = [
  {
    id: 'default_room',
    name: '기본 방',
    description: '평범하고 깔끔한 방입니다.',
    styleClass: 'bg-slate-700'
  },
  {
    id: 'secret_base',
    name: '비밀 지하 기지',
    description: '최첨단 기술이 숨겨진 어두운 기지입니다.',
    styleClass: 'bg-gradient-to-b from-slate-900 via-slate-800 to-black border-2 border-blue-900'
  },
  {
    id: 'sky_penthouse',
    name: '스카이 펜트하우스',
    description: '도시가 내려다보이는 최고급 거주지입니다.',
    styleClass: 'bg-gradient-to-tr from-blue-900 to-indigo-500'
  },
  {
    id: 'evil_lair',
    name: '어둠의 은신처',
    description: '음모를 꾸미기에 완벽한 장소입니다.',
    styleClass: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900 via-black to-black'
  },
  {
    id: 'cozy_house',
    name: '따뜻한 우리집',
    description: '시민들을 위한 안락한 휴식처입니다.',
    styleClass: 'bg-[#5c4033]' // Brownish
  },
  {
    id: 'lab',
    name: '연구소',
    description: '위험한 실험이 진행되는 곳입니다.',
    styleClass: 'bg-emerald-950 border-2 border-emerald-500/30'
  }
];

export const HOUSING_ITEMS = [
  { id: 'pc', name: '슈퍼 컴퓨터', icon: 'Monitor', desc: '정보 분석용' },
  { id: 'sofa', name: '가죽 소파', icon: 'Armchair', desc: '휴식용' },
  { id: 'weapon', name: '무기 진열대', icon: 'Sword', desc: '전투 준비' },
  { id: 'cat', name: '고양이', icon: 'Cat', desc: '귀여움 담당' },
  { id: 'plant', name: '화분', icon: 'Flower2', desc: '공기 정화' },
  { id: 'safe', name: '금고', icon: 'Vault', desc: '자금 보관' },
  { id: 'tv', name: '대형 TV', icon: 'Tv', desc: '뉴스 시청' },
  { id: 'coffee', name: '커피 머신', icon: 'Coffee', desc: '카페인 충전' },
  { id: 'target', name: '샌드백', icon: 'Target', desc: '타격 훈련' },
  { id: 'bed', name: '침대', icon: 'Bed', desc: '수면' },
];