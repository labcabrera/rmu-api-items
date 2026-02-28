export class Realm {
  id: string;
  name: string;
}

export interface RealmPort {
  fetchRealmById(realmId: string): Promise<Realm | null>;
}
