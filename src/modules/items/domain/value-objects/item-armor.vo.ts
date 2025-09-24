import { ArmorSlot } from './armor-slot.vo';
import { DifficultyCode } from './difficulty-code.vo';

export interface ItemArmor {
  slot: ArmorSlot;
  at: number;
  enc: number;
  maneuver: number;
  rangedPenalty: number;
  perception: number;
  baseDifficulty: DifficultyCode;
}
