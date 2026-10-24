import { Item } from '../../domain/aggregates/item.aggregate';
import { Page } from '../../../shared/application/pagination/page';

export interface ItemRepository {
  findById(id: string): Promise<Item | null>;

  findByRsql(rsql: string | undefined, page: number, size: number): Promise<Page<Item>>;

  save(Item: Item): Promise<Item>;

  update(ItemId: string, Item: Partial<Item>): Promise<Item>;

  deleteById(id: string): Promise<Item | null>;
}

export const ITEM_REPOSITORY = Symbol('ItemRepository');
