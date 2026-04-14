import { NamedEntity } from 'src/modules/shared/domain/entities/named-entity';
import { ItemArmor } from '../value-objects/item-armor.vo';
import { ItemCategory } from '../value-objects/item-category.vo';
import { ItemInfo } from '../value-objects/item-info.vo';
import { ItemModifier } from '../value-objects/item-modifier.vo';
import { ItemShield } from '../value-objects/item-shield.vo';
import { ItemWeapon } from '../value-objects/item-weapon.vo';

export interface ItemProps {
  id: string;
  realm: NamedEntity | null;
  category: ItemCategory;
  weapon: ItemWeapon | null;
  armor: ItemArmor | null;
  shield: ItemShield | null;
  info: ItemInfo;
  modifiers: ItemModifier[] | null;
  description: string | null;
  imageUrl: string | null;
  owner: string;
  createdAt: Date;
  updatedAt: Date | null;
}
