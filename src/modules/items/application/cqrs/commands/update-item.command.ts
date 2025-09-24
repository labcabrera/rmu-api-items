import { ItemInfo } from 'src/modules/items/domain/value-objects/item-info.vo';
import { ItemArmor, ItemShield, ItemWeapon } from 'src/modules/items/infrastructure/persistence/models/item-childs.model';

export class UpdateItemCommand {
  constructor(
    public readonly id: string,
    public readonly weapon: ItemWeapon | undefined,
    public readonly armor: ItemArmor | undefined,
    public readonly shield: ItemShield | undefined,
    public readonly info: ItemInfo | undefined,
    public readonly stackable: boolean | undefined,
    public readonly description: string | undefined,
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}
