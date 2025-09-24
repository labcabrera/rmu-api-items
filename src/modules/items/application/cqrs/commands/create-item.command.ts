import { ItemProps } from 'src/modules/items/domain/aggregates/item.aggregate';
import { ItemArmor } from 'src/modules/items/domain/value-objects/item-armor.vo';
import { ItemCategory } from 'src/modules/items/domain/value-objects/item-category.vo';
import { ItemInfo } from 'src/modules/items/domain/value-objects/item-info.vo';
import { ItemShield } from 'src/modules/items/domain/value-objects/item-shield.vo';
import { ItemWeapon } from 'src/modules/items/domain/value-objects/item-weapon.vo';

export class CreateItemCommand {
  private constructor(
    public readonly id: string,
    public readonly realm: string,
    public readonly category: ItemCategory,
    public readonly weapon: ItemWeapon | undefined,
    public readonly armor: ItemArmor | undefined,
    public readonly shield: ItemShield | undefined,
    public readonly info: ItemInfo,
    public readonly stackable: boolean,
    public readonly description: string | undefined,
    public readonly userId: string,
    public readonly roles: string[],
  ) {}

  static create(props: Omit<ItemProps, 'createdAt' | 'updatedAt'>, userId: string, roles: string[]): CreateItemCommand {
    return new CreateItemCommand(
      props.id,
      props.realm,
      props.category,
      props.weapon,
      props.armor,
      props.shield,
      props.info,
      props.stackable,
      props.description,
      userId,
      roles,
    );
  }
}
