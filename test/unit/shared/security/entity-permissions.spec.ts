import type { EntitySource } from '../../../../src/modules/shared/domain/entities/entity-source.js';
import { ForbiddenError } from '../../../../src/modules/shared/domain/errors/errors.js';
import {
  SYSTEM_ENTITY_ADMIN_ONLY,
  assertCanChangeEntity,
  canChangeEntity,
  checkEntitySource,
} from '../../../../src/modules/shared/domain/services/entity-permissions.js';

const ADMIN = ['rmu-admin'];
const USER = ['rmu-user'];
const OWNER = 'u-owner';

type Caller = 'admin' | 'owner' | 'other';
const caller: Record<Caller, { userId: string; roles: string[] }> = {
  admin: { userId: 'u-admin', roles: ADMIN },
  owner: { userId: OWNER, roles: USER },
  other: { userId: 'u-other', roles: USER },
};

/** Spec 063, decision 4: system entities are admin only; user entities are for the owner or an admin. */
const table: [Caller, EntitySource | undefined, boolean][] = [
  ['admin', 'system', true],
  ['admin', 'user', true],
  ['admin', undefined, true],
  ['owner', 'system', false],
  ['owner', 'user', true],
  ['owner', undefined, true],
  ['other', 'system', false],
  ['other', 'user', false],
  ['other', undefined, false],
];

const catchError = (fn: () => void): unknown => {
  try {
    fn();
  } catch (error) {
    return error;
  }
  return undefined;
};

describe('canChangeEntity', () => {
  it.each(table)('%s on a %s entity: %s', (who, entitySource, allowed) => {
    const { userId, roles } = caller[who];
    expect(canChangeEntity({ owner: OWNER, entitySource }, userId, roles)).toBe(allowed);
  });

  it('reads a null source as user', () => {
    expect(canChangeEntity({ owner: OWNER, entitySource: null }, OWNER, USER)).toBe(true);
  });

  it('does not match an entity without owner', () => {
    expect(canChangeEntity({ owner: null, entitySource: 'user' }, '', USER)).toBe(false);
  });
});

describe('assertCanChangeEntity', () => {
  it.each(table)('%s on a %s entity: allowed %s', (who, entitySource, allowed) => {
    const { userId, roles } = caller[who];
    for (const action of ['update', 'delete'] as const) {
      const error = catchError(() => assertCanChangeEntity({ owner: OWNER, entitySource }, userId, roles, action));
      if (allowed) {
        expect(error).toBeUndefined();
      } else {
        expect(error).toBeInstanceOf(ForbiddenError);
        expect((error as ForbiddenError).statusCode).toBe(403);
        expect((error as ForbiddenError).code).toBe(entitySource === 'system' ? SYSTEM_ENTITY_ADMIN_ONLY : 'forbidden');
      }
    }
  });
});

describe('checkEntitySource', () => {
  it.each([
    [ADMIN, 'system'],
    [ADMIN, 'user'],
    [ADMIN, undefined],
    [USER, 'user'],
    [USER, undefined],
    [[], undefined],
  ] as [string[], EntitySource | undefined][])('roles %j asking for %s pass', (roles, value) => {
    expect(() => checkEntitySource(value, roles)).not.toThrow();
  });

  it('rejects system without rmu-admin with system-entity-admin-only', () => {
    const error = catchError(() => checkEntitySource('system', USER));
    expect(error).toBeInstanceOf(ForbiddenError);
    expect((error as ForbiddenError).code).toBe(SYSTEM_ENTITY_ADMIN_ONLY);
  });
});
