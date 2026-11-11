import { Item } from '../../domain/aggregates/item.aggregate.js';
import type { BaseRepository } from '../../../shared/application/ports/base-repository.port.js';

export interface ItemRepository extends BaseRepository<Item> {
  /** Every item of a realm, for the cascade of realm.deleted (spec 073). */
  findByRealmId(realmId: string): Promise<Item[]>;
}

export const ITEM_REPOSITORY = Symbol('ItemRepository');
