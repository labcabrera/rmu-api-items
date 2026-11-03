import {
  atLeast,
  type AccessLevel,
  resolveGlobalItemAccess,
  resolveItemAccess,
  resolveRealmChildAccess,
} from '../../../src/modules/items/domain/services/realm-child-access.js';

const ADMIN = ['rmu-admin'];
const USER = ['rmu-user'];
const LEVELS: AccessLevel[] = ['none', 'read', 'write', 'manage'];

describe('resolveRealmChildAccess (spec 073, decision 1)', () => {
  // [realm level, user child, system child] for a non-admin
  const table: [AccessLevel, AccessLevel, AccessLevel][] = [
    ['none', 'none', 'none'],
    ['read', 'read', 'read'],
    ['write', 'write', 'read'],
    ['manage', 'write', 'read'],
  ];

  it.each(table)('realm %s: user child %s, system child %s', (realm, user, system) => {
    expect(resolveRealmChildAccess({ entitySource: 'user' }, realm, USER)).toBe(user);
    expect(resolveRealmChildAccess({ entitySource: 'system' }, realm, USER)).toBe(system);
  });

  it('reads a child without source as a user child', () => {
    expect(resolveRealmChildAccess({}, 'write', USER)).toBe('write');
    expect(resolveRealmChildAccess({ entitySource: null }, 'manage', USER)).toBe('write');
  });

  it.each(LEVELS)('an admin manages any child, whatever the realm level (%s)', realm => {
    expect(resolveRealmChildAccess({ entitySource: 'user' }, realm, ADMIN)).toBe('manage');
    expect(resolveRealmChildAccess({ entitySource: 'system' }, realm, ADMIN)).toBe('manage');
  });

  it('gives nothing to the owner of the child', () => {
    expect(resolveRealmChildAccess({ owner: 'u1', entitySource: 'user' }, 'none', USER)).toBe('none');
    expect(resolveRealmChildAccess({ owner: 'u1', entitySource: 'user' }, 'read', USER)).toBe('read');
  });
});

describe('resolveGlobalItemAccess (spec 073, decision 3)', () => {
  it('an admin manages everything', () => {
    expect(resolveGlobalItemAccess({ owner: 'u1', entitySource: 'system' }, 'admin', ADMIN)).toBe('manage');
    expect(resolveGlobalItemAccess({ owner: 'u1', entitySource: 'user' }, 'admin', ADMIN)).toBe('manage');
  });

  it('a system item is read only, also for its owner', () => {
    expect(resolveGlobalItemAccess({ owner: 'u1', entitySource: 'system' }, 'u1', USER)).toBe('read');
  });

  it('the owner manages a user item and everyone else reads it', () => {
    expect(resolveGlobalItemAccess({ owner: 'u1', entitySource: 'user' }, 'u1', USER)).toBe('manage');
    expect(resolveGlobalItemAccess({ owner: 'u1' }, 'u1', USER)).toBe('manage');
    expect(resolveGlobalItemAccess({ owner: 'u1', entitySource: 'user' }, 'u2', USER)).toBe('read');
    expect(resolveGlobalItemAccess({ owner: null }, 'u2', USER)).toBe('read');
  });
});

describe('resolveItemAccess', () => {
  const caller = { userId: 'u1', roles: USER, realmLevels: new Map<string, AccessLevel>([['r-write', 'write']]) };

  it('uses the realm of an item that has one, ignoring its owner', () => {
    expect(resolveItemAccess({ realmId: 'r-write', owner: 'u2' }, caller)).toBe('write');
    expect(resolveItemAccess({ realmId: 'r-other', owner: 'u1' }, caller)).toBe('none');
  });

  it('uses the global rules without realm', () => {
    expect(resolveItemAccess({ realmId: null, owner: 'u1' }, caller)).toBe('manage');
    expect(resolveItemAccess({ owner: 'u2' }, caller)).toBe('read');
  });
});

describe('atLeast', () => {
  it('orders none < read < write < manage', () => {
    expect(atLeast('write', 'read')).toBe(true);
    expect(atLeast('write', 'write')).toBe(true);
    expect(atLeast('read', 'write')).toBe(false);
    expect(atLeast('none', 'read')).toBe(false);
    expect(atLeast('manage', 'write')).toBe(true);
  });
});
