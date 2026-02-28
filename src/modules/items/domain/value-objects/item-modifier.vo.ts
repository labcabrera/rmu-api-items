import { ItemModifierType } from './item-modifier-type.vo';

export class ItemModifier {
  constructor(
    public readonly type: ItemModifierType,
    public readonly modifier: string | undefined,
    public readonly value: number | undefined,
  ) {}
}
