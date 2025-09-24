import { AggregateRoot } from '@nestjs/cqrs';
import { ItemArmor } from '../value-objects/item-armor.vo';
import { ItemCategory } from '../value-objects/item-category.vo';
import { ItemInfo } from '../value-objects/item-info.vo';
import { ItemShield } from '../value-objects/item-shield.vo';
import { ItemWeapon } from '../value-objects/item-weapon.vo';
import { DomainEvent } from 'src/modules/shared/domain/events/domain-event';
import { ItemCreatedEvent } from '../events/item.events';

export interface ItemProps {
  id: string;
  realm: string;
  category: ItemCategory;
  weapon?: ItemWeapon;
  armor?: ItemArmor;
  shield?: ItemShield;
  info: ItemInfo;
  stackable: boolean;
  description?: string;
  owner: string;
  createdAt: Date;
  updatedAt?: Date;
}

export class Item extends AggregateRoot<DomainEvent<ItemProps>> {
  constructor(
    public id: string,
    public realm: string,
    public category: ItemCategory,
    public weapon: ItemWeapon | undefined,
    public armor: ItemArmor | undefined,
    public shield: ItemShield | undefined,
    public info: ItemInfo,
    public stackable: boolean,
    public description: string | undefined,
    public owner: string,
    public createdAt: Date,
    public updatedAt: Date | undefined,
  ) {
    super();
  }

  public static create(props: Omit<ItemProps, 'createdAt' | 'updatedAt'>): Item {
    const item = new Item(
      props.id,
      props.realm,
      props.category,
      props.weapon,
      props.armor,
      props.shield,
      props.info,
      props.stackable,
      props.description,
      props.owner,
      new Date(),
      undefined,
    );
    this.apply(new ItemCreatedEvent(item));
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
      props.stackable,
      props.description,
      props.owner,
      props.createdAt,
      props.updatedAt,
    );
  }

  toProps(): ItemProps {
    return {
      id: this.id,
      realm: this.realm,
      category: this.category,
      weapon: this.weapon,
      armor: this.armor,
      shield: this.shield,
      info: this.info,
      stackable: this.stackable,
      description: this.description,
      owner: this.owner,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
