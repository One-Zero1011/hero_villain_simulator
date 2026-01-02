
export const RELATIONSHIP_COLORS: Record<string, string> = {
  // Hostile - Reds/Oranges
  '라이벌': '#f97316', // Orange 500
  '원수': '#ef4444', // Red 500
  '배신자': '#b91c1c', // Red 700
  '스토커': '#7f1d1d', // Red 900
  '감시자': '#9a3412', // Orange 800
  '애증': '#db2777', // Pink 600 (Mixed)

  // Friendly - Greens/Teals
  '동료': '#22c55e', // Green 500
  '절친': '#10b981', // Emerald 500
  '소꿉친구': '#34d399', // Emerald 400
  '생명의 은인': '#6ee7b7', // Emerald 300
  '사이드킥': '#86efac', // Green 300
  '후원자': '#065f46', // Emerald 800

  // Romantic - Pinks/Purples
  '부부': '#ec4899', // Pink 500
  '전 연인': '#a1a1aa', // Gray 400 (Faded)
  '짝사랑': '#d946ef', // Fuchsia 500
  '썸': '#f472b6', // Pink 400
  '약혼': '#be185d', // Pink 700

  // Family - Blues
  '가족': '#3b82f6', // Blue 500
  '부모': '#2563eb', // Blue 600
  '자식': '#60a5fa', // Blue 400
  '형제자매': '#93c5fd', // Blue 300
  '쌍둥이': '#1d4ed8', // Blue 700
  '보호자': '#1e40af', // Blue 800
  '피보호자': '#bfdbfe', // Blue 200

  // Professional/Other - Grays/Yellows
  '스승과 제자': '#eab308', // Yellow 500
  '채무 관계': '#854d0e', // Yellow 800
  '계약 관계': '#a1a1aa', // Zinc 400
  '비즈니스 파트너': '#d4d4d8', // Zinc 300
  '열성 팬': '#facc15', // Yellow 400
  '룸메이트': '#cbd5e1', // Slate 300
};

export const getRelColor = (type: string) => RELATIONSHIP_COLORS[type] || '#94a3b8'; // Default Slate 400
