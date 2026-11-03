import type { EntitySource } from '../../../shared/domain/entities/entity-source.js';
import { RMU_ADMIN } from '../../../shared/domain/entities/user-roles.js';

/** What a user can do with an entity, from less to more (spec 069 of core). */
export const ACCESS_LEVELS = ['none', 'read', 'write', 'manage'] as const;

export type AccessLevel = (typeof ACCESS_LEVELS)[number];

/** The access an item answers with (`ItemDto.access`): a visible item is at least read. */
export type ItemAccess = Exclude<AccessLevel, 'none'>;

/** The level of a user on each realm they read, as core answers it (realms without access are missing). */
export type RealmLevels = ReadonlyMap<string, AccessLevel>;

/** Who asks: the realm levels are empty for an admin, who never asks core. */
export type AccessCaller = { userId: string; roles: readonly string[]; realmLevels: RealmLevels };

/** The fields of an item the access depends on. */
export type AccessSubject = { realmId?: string | null; owner?: string | null; entitySource?: EntitySource | null };

export function atLeast(level: AccessLevel, required: AccessLevel): boolean {
  return ACCESS_LEVELS.indexOf(level) >= ACCESS_LEVELS.indexOf(required);
}

const isAdmin = (roles: readonly string[]) => roles.includes(RMU_ADMIN);

/**
 * The access to a child of a realm (spec 073, decision 1), as `resolveChildAccess` of core: an admin manages it; a
 * system child is read when the realm is read; any other child takes the level on the realm, at most `write`. The
 * owner of the child gives nothing.
 */
export function resolveRealmChildAccess(child: AccessSubject, realmLevel: AccessLevel, roles: readonly string[]): AccessLevel {
  if (isAdmin(roles)) return 'manage';
  if (realmLevel === 'none') return 'none';
  if (child.entitySource === 'system') return 'read';
  return realmLevel === 'manage' ? 'write' : realmLevel;
}

/**
 * The access to an item of the global catalog (`realmId: null`, spec 073, decision 3), from the rules of spec 063:
 * every user reads it, its owner manages a user item, an admin manages everything and a system item is read only.
 */
export function resolveGlobalItemAccess(item: AccessSubject, userId: string, roles: readonly string[]): ItemAccess {
  if (isAdmin(roles)) return 'manage';
  if ((item.entitySource ?? 'user') === 'system') return 'read';
  return !!item.owner && item.owner === userId ? 'manage' : 'read';
}

/** The access of the caller to an item: of its realm when it has one, of the global catalog otherwise. */
export function resolveItemAccess(item: AccessSubject, caller: AccessCaller): AccessLevel {
  if (!item.realmId) return resolveGlobalItemAccess(item, caller.userId, caller.roles);
  return resolveRealmChildAccess(item, caller.realmLevels.get(item.realmId) ?? 'none', caller.roles);
}
