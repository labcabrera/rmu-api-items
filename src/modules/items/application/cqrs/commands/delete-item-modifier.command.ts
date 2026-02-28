export class DeleteItemModifierCommand {
  constructor(
    public readonly itemId: string,
    public readonly modifierId: string,
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}
