import type { ItemArmor } from '../value-objects/item-armor.vo.js';
import type { ItemCategory } from '../value-objects/item-category.vo.js';
import type { ItemFeatures } from '../value-objects/item-features.vo.js';
import type { ItemInfo } from '../value-objects/item-info.vo.js';
import { ItemModifier } from '../value-objects/item-modifier.vo.js';
import { ItemShield } from '../value-objects/item-shield.vo.js';
import { ItemWeapon } from '../value-objects/item-weapon.vo.js';
import type { EntitySource } from '../../../shared/domain/entities/entity-source.js';

export interface ItemProps {
  id: string;
  name: string;
  realmId: string | null;
  category: ItemCategory;
  weapon: ItemWeapon | null;
  armor: ItemArmor | null;
  shield: ItemShield | null;
  /** Container, light, transport or ammunition data (spec 041, decision 4). */
  features?: ItemFeatures | null;
  info: ItemInfo;
  modifiers: ItemModifier[] | null;
  description: string | null;
  imageUrl: string | null;
  owner: string;
  /** Rulebook (`system`, admin only) or user content (spec 063). */
  entitySource: EntitySource;
  createdAt: Date;
  updatedAt: Date | null;
}

export type ItemCreationProps = Omit<ItemProps, 'id' | 'createdAt' | 'updatedAt'>;

export type ItemUpdateProps = Partial<Omit<ItemProps, 'id' | 'realmId' | 'category' | 'owner' | 'createdAt' | 'updatedAt'>>;
