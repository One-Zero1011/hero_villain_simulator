
import { Role, RolePairKey } from '../types/index';

// 고유 ID 생성
export const generateId = (): string => Math.random().toString(36).substr(2, 9);

// 배열에서 랜덤 요소 추출
export const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// 템플릿 문자열 포맷팅 ({key}를 값으로 치환)
export const formatTemplate = (template: string, args: Record<string, string>): string => {
  let str = template;
  for (const key in args) {
    str = str.replace(new RegExp(`\\{${key}\\}`, 'g'), args[key]);
  }
  return str;
};

// 역할 쌍 키 생성 (알파벳 순 정렬: CIVILIAN < HERO < VILLAIN)
// 관계형 데이터 조회 시 키 불일치 방지
export const getRoleKey = (r1: Role, r2: Role): RolePairKey => {
  if (r1 === r2) return `${r1}_${r1}` as RolePairKey;
  const sorted = [r1, r2].sort();
  return `${sorted[0]}_${sorted[1]}` as RolePairKey;
};
