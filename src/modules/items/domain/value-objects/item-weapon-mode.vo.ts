import type { AttackTable } from './attack-table.vo.js';
import type { FumbleTable } from './fumble-table.vo.js';
import { ItemWeaponRange } from './item-weapon-range.vo.js';
import type { WeaponMode } from './weapon-mode.vo.js';
import type { AttackType } from './attack-type.vo.js';

export class ItemWeaponMode {
  constructor(
    public readonly type: WeaponMode,
    public readonly attackTypes: AttackType[],
    public readonly attackTable: AttackTable,
    public readonly fumbleTable: FumbleTable,
    public readonly sizeAdjustment: number,
    public readonly ranges: ItemWeaponRange[] | undefined,
    public readonly alternativeTable: AttackTable | undefined,
  ) {
    if (ranges && ranges.length === 0) {
      this.ranges = undefined;
    }
  }
}
