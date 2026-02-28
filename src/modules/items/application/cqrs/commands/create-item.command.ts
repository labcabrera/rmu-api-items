import { ItemArmor } from 'src/modules/items/domain/value-objects/item-armor.vo';
import { ItemCategory } from 'src/modules/items/domain/value-objects/item-category.vo';
import { ItemInfo } from 'src/modules/items/domain/value-objects/item-info.vo';
import { ItemShield } from 'src/modules/items/domain/value-objects/item-shield.vo';
import { ItemWeapon } from 'src/modules/items/domain/value-objects/item-weapon.vo';

export class CreateItemCommand {
  public constructor(
    public readonly id: string,
    public readonly realmId: string,
    public readonly category: ItemCategory,
    public readonly weapon: ItemWeapon | undefined,
    public readonly armor: ItemArmor | undefined,
    public readonly shield: ItemShield | undefined,
    public readonly info: ItemInfo,
    public readonly stackable: boolean,
    public readonly description: string | undefined,
    public readonly imageUrl: string | undefined,
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}
