export const DEFAULT_TRADING_TABLES_ID = 'treasure-law';

export class GetTradingTablesQuery {
  constructor(
    public readonly userId: string,
    public readonly roles: string[],
    public readonly id: string = DEFAULT_TRADING_TABLES_ID,
  ) {}
}
