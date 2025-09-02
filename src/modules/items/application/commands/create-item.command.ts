import { ItemCategory, ItemInfo, ItemWeapon, ItemWeaponRange } from '../../domain/entities/item';

export class CreateItemCommand {
  id: string;
  realm: string;
  category: ItemCategory;
  weapon: ItemWeapon | undefined;
  weaponRange: ItemWeaponRange[] | undefined;
  info: ItemInfo;
  description: string | undefined;
  userId: string;
  roles: string[];
}
