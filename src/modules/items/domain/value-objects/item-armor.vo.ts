import { ArmorSlot } from './armor-slot.vo';
import { DifficultyCode } from './difficulty-code.vo';

export interface ItemArmor {
  slot: ArmorSlot;
  at: number;
  enc: number;
  maneuverPenalty: number;
  rangedPenalty: number;
  perceptionPenalty: number;
  baseDifficulty: DifficultyCode;
}
