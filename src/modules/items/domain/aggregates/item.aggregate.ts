import type { ItemArmor } from '../value-objects/item-armor.vo.js';
import type { ItemCategory } from '../value-objects/item-category.vo.js';
import type { ItemInfo } from '../value-objects/item-info.vo.js';
import { ItemShield } from '../value-objects/item-shield.vo.js';
import { ItemWeapon } from '../value-objects/item-weapon.vo.js';
import { ItemModifier } from '../value-objects/item-modifier.vo.js';
import { ItemCreatedEvent, ItemUpdatedEvent } from '../events/item.events.js';
import { randomUUID } from 'crypto';
import type { ItemModifierType } from '../value-objects/item-modifier-type.vo.js';
import type { ItemCreationProps, ItemProps, ItemUpdateProps } from './item-props.js';
import { ValidationError } from '../../../shared/domain/errors/errors.js';
import { BaseAggregateRoot } from '../../../shared/domain/aggregates/base-aggregate.js';
import type { AccessType } from '../../../shared/domain/entities/access-type.js';

export class Item extends BaseAggregateRoot<ItemProps> {
  constructor(
    id: string,
    public name: string,
    public realmId: string | null,
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

  /** The catalog is readable by everyone (spec 021, decision 2): not stored, every item is public. */
  get accessType(): AccessType {
    return 'public';
  }

  public static create(props: ItemCreationProps): Item {
    switch (props.category) {
      case 'weapon':
        if (!props.weapon) {
          throw new ValidationError('Weapon is required for weapon items');
        }
        if (!props.weapon.modes || props.weapon.modes.length === 0) {
          throw new ValidationError('At least one weapon mode is required for weapon items');
        }
        props.weapon.modes.forEach(mode => {
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
    // The id is the name in lower case with dashes, unique across users and realms: a second item with the same name
    // is a 409 duplicate-key. Strategic and tactical store these ids, so they do not change (spec 021, decision 5).
    const id = props.name.toLowerCase().replace(/\s+/g, '-');
    const item = new Item(
      id,
      props.name,
      props.realmId,
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
      props.name ?? props.id,
      props.realmId,
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

  update(props: ItemUpdateProps): void {
    const { name, weapon, armor, shield, info, modifiers, description, imageUrl } = props;
    if (name) this.name = name;
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

  addModifier(type: ItemModifierType, modifier: string | null, value: number | null) {
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
    this.modifiers = this.modifiers.filter(m => m.id !== modifierId);
    this.apply(new ItemUpdatedEvent(this.getProps()));
  }

  getProps(): ItemProps {
    return {
      id: this.id,
      name: this.name,
      realmId: this.realmId,
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
