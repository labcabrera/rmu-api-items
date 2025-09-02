import { DomainEvent } from 'src/modules/shared/domain/events/domain-event';
import { Item } from '../entities/item';

export class ItemCreatedEvent extends DomainEvent<Item> {
  constructor(data: Item) {
    super('ItemCreatedEvent', data);
  }
}

export class ItemUpdatedEvent extends DomainEvent<Item> {
  constructor(data: Item) {
    super('ItemUpdatedEvent', data);
  }
}

export class ItemDeletedEvent extends DomainEvent<Item> {
  constructor(data: Item) {
    super('ItemDeletedEvent', data);
  }
}
