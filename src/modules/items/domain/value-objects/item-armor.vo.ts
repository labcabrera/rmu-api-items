import type { ArmorSlot } from './armor-slot.vo.js';
import type { DifficultyCode } from './difficulty-code.vo.js';
import type { ArmorClass } from './item-features.vo.js';

export interface ItemArmor {
  slot: ArmorSlot;
  at: number;
  enc: number;
  maneuverPenalty: number;
  rangedPenalty: number;
  perceptionPenalty: number;
  baseDifficulty: DifficultyCode;
  /** The slots it covers, `slot` among them: a full suit covers the four (spec 041, decision 6). Absent: only `slot`. */
  coverage?: ArmorSlot[] | null;
  /** Light, medium or heavy helmet, vambraces or greaves (spec 041, decision 7). */
  class?: ArmorClass | null;
}
