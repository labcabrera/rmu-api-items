import type { ItemArmor } from '../value-objects/item-armor.vo.js';
import type { ItemCategory } from '../value-objects/item-category.vo.js';
import type { ItemFeatures, ItemPoison } from '../value-objects/item-features.vo.js';
import type { ItemInfo } from '../value-objects/item-info.vo.js';
import { ItemShield } from '../value-objects/item-shield.vo.js';
import { ItemWeapon } from '../value-objects/item-weapon.vo.js';
import { ItemModifier } from '../value-objects/item-modifier.vo.js';
import { ItemCreatedEvent, ItemUpdatedEvent } from '../events/item.events.js';
import { randomUUID } from 'crypto';
import type { ItemModifierType } from '../value-objects/item-modifier-type.vo.js';
import { checkItemModifier } from '../value-objects/item-modifier-option.vo.js';
import type { ItemCreationProps, ItemProps, ItemUpdateProps } from './item-props.js';
import { NotFoundError, ValidationError } from '../../../shared/domain/errors/errors.js';
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
    public features: ItemFeatures | null,
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

  /**
   * The category data an item may have: a weapon, an armor or a shield needs its own data and no other. The same rules
   * apply to the creation and to every update (F-items-13).
   */
  public static checkCategoryData(
    category: ItemCategory,
    data: { weapon?: ItemWeapon | null; armor?: ItemArmor | null; shield?: ItemShield | null; features?: ItemFeatures | null },
  ): void {
    const { weapon, armor, shield, features } = data;
    // The general equipment blocks are for the general equipment (spec 041, decision 4)
    if (features && Object.values(features).some(value => !!value) && ['weapon', 'armor', 'shield'].includes(category)) {
      throw new ValidationError('Container, light, transport or ammunition info not allowed');
    }
    if (features?.ammunition && category !== 'ammunition') throw new ValidationError('Ammunition info not allowed');
    // Spec 042, decision 2
    if (features?.poison && category !== 'poison') throw new ValidationError('Poison info not allowed');
    if (features?.antidote && category !== 'herb') throw new ValidationError('Antidote info not allowed');
    if (category === 'poison' && !features?.poison) throw new ValidationError('Required poison info');
    if (features?.poison) Item.checkPoison(features.poison);
    switch (category) {
      case 'weapon':
        if (!weapon) throw new ValidationError('Required weapon info');
        if (armor) throw new ValidationError('Armor info not allowed');
        if (shield) throw new ValidationError('Shield info not allowed');
        break;
      case 'armor':
        if (!armor) throw new ValidationError('Required armor info');
        if (weapon) throw new ValidationError('Weapon info not allowed');
        if (shield) throw new ValidationError('Shield info not allowed');
        break;
      case 'shield':
        if (!shield) throw new ValidationError('Required shield info');
        if (weapon) throw new ValidationError('Weapon info not allowed');
        if (armor) throw new ValidationError('Armor info not allowed');
        break;
      case 'tools':
      case 'other':
        // Spec 041, decision 5: a tool may be an improvised weapon
        if (armor) throw new ValidationError('Armor info not allowed');
        if (shield) throw new ValidationError('Shield info not allowed');
        break;
      case 'clothes':
      case 'ammunition':
      case 'coins':
      case 'food':
      case 'container':
      case 'light':
      case 'mount':
      case 'vehicle':
      case 'service':
      case 'instrument':
      case 'poison':
      case 'herb':
        if (weapon) throw new ValidationError('Weapon info not allowed');
        if (armor) throw new ValidationError('Armor info not allowed');
        if (shield) throw new ValidationError('Shield info not allowed');
        break;
      default:
        throw new ValidationError('Invalid item category');
    }
    if (armor) Item.checkArmor(armor);
    if (weapon) Item.checkWeapon(weapon);
  }

  private static checkPoison(poison: ItemPoison): void {
    for (const [name, range] of Object.entries({ 'immediate hits': poison.immediateHits, onset: poison.onsetRounds })) {
      if (range && range.min > range.max) throw new ValidationError(`Invalid poison ${name} range`);
    }
  }

  private static checkWeapon(weapon: ItemWeapon): void {
    if (!weapon.modes || weapon.modes.length === 0) {
      throw new ValidationError('At least one weapon mode is required for weapon items');
    }
    weapon.modes.forEach(mode => {
      if (!mode.attackTable) throw new ValidationError('Attack table is required for each weapon mode');
      if (!mode.fumbleTable) throw new ValidationError('Fumble table is required for each weapon mode');
    });
  }

  /** A piece covers at least its own slot (spec 041, decision 6). */
  private static checkArmor(armor: ItemArmor): void {
    if (armor.coverage && armor.coverage.length > 0 && !armor.coverage.includes(armor.slot)) {
      throw new ValidationError('The armor coverage must include its slot');
    }
  }

  /**
   * The modifiers sent with the creation or a PATCH follow the same options as POST .../modifiers (spec 044, decision
   * 10; F-items-23).
   */
  public static checkModifiers(modifiers: ItemModifier[] | null | undefined): void {
    modifiers?.forEach(m => checkItemModifier(m.type, m.modifier, m.value));
  }

  public static create(props: ItemCreationProps): Item {
    Item.checkCategoryData(props.category, props);
    Item.checkModifiers(props.modifiers);
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
      props.features ?? null,
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
      props.features ?? null,
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
    const { name, weapon, armor, shield, features, info, modifiers, description, imageUrl } = props;
    // Only the modifiers the PATCH sends are checked: a stored item that breaks the rules can still change other fields.
    Item.checkModifiers(modifiers);
    if (name) this.name = name;
    if (weapon) this.weapon = weapon;
    if (armor) this.armor = armor;
    if (shield) this.shield = shield;
    if (features !== undefined) this.features = features;
    if (info) this.info = info;
    if (modifiers !== undefined) this.modifiers = modifiers;
    if (description !== undefined) this.description = description;
    if (imageUrl !== undefined) this.imageUrl = imageUrl;
    // Weapon, armor or shield data on an item of another category is a 400, as in the creation (F-items-13).
    Item.checkCategoryData(this.category, this);
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
      case 'container':
      case 'light':
      case 'mount':
      case 'vehicle':
      case 'service':
      case 'instrument':
      case 'poison':
      case 'herb':
        break;
      default:
        throw new ValidationError('Invalid item category');
    }
    if (!this.info) {
      throw new ValidationError('Info is required for all items');
    }
  }

  addModifier(type: ItemModifierType, modifier: string | null, value: number | null) {
    checkItemModifier(type, modifier, value);
    const id = randomUUID();
    const newModifier = new ItemModifier(id, type, modifier, value);
    if (!this.modifiers) {
      this.modifiers = [newModifier];
    } else {
      this.modifiers.push(newModifier);
    }
    this.updatedAt = new Date();
    this.apply(new ItemUpdatedEvent(this.getProps()));
  }

  /** A modifier the item does not have is a 404, without a write or an event (F-items-12). */
  removeModifier(modifierId: string) {
    if (!this.modifiers?.some(m => m.id === modifierId)) throw new NotFoundError('Item modifier', modifierId);
    this.modifiers = this.modifiers.filter(m => m.id !== modifierId);
    this.updatedAt = new Date();
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
      features: this.features,
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
