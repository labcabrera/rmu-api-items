import type { EntitySource } from '../entities/entity-source.js';
import { RMU_ADMIN } from '../entities/user-roles.js';
import { ForbiddenError } from '../errors/errors.js';

/** The error code of a change to a system entity (or a request for `system`) without rmu-admin (spec 063). */
export const SYSTEM_ENTITY_ADMIN_ONLY = 'system-entity-admin-only';

type ChangeableEntity = { owner?: string | null; entitySource?: EntitySource | null };

const isAdmin = (roles: string[]) => roles.includes(RMU_ADMIN);

/**
 * Admin: always. System entity: admin only. User entity: its owner (and the admin, until the friends spec). A missing
 * source counts as `user`.
 */
export function canChangeEntity(entity: ChangeableEntity, userId: string, roles: string[]): boolean {
  if (isAdmin(roles)) return true;
  if ((entity.entitySource ?? 'user') === 'system') return false;
  return !!entity.owner && entity.owner === userId;
}

/** Throws ForbiddenError(SYSTEM_ENTITY_ADMIN_ONLY) when a non-admin asks for 'system'. undefined and 'user' pass. */
export function checkEntitySource(value: EntitySource | undefined, roles: string[]): void {
  if (value === 'system' && !isAdmin(roles)) {
    throw new ForbiddenError('Only an admin can set the system source', SYSTEM_ENTITY_ADMIN_ONLY);
  }
}

/** Throws ForbiddenError: SYSTEM_ENTITY_ADMIN_ONLY for a system entity, 'forbidden' otherwise. */
export function assertCanChangeEntity(entity: ChangeableEntity, userId: string, roles: string[], action: 'update' | 'delete'): void {
  if (canChangeEntity(entity, userId, roles)) return;
  if ((entity.entitySource ?? 'user') === 'system') {
    throw new ForbiddenError(`Only an admin can ${action} a system entity`, SYSTEM_ENTITY_ADMIN_ONLY);
  }
  throw new ForbiddenError(`You do not have permission to ${action} this entity`);
}
