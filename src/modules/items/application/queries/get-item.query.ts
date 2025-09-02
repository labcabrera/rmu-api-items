export class GetItemQuery {
  constructor(
    public readonly itemId: string,
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}
