import type { ItemModifierType } from './item-modifier-type.vo.js';

export class ItemModifier {
  constructor(
    public readonly id: string,
    public readonly type: ItemModifierType,
    public readonly modifier: string | null,
    public readonly value: number | null,
  ) {}
}
