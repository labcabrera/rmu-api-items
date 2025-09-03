import { ItemArmor, ItemCategory, ItemInfo, ItemWeapon } from '../../domain/entities/item';
import { ItemShield } from '../../infrastructure/persistence/models/item-childs.model';

export class CreateItemCommand {
  id: string;
  realm: string;
  category: ItemCategory;
  weapon: ItemWeapon | undefined;
  armor: ItemArmor | undefined;
  shield: ItemShield | undefined;
  info: ItemInfo;
  stackable: boolean;
  description: string | undefined;
  userId: string;
  roles: string[];
}
