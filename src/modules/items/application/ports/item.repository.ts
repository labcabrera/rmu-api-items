import { Item } from 'src/modules/items/domain/aggregates/item.aggregate';
import { Page } from 'src/modules/shared/domain/entities/page';

export interface ItemRepository {
  findById(id: string): Promise<Item | null>;

  findByRsql(rsql: string | undefined, page: number, size: number): Promise<Page<Item>>;

  save(Item: Item): Promise<Item>;

  update(ItemId: string, Item: Partial<Item>): Promise<Item>;

  deleteById(id: string): Promise<Item | null>;
}
