
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
