import type { AccessLevel } from '../../domain/services/realm-child-access.js';

export class Realm {
  id: string;
  name: string;
}

/** What core says a user can do with a realm (spec 071). */
export type RealmAccessLevel = AccessLevel;

/** A realm the user reads, with the level (spec 073). */
export type RealmLevel = { realmId: string; level: RealmAccessLevel };

export interface RealmPort {
  fetchRealmById(realmId: string): Promise<Realm | null>;
  /**
   * Every realm the user reads, with the level, as if they were not an admin (spec 073, `GET /realms/access?userId=`):
   * realms without access are missing. A failure of core is an error, never an empty list.
   */
  fetchUserRealms(userId: string): Promise<RealmLevel[]>;
}

export const REALM_PORT = Symbol('RealmPort');
