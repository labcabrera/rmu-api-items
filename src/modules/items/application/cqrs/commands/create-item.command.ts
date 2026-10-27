import type { ItemArmor } from '../../../domain/value-objects/item-armor.vo.js';
import type { ItemCategory } from '../../../domain/value-objects/item-category.vo.js';
import type { ItemInfo } from '../../../domain/value-objects/item-info.vo.js';
import type { ItemFeatures } from '../../../domain/value-objects/item-features.vo.js';
import { ItemShield } from '../../../domain/value-objects/item-shield.vo.js';
import { ItemWeapon } from '../../../domain/value-objects/item-weapon.vo.js';
import { ItemModifier } from '../../../domain/value-objects/item-modifier.vo.js';

export class CreateItemCommand {
  public constructor(
    public readonly name: string,
    public readonly realmId: string | null,
    public readonly category: ItemCategory,
    public readonly weapon: ItemWeapon | null,
    public readonly armor: ItemArmor | null,
    public readonly shield: ItemShield | null,
    public readonly features: ItemFeatures | null,
    public readonly info: ItemInfo,
    public readonly modifiers: ItemModifier[] | null,
    public readonly description: string | null,
    public readonly imageUrl: string | null,
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}
