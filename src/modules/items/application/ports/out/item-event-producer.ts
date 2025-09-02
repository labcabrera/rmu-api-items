import { Item } from 'src/modules/items/domain/entities/item';

export interface ItemEventProducer {
  created(entity: Item): Promise<void>;
  updated(entity: Item): Promise<void>;
  deleted(entity: Item): Promise<void>;
}
