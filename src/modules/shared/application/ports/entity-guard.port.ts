import { QueryCriteria } from '../criteria/query-criteria.js';
import type { EntitySource } from '../../domain/entities/entity-source.js';

export interface EntityGuard<E> {
  checkCreate(roles: string[]): void;

  checkRead(entity: E, userId: string, roles: string[]): void;

  /** Owner or admin; a system entity is admin only (spec 063). */
  checkUpdate(entity: E, userId: string, roles: string[]): void;

  /** Owner or admin; a system entity is admin only (spec 063). */
  checkDelete(entity: E, userId: string, roles: string[]): void;

  /** Only an admin may ask for `system`, on create or in a PATCH; undefined and `user` pass (spec 063). */
  checkEntitySource(roles: string[], value: EntitySource | undefined): void;

  buildQueryPredicate(userId: string, roles: string[]): QueryCriteria;
}
