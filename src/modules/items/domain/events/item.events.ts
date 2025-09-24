import { DomainEvent } from 'src/modules/shared/domain/events/domain-event';
import { Item, ItemProps } from '../aggregates/item.aggregate';

export class ItemCreatedEvent extends DomainEvent<ItemProps> {
  constructor(data: ItemProps) {
    super('ItemCreatedEvent', data);
  }
}

export class ItemUpdatedEvent extends DomainEvent<ItemProps> {
  constructor(data: ItemProps) {
    super('ItemUpdatedEvent', data);
  }
}

export class ItemDeletedEvent extends DomainEvent<ItemProps> {
  constructor(data: ItemProps) {
    super('ItemDeletedEvent', data);
  }
}
