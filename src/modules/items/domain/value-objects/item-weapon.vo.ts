import { ItemWeaponMode } from './item-weapon-mode.vo.js';

export class ItemWeapon {
  constructor(
    public skillId: string,
    public fumble: number,
    public modes: ItemWeaponMode[],
  ) {}
}
