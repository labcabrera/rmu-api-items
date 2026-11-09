export class GetTreasureTablesQuery {
  constructor(
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}
