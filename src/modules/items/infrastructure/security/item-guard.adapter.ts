import { QueryCriteria } from '../../../shared/application/criteria/query-criteria.js';
import { BaseEntityGuard } from '../../../shared/infrastructure/security/base-entity-guard.js';
import type { ItemGuardPort } from '../../application/ports/item-guard.port.js';
import { Item } from '../../domain/aggregates/item.aggregate.js';

/**
 * Permissions of items (spec 021, decision 2): the catalog is readable by everyone (every item is public); creating
 * needs rmu-user or rmu-admin; changing, deleting and the modifiers are for the owner or an admin.
 */
export class ItemGuardAdapter extends BaseEntityGuard<Item> implements ItemGuardPort {
  // Nothing to filter: accessType is not stored, every item is public.
  override buildQueryPredicate(): QueryCriteria {
    return QueryCriteria.empty();
  }
}
