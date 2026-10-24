import type { ArmorSlot } from './armor-slot.vo.js';
import type { DifficultyCode } from './difficulty-code.vo.js';

export interface ItemArmor {
  slot: ArmorSlot;
  at: number;
  enc: number;
  maneuverPenalty: number;
  rangedPenalty: number;
  perceptionPenalty: number;
  baseDifficulty: DifficultyCode;
}
