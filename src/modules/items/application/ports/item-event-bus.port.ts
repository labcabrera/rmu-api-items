import { ItemProps } from 'src/modules/items/domain/aggregates/item.aggregate';
import { DomainEvent } from 'src/modules/shared/domain/events/domain-event';

export interface ItemEventBusPort {
  publish(event: DomainEvent<ItemProps>): void;
}
