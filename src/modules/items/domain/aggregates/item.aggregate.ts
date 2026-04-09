import { ItemArmor } from '../value-objects/item-armor.vo';
import { ItemCategory } from '../value-objects/item-category.vo';
import { ItemInfo } from '../value-objects/item-info.vo';
import { ItemShield } from '../value-objects/item-shield.vo';
import { ItemWeapon } from '../value-objects/item-weapon.vo';
import { ItemModifier } from '../value-objects/item-modifier.vo';
import { ItemCreatedEvent, ItemUpdatedEvent } from '../events/item.events';
import { randomUUID } from 'crypto';
import { ItemModifierType } from '../value-objects/item-modifier-type.vo';
import { ItemProps } from './item-props';
import { NamedEntity } from 'src/modules/shared/domain/entities/named-entity';
import { ValidationError } from 'src/modules/shared/domain/errors/errors';
import { BaseAggregateRoot } from 'src/modules/shared/domain/aggregates/base-aggregate';

export class Item extends BaseAggregateRoot<ItemProps> {
  constructor(
    id: string,
    public realm: NamedEntity | null,
    public category: ItemCategory,
    public weapon: ItemWeapon | null,
    public armor: ItemArmor | null,
    public shield: ItemShield | null,
    public info: ItemInfo,
    public modifiers: ItemModifier[] | null,
    public description: string | null,
    public imageUrl: string | null,
    public owner: string,
    public createdAt: Date,
    public updatedAt: Date | null,
  ) {
    super(id);
  }

  public static create(props: Omit<ItemProps, 'createdAt' | 'updatedAt'>): Item {
    switch (props.category) {
      case 'weapon':
        if (!props.weapon) {
          throw new ValidationError('Weapon is required for weapon items');
        }
        if (!props.weapon.modes || props.weapon.modes.length === 0) {
          throw new ValidationError('At least one weapon mode is required for weapon items');
        }
        props.weapon.modes.forEach((mode) => {
          if (!mode.attackTable) throw new ValidationError('Attack table is required for each weapon mode');
          if (!mode.fumbleTable) throw new ValidationError('Fumble table is required for each weapon mode');
        });
        break;
      case 'armor':
        if (!props.armor) {
          throw new ValidationError('Armor is required for armor items');
        }
        break;
      case 'shield':
        if (!props.shield) {
          throw new ValidationError('Shield is required for shield items');
        }
        break;
      case 'clothes':
      case 'ammunition':
      case 'other':
      case 'coins':
      case 'food':
      case 'tools':
        break;
      default:
        throw new ValidationError('Invalid item category');
    }
    const item = new Item(
      props.id,
      props.realm,
      props.category,
      props.weapon,
      props.armor,
      props.shield,
      props.info,
      props.modifiers,
      props.description,
      props.imageUrl,
      props.owner,
      new Date(),
      null,
    );
    item.validate();
    item.apply(new ItemCreatedEvent(item.getProps()));
    return item;
  }

  public static fromProps(props: ItemProps): Item {
    return new Item(
      props.id,
      props.realm,
      props.category,
      props.weapon,
      props.armor,
      props.shield,
      props.info,
      props.modifiers,
      props.description,
      props.imageUrl,
      props.owner,
      props.createdAt,
      props.updatedAt,
    );
  }

  update(props: Partial<Omit<ItemProps, 'id' | 'realm' | 'createdAt' | 'owner'>>): void {
    const { category, weapon, armor, shield, info, modifiers, description, imageUrl } = props;
    if (category) this.category = category;
    if (weapon) this.weapon = weapon;
    if (armor) this.armor = armor;
    if (shield) this.shield = shield;
    if (info) this.info = info;
    if (modifiers !== undefined) this.modifiers = modifiers;
    if (description !== undefined) this.description = description;
    if (imageUrl !== undefined) this.imageUrl = imageUrl;
    this.validate();
    this.updatedAt = new Date();
    this.apply(new ItemUpdatedEvent(this.getProps()));
  }

  validate(): void {
    switch (this.category) {
      case 'weapon':
        if (!this.weapon) {
          throw new ValidationError('Weapon is required for weapon items');
        }
        break;
      case 'armor':
        if (!this.armor) {
          throw new ValidationError('Armor is required for armor items');
        }
        break;
      case 'shield':
        if (!this.shield) {
          throw new ValidationError('Shield is required for shield items');
        }
        break;
      case 'clothes':
      case 'ammunition':
      case 'other':
      case 'coins':
      case 'food':
      case 'tools':
        break;
      default:
        throw new ValidationError('Invalid item category');
    }
    if (!this.info) {
      throw new ValidationError('Info is required for all items');
    }
  }

  addModifier(type: ItemModifierType, modifier: string | undefined, value: number | undefined) {
    const id = randomUUID();
    const newModifier = new ItemModifier(id, type, modifier, value);
    if (!this.modifiers) {
      this.modifiers = [newModifier];
    } else {
      this.modifiers.push(newModifier);
    }
    this.apply(new ItemUpdatedEvent(this.getProps()));
  }

  removeModifier(modifierId: string) {
    if (!this.modifiers) return;
    this.modifiers = this.modifiers.filter((m) => m.id !== modifierId);
    this.apply(new ItemUpdatedEvent(this.getProps()));
  }

  getProps(): ItemProps {
    return {
      id: this.id,
      realm: this.realm,
      category: this.category,
      weapon: this.weapon,
      armor: this.armor,
      shield: this.shield,
      info: this.info,
      modifiers: this.modifiers,
      description: this.description,
      imageUrl: this.imageUrl,
      owner: this.owner,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
