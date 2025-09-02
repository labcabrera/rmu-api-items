import { ItemCategory, ItemInfo, ItemWeapon } from '../../domain/entities/item';

export class CreateItemCommand {
  id: string;
  realm: string;
  category: ItemCategory;
  weapon: ItemWeapon | undefined;
  info: ItemInfo;
  description: string | undefined;
  userId: string;
  roles: string[];
}
