import { QueryCriteria } from '../../../shared/application/criteria/query-criteria.js';
import type { EntitySource } from '../../../shared/domain/entities/entity-source.js';
import { RMU_ADMIN, RMU_USER } from '../../../shared/domain/entities/user-roles.js';
import { ForbiddenError } from '../../../shared/domain/errors/errors.js';
import { checkEntitySource, SYSTEM_ENTITY_ADMIN_ONLY } from '../../../shared/domain/services/entity-permissions.js';
import type { ItemGuardPort } from '../../application/ports/item-guard.port.js';
import type { Item } from '../../domain/aggregates/item.aggregate.js';
import { type AccessCaller, atLeast, type ItemAccess, resolveItemAccess } from '../../domain/services/realm-child-access.js';

/**
 * Spec 073: an item with a realm is a child of the realm (read to read it, write to change, delete it or its
 * modifiers); an item without realm is global: every user reads it and only an admin changes it (decision 3).
 */
export class ItemGuardAdapter implements ItemGuardPort {
  checkCreate(roles: readonly string[]): void {
    if (roles.includes(RMU_ADMIN) || roles.includes(RMU_USER)) return;
    throw new ForbiddenError('You do not have permission to create this entity');
  }

  checkEntitySource(roles: readonly string[], value: EntitySource | undefined): void {
    checkEntitySource(value, [...roles]);
  }

  checkRead(item: Item, caller: AccessCaller): ItemAccess {
    const level = resolveItemAccess(item, caller);
    if (level === 'none') throw new ForbiddenError('You do not have permission to read this entity');
    return level;
  }

  checkUpdate(item: Item, caller: AccessCaller): void {
    this.checkChange(item, caller, 'update');
  }

  checkDelete(item: Item, caller: AccessCaller): void {
    this.checkChange(item, caller, 'delete');
  }

  buildQueryPredicate(caller: AccessCaller): QueryCriteria {
    if (caller.roles.includes(RMU_ADMIN)) return QueryCriteria.empty();
    const global = QueryCriteria.eq('realmId', null);
    const realmIds = [...caller.realmLevels].filter(([, level]) => level !== 'none').map(([realmId]) => realmId);
    if (realmIds.length === 0) return global;
    return QueryCriteria.anyOf([global, QueryCriteria.in('realmId', realmIds)]);
  }

  private checkChange(item: Item, caller: AccessCaller, action: 'update' | 'delete'): void {
    if (atLeast(resolveItemAccess(item, caller), 'write')) return;
    // As assertAccess of core: a system item says it is for admins, whatever the realm level.
    if (item.entitySource === 'system') {
      throw new ForbiddenError(`Only an admin can ${action} a system entity`, SYSTEM_ENTITY_ADMIN_ONLY);
    }
    throw new ForbiddenError(`You do not have permission to ${action} this entity`);
  }
}
