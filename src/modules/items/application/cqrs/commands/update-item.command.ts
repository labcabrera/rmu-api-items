import type { ItemArmor } from '../../../domain/value-objects/item-armor.vo.js';
import type { ItemInfo } from '../../../domain/value-objects/item-info.vo.js';
import { ItemShield } from '../../../domain/value-objects/item-shield.vo.js';
import { ItemWeapon } from '../../../domain/value-objects/item-weapon.vo.js';
import { ItemModifier } from '../../../domain/value-objects/item-modifier.vo.js';

export class UpdateItemCommand {
  constructor(
    public readonly id: string,
    public readonly name: string | undefined,
    public readonly weapon: ItemWeapon | undefined,
    public readonly armor: ItemArmor | undefined,
    public readonly shield: ItemShield | undefined,
    public readonly info: ItemInfo | undefined,
    public readonly modifiers: ItemModifier[] | undefined,
    public readonly description: string | undefined,
    public readonly imageUrl: string | undefined,
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}
