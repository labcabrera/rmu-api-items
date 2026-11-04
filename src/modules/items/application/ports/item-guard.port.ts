import type { QueryCriteria } from '../../../shared/application/criteria/query-criteria.js';
import type { EntitySource } from '../../../shared/domain/entities/entity-source.js';
import type { Item } from '../../domain/aggregates/item.aggregate.js';
import type { AccessCaller, ItemAccess } from '../../domain/services/realm-child-access.js';

export const ITEM_GUARD = Symbol('ItemGuardPort');

/**
 * Permissions of items (spec 073): an item of a realm takes the access of the caller to the realm; an item of the
 * global catalog keeps the rules of specs 021 and 063 (everyone reads it, its owner or an admin changes it, a system
 * one only an admin).
 */
export interface ItemGuardPort {
  /** rmu-user or rmu-admin. */
  checkCreate(roles: readonly string[]): void;

  /** Only an admin may ask for `system`, on create or in a PATCH; undefined and `user` pass (spec 063). */
  checkEntitySource(roles: readonly string[], value: EntitySource | undefined): void;

  /** Throws ForbiddenError when the caller cannot read the item; otherwise, what the caller can do with it. */
  checkRead(item: Item, caller: AccessCaller): ItemAccess;

  /** Changing the item and its modifiers. */
  checkUpdate(item: Item, caller: AccessCaller): void;

  checkDelete(item: Item, caller: AccessCaller): void;

  /** The items a caller lists: everything for an admin, the global catalog and the realms read otherwise. */
  buildQueryPredicate(caller: AccessCaller): QueryCriteria;
}
