
import { Character } from '../types/index';
import { getRandom, formatTemplate } from './helpers';

interface BattleCalculation {
  damage: number;
  isCrit: boolean;
  isGlancing: boolean; //빗맞음(데미지 감소)
}

export const calculateBattleDamage = (attacker: Character, defender: Character): BattleCalculation => {
  // Default stats for safety
  const attStats = attacker.stats || { strength: 50, intelligence: 50, stamina: 50, luck: 50 };
  const defStats = defender.stats || { strength: 50, intelligence: 50, stamina: 50, luck: 50 };

  // 1. Critical Hit Calculation (Based on Luck)
  // Base 5% + Luck scaling. Max luck 100 adds 20% -> Total 25% max crit chance roughly
  const critChance = 0.05 + (attStats.luck / 400); 
  const isCrit = Math.random() < critChance;

  // 2. Base Damage Calculation (Modified: Strength is dominant)
  // Attack Rating is now heavily proportional to Strength.
  // Formula: (Strength * 1.5) + (Power * 0.3)
  // Example: Str 100 -> 150 + alpha.
  let attackRating = (attStats.strength * 1.5) + (attacker.power * 0.3);

  // 3. Defense Mitigation (Modified: Stamina is dominant)
  // Defense Rating: (Stamina * 0.8) + (Intelligence * 0.2)
  // Higher stamina directly reduces incoming damage.
  const defenseRating = (defStats.stamina * 0.8) + (defStats.intelligence * 0.2);

  // 4. Intelligence Check (Tactical Advantage)
  // If attacker is smarter, they find weak points, ignoring some defense.
  if (attStats.intelligence > defStats.intelligence) {
    const diff = attStats.intelligence - defStats.intelligence;
    // Reduce defense rating based on int difference, capped at 30% reduction
    const defensePenetration = Math.min(0.3, diff * 0.01); 
    // Effectively ignoring up to 30% of opponent's defense
    attackRating += defenseRating * defensePenetration; 
  }

  // 5. Calculate Raw Damage
  // Minimum damage is always 1 to prevent stalemates
  let rawDamage = Math.max(1, attackRating - (defenseRating * 0.5)); 
  // Note: We subtract only half of defense rating to ensure damage flows through, 
  // mimicking a "Defense reduces damage but doesn't block it all" mechanic.

  // 6. Variance (+/- 10%)
  const variance = 0.9 + Math.random() * 0.2;
  rawDamage *= variance;

  // 7. Apply Crit Multiplier
  if (isCrit) {
    rawDamage *= 1.5;
  }

  // 8. Glancing Blow (If Defender Luck is high vs Attacker Luck)
  let isGlancing = false;
  if (!isCrit && defStats.luck > attStats.luck && Math.random() < 0.2) {
    isGlancing = true;
    rawDamage *= 0.5; // 50% reduction for glancing
  }

  // Scaling
  // Since Max HP is (Stamina * 2) ~ approx 200 max.
  // We want damage to be significant. 
  // With Str 100 vs Sta 50: Atk ~160, Def ~50. Raw ~ 135.
  // We need to scale this down to reasonable per-turn damage (e.g., 20-40).
  const finalDamage = Math.max(2, Math.round(rawDamage / 4)); 

  return {
    damage: finalDamage,
    isCrit,
    isGlancing
  };
};

// Combat Text Templates
const CRIT_TEMPLATES = [
  "💥 {attacker}의 치명적인 일격! {defender}의 급소를 정확히 가격했습니다!",
  "💥 {attacker}의 힘이 폭발합니다! 엄청난 데미지!",
  "⚡ {attacker}의 공격이 번개처럼 꽂혔습니다! {defender}이(가) 휘청거립니다!"
];

const HEAVY_TEMPLATES = [
  "⚔️ {attacker}의 묵직한 공격이 {defender}에게 적중했습니다.",
  "⚔️ {attacker}이(가) {defender}의 방어를 뚫고 타격했습니다.",
  "⚔️ {attacker}이(가) 강력한 힘으로 {defender}을(를) 몰아붙입니다!"
];

const GLANCING_TEMPLATES = [
  "🛡️ {defender}이(가) {attacker}의 공격을 가까스로 흘려냈습니다.",
  "🛡️ {attacker}의 공격이 빗맞았습니다. {defender}이(가) 피해를 최소화합니다.",
  "🛡️ {defender}의 운이 좋았습니다! {attacker}의 공격이 급소를 빗나갑니다."
];

const NORMAL_TEMPLATES = [
  "⚔️ {attacker}이(가) {defender}을(를) 공격했습니다.",
  "⚔️ {attacker}와 {defender}의 합이 부딪힙니다.",
  "⚔️ {attacker}의 빠른 견제 공격!"
];

export const getBattleFlavorText = (attackerName: string, defenderName: string, result: BattleCalculation): string => {
  let templateList = NORMAL_TEMPLATES;
  
  if (result.isCrit) templateList = CRIT_TEMPLATES;
  else if (result.isGlancing) templateList = GLANCING_TEMPLATES;
  else if (result.damage > 25) templateList = HEAVY_TEMPLATES; // Threshold adjusted

  const template = getRandom(templateList);
  return formatTemplate(template, { attacker: attackerName, defender: defenderName });
};
