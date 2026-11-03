export class Realm {
  id: string;
  name: string;
}

/** What core says a user can do with a realm (spec 071). */
export type RealmAccessLevel = 'none' | 'read' | 'write' | 'manage';

export interface RealmPort {
  fetchRealmById(realmId: string): Promise<Realm | null>;
  /** The access of a user to a realm, as if they were not an admin; null when the realm does not exist. */
  fetchUserAccess(realmId: string, userId: string): Promise<RealmAccessLevel | null>;
}

export const REALM_PORT = Symbol('RealmPort');
