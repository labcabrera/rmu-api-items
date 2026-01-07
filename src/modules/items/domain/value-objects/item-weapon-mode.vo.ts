import { AttackTable } from './attack-table.vo';
import { FumbleTable } from './fumble-table.vo';
import { ItemWeaponRange } from './item-weapon-range.vo';
import { WeaponMode } from './weapon-mode.vo';

export class ItemWeaponMode {
  constructor(
    public readonly type: WeaponMode,
    public readonly attackTable: AttackTable,
    public readonly fumbleTable: FumbleTable,
    public readonly sizeAdjustment: number,
    public readonly ranges: ItemWeaponRange[] | undefined,
    public readonly alternativeTable: AttackTable | undefined,
  ) {}
}
