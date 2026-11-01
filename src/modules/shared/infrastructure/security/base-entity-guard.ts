import { ForbiddenError } from '../../domain/errors/errors.js';
import { RMU_ADMIN, RMU_USER } from '../../domain/entities/user-roles.js';
import type { RbacEntity } from '../../domain/entities/rbac-entity.js';
import type { EntitySource } from '../../domain/entities/entity-source.js';
import { assertCanChangeEntity, checkEntitySource } from '../../domain/services/entity-permissions.js';
import { QueryCriteria } from '../../application/criteria/query-criteria.js';
import type { EntityGuard } from '../../application/ports/entity-guard.port.js';

export abstract class BaseEntityGuard<E extends RbacEntity> implements EntityGuard<E> {
  checkRead(entity: E, userId: string, roles: string[]) {
    if (entity.accessType === 'public') return;
    if (roles.includes(RMU_ADMIN)) return;
    if (entity.owner === userId) return;
    throw new ForbiddenError('You do not have permission to read this entity');
  }

  checkCreate(roles: string[]) {
    if (roles.includes(RMU_ADMIN)) return;
    if (roles.includes(RMU_USER)) return;
    throw new ForbiddenError('You do not have permission to create this entity');
  }

  /** Spec 063: a system entity is admin only; a user entity is for its owner or an admin. */
  checkUpdate(entity: E, userId: string, roles: string[]) {
    assertCanChangeEntity(entity, userId, roles, 'update');
  }

  checkDelete(entity: E, userId: string, roles: string[]) {
    assertCanChangeEntity(entity, userId, roles, 'delete');
  }

  checkEntitySource(roles: string[], value: EntitySource | undefined) {
    checkEntitySource(value, roles);
  }

  buildQueryPredicate(userId: string, roles: string[]): QueryCriteria {
    if (roles.includes(RMU_ADMIN)) return QueryCriteria.empty();
    return QueryCriteria.anyOf([QueryCriteria.eq('accessType', 'public'), QueryCriteria.eq('owner', userId)]);
  }
}
