import { ItemWeaponMode } from './item-weapon-mode.vo.js';

export class ItemWeapon {
  constructor(
    public skillId: string,
    public fumble: number,
    public modes: ItemWeaponMode[],
    /**
     * What the skill and modes do not tell (workspace spec 032), such as `fencing`, `quarterstaff`, `axe`, `whip` or
     * `improvised`: the requirements of the fighting styles read them.
     */
    public tags: string[] = [],
  ) {}
}
