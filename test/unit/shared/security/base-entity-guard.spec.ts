import type { EntitySource } from '../../../../src/modules/shared/domain/entities/entity-source.js';
import type { RbacEntity } from '../../../../src/modules/shared/domain/entities/rbac-entity.js';
import { ForbiddenError } from '../../../../src/modules/shared/domain/errors/errors.js';
import { SYSTEM_ENTITY_ADMIN_ONLY } from '../../../../src/modules/shared/domain/services/entity-permissions.js';
import { BaseEntityGuard } from '../../../../src/modules/shared/infrastructure/security/base-entity-guard.js';
import type { Item } from '../../../../src/modules/items/domain/aggregates/item.aggregate.js';
import { ItemGuardAdapter } from '../../../../src/modules/items/infrastructure/security/item-guard.adapter.js';

class TestGuard extends BaseEntityGuard<RbacEntity> {}

const guard = new TestGuard();
const OWNER = 'u-owner';
const entity = (entitySource: EntitySource): RbacEntity => ({ owner: OWNER, accessType: 'public', entitySource });

type Caller = 'admin' | 'owner' | 'other';
const caller: Record<Caller, { userId: string; roles: string[] }> = {
  admin: { userId: 'u-admin', roles: ['rmu-admin'] },
  owner: { userId: OWNER, roles: ['rmu-user'] },
  other: { userId: 'u-other', roles: ['rmu-user'] },
};

/** null: allowed; otherwise the error code. */
const table: [Caller, EntitySource, string | null][] = [
  ['admin', 'system', null],
  ['admin', 'user', null],
  ['owner', 'system', SYSTEM_ENTITY_ADMIN_ONLY],
  ['owner', 'user', null],
  ['other', 'system', SYSTEM_ENTITY_ADMIN_ONLY],
  ['other', 'user', 'forbidden'],
];

const codeOf = (fn: () => void): string | null => {
  try {
    fn();
    return null;
  } catch (error) {
    expect(error).toBeInstanceOf(ForbiddenError);
    return (error as ForbiddenError).code;
  }
};

describe('BaseEntityGuard (spec 063)', () => {
  it.each(table)('checkUpdate and checkDelete: %s on a %s entity -> %s', (who, source, code) => {
    const { userId, roles } = caller[who];
    expect(codeOf(() => guard.checkUpdate(entity(source), userId, roles))).toBe(code);
    expect(codeOf(() => guard.checkDelete(entity(source), userId, roles))).toBe(code);
  });

  it('reads a missing source as user', () => {
    const legacy = { owner: OWNER, accessType: 'public' } as RbacEntity;
    expect(codeOf(() => guard.checkUpdate(legacy, OWNER, ['rmu-user']))).toBeNull();
    expect(codeOf(() => guard.checkDelete(legacy, 'u-other', ['rmu-user']))).toBe('forbidden');
  });

  it('checkEntitySource: system only for an admin', () => {
    expect(codeOf(() => guard.checkEntitySource(['rmu-admin'], 'system'))).toBeNull();
    expect(codeOf(() => guard.checkEntitySource(['rmu-user'], 'user'))).toBeNull();
    expect(codeOf(() => guard.checkEntitySource(['rmu-user'], undefined))).toBeNull();
    expect(codeOf(() => guard.checkEntitySource(['rmu-user'], 'system'))).toBe(SYSTEM_ENTITY_ADMIN_ONLY);
  });

  it('keeps checkRead and checkCreate', () => {
    expect(codeOf(() => guard.checkRead(entity('system'), 'u-other', ['rmu-user']))).toBeNull();
    expect(codeOf(() => guard.checkCreate(['rmu-user']))).toBeNull();
    expect(codeOf(() => guard.checkCreate([]))).toBe('forbidden');
  });

  it('the item guard inherits the rules and keeps the empty query predicate', () => {
    const itemGuard = new ItemGuardAdapter();
    expect(codeOf(() => itemGuard.checkUpdate(entity('system') as unknown as Item, OWNER, ['rmu-user']))).toBe(SYSTEM_ENTITY_ADMIN_ONLY);
    expect(codeOf(() => itemGuard.checkEntitySource(['rmu-user'], 'system'))).toBe(SYSTEM_ENTITY_ADMIN_ONLY);
    expect(itemGuard.buildQueryPredicate()).toEqual({ type: 'empty' });
  });
});
