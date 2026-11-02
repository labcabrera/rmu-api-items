import { Item } from '../../domain/aggregates/item.aggregate.js';
import type { BaseRepository } from '../../../shared/application/ports/base-repository.port.js';

export type ItemRepository = BaseRepository<Item>;

export const ITEM_REPOSITORY = Symbol('ItemRepository');
