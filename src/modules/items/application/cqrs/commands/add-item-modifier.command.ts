import { ItemModifierType } from 'src/modules/items/domain/value-objects/item-modifier-type.vo';

export class AddItemModifierCommand {
  constructor(
    public readonly itemId: string,
    public readonly type: ItemModifierType,
    public readonly modifier: string | undefined,
    public readonly value: number | undefined,
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}
