import type { RealmLevel, RealmPort } from '../../../src/modules/items/application/ports/realm.port.js';
import { REALM_ACCESS_TTL_MS, RealmAccessService } from '../../../src/modules/items/application/services/realm-access.service.js';

const setup = (answer: () => Promise<RealmLevel[]> = () => Promise.resolve([{ realmId: 'r1', level: 'write' }])) => {
  const fetchUserRealms = vi.fn<(userId: string) => Promise<RealmLevel[]>>(() => answer());
  const port = { fetchRealmById: vi.fn(), fetchUserRealms } as unknown as RealmPort;
  return { service: new RealmAccessService(port), fetchUserRealms };
};

describe('RealmAccessService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('maps the realms core answers, without the ones of level none', async () => {
    const { service } = setup(() =>
      Promise.resolve([
        { realmId: 'r1', level: 'read' },
        { realmId: 'r2', level: 'none' },
        { realmId: 'r3', level: 'manage' },
      ]),
    );
    expect([...(await service.levels('u1'))]).toEqual([
      ['r1', 'read'],
      ['r3', 'manage'],
    ]);
  });

  it('asks core once per user within 30 seconds, and again after them', async () => {
    const { service, fetchUserRealms } = setup();
    await service.levels('u1');
    await service.levels('u1');
    await service.levels('u2');
    expect(fetchUserRealms.mock.calls).toEqual([['u1'], ['u2']]);

    vi.advanceTimersByTime(REALM_ACCESS_TTL_MS - 1);
    await service.levels('u1');
    expect(fetchUserRealms).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(1);
    await service.levels('u1');
    expect(fetchUserRealms).toHaveBeenCalledTimes(3);
  });

  it('shares a call in flight between concurrent requests', async () => {
    const { service, fetchUserRealms } = setup();
    await Promise.all([service.levels('u1'), service.levels('u1')]);
    expect(fetchUserRealms).toHaveBeenCalledTimes(1);
  });

  it('asks again when fresh, and keeps the new answer', async () => {
    const { service, fetchUserRealms } = setup();
    await service.levels('u1');
    await service.levels('u1', { fresh: true });
    await service.levels('u1');
    expect(fetchUserRealms).toHaveBeenCalledTimes(2);
  });

  it('propagates a failure of core and does not keep it', async () => {
    let fail = true;
    const { service, fetchUserRealms } = setup(() =>
      fail ? Promise.reject(new Error('core down')) : Promise.resolve([{ realmId: 'r1', level: 'read' }]),
    );
    await expect(service.levels('u1')).rejects.toThrow('core down');
    fail = false;
    expect([...(await service.levels('u1'))]).toEqual([['r1', 'read']]);
    expect(fetchUserRealms).toHaveBeenCalledTimes(2);
  });

  it('never asks core for an admin, nor for an item of the global catalog', async () => {
    const { service, fetchUserRealms } = setup();
    expect((await service.caller('admin', ['rmu-admin'], true)).realmLevels.size).toBe(0);
    expect((await service.caller('admin', ['rmu-admin'], 'r1')).realmLevels.size).toBe(0);
    expect((await service.caller('u1', ['rmu-user'], null)).realmLevels.size).toBe(0);
    expect(fetchUserRealms).not.toHaveBeenCalled();
  });

  it('gives the levels to a user that lists or reads an item of a realm', async () => {
    const { service } = setup();
    expect(await service.caller('u1', ['rmu-user'], true)).toMatchObject({ userId: 'u1', roles: ['rmu-user'] });
    expect((await service.caller('u1', ['rmu-user'], 'r1')).realmLevels.get('r1')).toBe('write');
  });

  it('forgets every user on clear, and drops expired users when there are many', async () => {
    const { service, fetchUserRealms } = setup();
    await service.levels('u1');
    service.clear();
    await service.levels('u1');
    expect(fetchUserRealms).toHaveBeenCalledTimes(2);

    for (let i = 0; i < 1000; i++) await service.levels(`many-${i}`);
    vi.advanceTimersByTime(REALM_ACCESS_TTL_MS);
    await service.levels('late');
    const cache = (service as unknown as { cache: Map<string, unknown> }).cache;
    expect([...cache.keys()]).toEqual(['late']);
  });
});
