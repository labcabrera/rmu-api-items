import type { Item } from '../../domain/aggregates/item.aggregate.js';
import type { ItemAccess } from '../../domain/services/realm-child-access.js';

/** An item with what the caller can do with it (`ItemDto.access`, spec 073). */
export type ItemWithAccess = { item: Item; access: ItemAccess };
