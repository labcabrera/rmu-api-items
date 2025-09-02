export class DeleteItemCommand {
  constructor(
    public readonly id: string,
    public readonly reason: string | undefined,
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}
