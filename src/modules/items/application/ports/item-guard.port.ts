import type { EntityGuard } from '../../../shared/application/ports/entity-guard.port.js';
import { Item } from '../../domain/aggregates/item.aggregate.js';

export const ITEM_GUARD = Symbol('ItemGuardPort');

export type ItemGuardPort = EntityGuard<Item>;
