import { Inject, Injectable } from '@nestjs/common';
import { RMU_ADMIN } from '../../../shared/domain/entities/user-roles.js';
import type { AccessCaller, AccessLevel, RealmLevels } from '../../domain/services/realm-child-access.js';
import { type RealmPort, REALM_PORT } from '../ports/realm.port.js';

/** How long the realm levels of a user are kept (spec 073, decision 6): a removed share takes this long to count. */
export const REALM_ACCESS_TTL_MS = 30_000;

/** Above this many users, expired entries are dropped before adding one. */
const PRUNE_ABOVE = 1_000;

type Entry = { expiresAt: number; levels: Promise<RealmLevels> };

/**
 * The levels of a user on the realms, from core (`GET /realms/access?userId=`), kept in memory 30 seconds per user so a
 * list or a guard needs one call per user and not per item (spec 073, decisions 5 and 6). Admins never ask core. A
 * failure of core is the error of the request (502 or 504) and is not kept.
 */
@Injectable()
export class RealmAccessService {
  private readonly cache = new Map<string, Entry>();

  constructor(@Inject(REALM_PORT) private readonly realmPort: RealmPort) {}

  /** The levels of a user, from the cache unless `fresh` (create asks again, so a new share counts at once). */
  levels(userId: string, options: { fresh?: boolean } = {}): Promise<RealmLevels> {
    const now = Date.now();
    const cached = this.cache.get(userId);
    if (cached && !options.fresh && cached.expiresAt > now) return cached.levels;
    if (this.cache.size >= PRUNE_ABOVE) this.prune(now);
    const levels = this.fetch(userId);
    const entry: Entry = { expiresAt: now + REALM_ACCESS_TTL_MS, levels };
    this.cache.set(userId, entry);
    // A failed call is not kept: the next request asks again.
    levels.catch(() => {
      if (this.cache.get(userId) === entry) this.cache.delete(userId);
    });
    return levels;
  }

  /**
   * Who asks, with the realm levels when they are needed: `realms` is true for a list, or the realm id of the item
   * (null for the global catalog, which needs no call). An admin gets no levels and never asks core.
   */
  async caller(userId: string, roles: readonly string[], realms: boolean | string | null): Promise<AccessCaller> {
    if (roles.includes(RMU_ADMIN) || !realms) return { userId, roles, realmLevels: new Map() };
    return { userId, roles, realmLevels: await this.levels(userId) };
  }

  /** Forgets every cached user (tests). */
  clear(): void {
    this.cache.clear();
  }

  private async fetch(userId: string): Promise<RealmLevels> {
    const realms = await this.realmPort.fetchUserRealms(userId);
    return new Map<string, AccessLevel>(realms.filter(r => r.level !== 'none').map(r => [r.realmId, r.level]));
  }

  private prune(now: number): void {
    for (const [userId, entry] of this.cache) if (entry.expiresAt <= now) this.cache.delete(userId);
  }
}
