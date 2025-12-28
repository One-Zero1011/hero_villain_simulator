
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

  // 2. Base Damage Calculation
  // Attack Rating: Strength contributes heavily to physical force, Power is raw tier
  let attackRating = (attStats.strength * 0.5) + (attacker.power * 0.4);

  // 3. Defense Mitigation
  // Stamina absorbs damage, Intelligence predicts attacks (parrying/dodging)
  const defenseRating = (defStats.stamina * 0.3) + (defStats.intelligence * 0.1);

  // 4. Intelligence Check (Tactical Advantage)
  // If attacker is smarter, they find weak points, bypassing some defense or adding damage
  if (attStats.intelligence > defStats.intelligence) {
    const diff = attStats.intelligence - defStats.intelligence;
    attackRating += diff * 0.2; // Add 20% of the diff as extra damage rating
  }

  // 5. Calculate Raw Damage
  let rawDamage = Math.max(5, attackRating - defenseRating);

  // 6. Variance (+/- 15%)
  const variance = 0.85 + Math.random() * 0.3;
  rawDamage *= variance;

  // 7. Apply Crit Multiplier
  if (isCrit) {
    rawDamage *= 1.5;
  }

  // 8. Glancing Blow (If Defender Luck is high vs Attacker Luck)
  let isGlancing = false;
  if (!isCrit && defStats.luck > attStats.luck && Math.random() < 0.2) {
    isGlancing = true;
    rawDamage *= 0.7; // 30% reduction
  }

  // Scaling: Map stat-based damage (roughly 0-100 range) to HP percentage logic
  // Assuming 100% HP represents a full health bar. 
  // We clamp damage between 3 and 35 per turn to ensure battles last 3-10 turns.
  const finalDamage = Math.max(3, Math.min(35, Math.round(rawDamage / 2))); // Scale down for % based HP system

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
  else if (result.damage > 15) templateList = HEAVY_TEMPLATES;

  const template = getRandom(templateList);
  return formatTemplate(template, { attacker: attackerName, defender: defenderName });
};
