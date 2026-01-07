import { WeaponMode } from './weapon-mode.vo';

export class ItemWeaponMode {
  constructor(
    public readonly type: WeaponMode,
    public readonly attackTable: string,
    public readonly fumbleTable: string,
    public readonly sizeAdjustment: number,
    public readonly alternativeTable: string | undefined,
  ) {}
}
