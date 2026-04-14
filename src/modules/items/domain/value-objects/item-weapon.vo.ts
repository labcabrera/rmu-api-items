import { ItemWeaponMode } from './item-weapon-mode.vo';

export class ItemWeapon {
  constructor(
    public skillId: string,
    public fumble: number,
    public modes: ItemWeaponMode[],
  ) {}
}
