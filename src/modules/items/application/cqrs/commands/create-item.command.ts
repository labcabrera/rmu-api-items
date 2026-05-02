import { ItemArmor } from 'src/modules/items/domain/value-objects/item-armor.vo';
import { ItemCategory } from 'src/modules/items/domain/value-objects/item-category.vo';
import { ItemInfo } from 'src/modules/items/domain/value-objects/item-info.vo';
import { ItemShield } from 'src/modules/items/domain/value-objects/item-shield.vo';
import { ItemWeapon } from 'src/modules/items/domain/value-objects/item-weapon.vo';
import { ItemModifier } from 'src/modules/items/domain/value-objects/item-modifier.vo';

export class CreateItemCommand {
  public constructor(
    public readonly name: string,
    public readonly realmId: string | null,
    public readonly category: ItemCategory,
    public readonly weapon: ItemWeapon | null,
    public readonly armor: ItemArmor | null,
    public readonly shield: ItemShield | null,
    public readonly info: ItemInfo,
    public readonly modifiers: ItemModifier[] | null,
    public readonly description: string | null,
    public readonly imageUrl: string | null,
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}
