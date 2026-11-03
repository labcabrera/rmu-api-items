/** A system command: deletes every item of a deleted realm (spec 073, decision 9). */
export class DeleteItemsByRealmCommand {
  constructor(public readonly realmId: string) {}
}
