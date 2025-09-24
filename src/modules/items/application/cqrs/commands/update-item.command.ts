import { ItemInfo } from 'src/modules/items/domain/value-objects/item-info.vo';

export class UpdateItemCommand {
  constructor(
    public readonly id: string,
    public readonly realm: string | undefined,
    public readonly info: ItemInfo | undefined,
    public readonly description: string | undefined,
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}
