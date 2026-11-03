import type { Item } from '../../../src/modules/items/domain/aggregates/item.aggregate.js';
import type { AccessCaller, AccessLevel } from '../../../src/modules/items/domain/services/realm-child-access.js';
import { ItemGuardAdapter } from '../../../src/modules/items/infrastructure/security/item-guard.adapter.js';
import { DomainError } from '../../../src/modules/shared/domain/errors/errors.js';

const guard = new ItemGuardAdapter();
const item = (realmId: string | null, entitySource: 'user' | 'system' = 'user', owner = 'u-owner') =>
  ({ realmId, entitySource, owner }) as unknown as Item;
const caller = (userId: string, levels: Record<string, AccessLevel> = {}, roles = ['rmu-user']): AccessCaller => ({
  userId,
  roles,
  realmLevels: new Map(Object.entries(levels)),
});
const codeOf = (fn: () => unknown): string | null => {
  try {
    fn();
    return null;
  } catch (error) {
    return error instanceof DomainError ? error.code : 'not-a-domain-error';
  }
};

describe('ItemGuardAdapter (spec 073)', () => {
  it('needs rmu-user or rmu-admin to create, and admin for system', () => {
    expect(codeOf(() => guard.checkCreate(['rmu-user']))).toBeNull();
    expect(codeOf(() => guard.checkCreate(['rmu-admin']))).toBeNull();
    expect(codeOf(() => guard.checkCreate([]))).toBe('forbidden');
    expect(codeOf(() => guard.checkEntitySource(['rmu-user'], 'system'))).toBe('system-entity-admin-only');
    expect(codeOf(() => guard.checkEntitySource(['rmu-admin'], 'system'))).toBeNull();
  });

  describe('an item of a realm', () => {
    it.each<[AccessLevel | undefined, string | null, string | null]>([
      [undefined, 'forbidden', 'forbidden'],
      ['read', null, 'forbidden'],
      ['write', null, null],
      ['manage', null, null],
    ])('with realm level %s: read %s, change %s', (level, read, change) => {
      const user = caller('u-other', level ? { r1: level } : {});
      expect(codeOf(() => guard.checkRead(item('r1'), user))).toBe(read);
      expect(codeOf(() => guard.checkUpdate(item('r1'), user))).toBe(change);
      expect(codeOf(() => guard.checkDelete(item('r1'), user))).toBe(change);
    });

    it('gives nothing to its owner', () => {
      expect(codeOf(() => guard.checkRead(item('r1'), caller('u-owner')))).toBe('forbidden');
      expect(codeOf(() => guard.checkUpdate(item('r1'), caller('u-owner', { r1: 'read' })))).toBe('forbidden');
    });

    it('a system item is read with the realm and changed only by an admin', () => {
      expect(guard.checkRead(item('r1', 'system'), caller('u', { r1: 'manage' }))).toBe('read');
      expect(codeOf(() => guard.checkUpdate(item('r1', 'system'), caller('u', { r1: 'manage' })))).toBe('system-entity-admin-only');
      expect(codeOf(() => guard.checkDelete(item('r1', 'system'), caller('u')))).toBe('system-entity-admin-only');
      expect(codeOf(() => guard.checkDelete(item('r1', 'system'), caller('a', {}, ['rmu-admin'])))).toBeNull();
    });

    it('answers the access of the caller', () => {
      expect(guard.checkRead(item('r1'), caller('u', { r1: 'manage' }))).toBe('write');
      expect(guard.checkRead(item('r1'), caller('a', {}, ['rmu-admin']))).toBe('manage');
    });
  });

  describe('an item of the global catalog', () => {
    it('is read by everyone and changed by its owner or an admin', () => {
      expect(guard.checkRead(item(null), caller('u-other'))).toBe('read');
      expect(guard.checkRead(item(null), caller('u-owner'))).toBe('manage');
      expect(codeOf(() => guard.checkUpdate(item(null), caller('u-other')))).toBe('forbidden');
      expect(codeOf(() => guard.checkUpdate(item(null), caller('u-owner')))).toBeNull();
      expect(codeOf(() => guard.checkDelete(item(null), caller('a', {}, ['rmu-admin'])))).toBeNull();
    });

    it('a system one only by an admin', () => {
      expect(codeOf(() => guard.checkDelete(item(null, 'system'), caller('u-owner')))).toBe('system-entity-admin-only');
    });
  });

  describe('buildQueryPredicate', () => {
    it('does not filter for an admin', () => {
      expect(guard.buildQueryPredicate(caller('a', {}, ['rmu-admin']))).toEqual({ type: 'empty' });
    });

    it('lists the global catalog when the user reads no realm', () => {
      expect(guard.buildQueryPredicate(caller('u'))).toEqual({ type: 'eq', field: 'realmId', value: null });
    });

    it('adds the realms the user reads', () => {
      expect(guard.buildQueryPredicate(caller('u', { r1: 'read', r2: 'write', r3: 'none' }))).toEqual({
        type: 'anyOf',
        criteria: [
          { type: 'eq', field: 'realmId', value: null },
          { type: 'in', field: 'realmId', values: ['r1', 'r2'] },
        ],
      });
    });
  });
});
