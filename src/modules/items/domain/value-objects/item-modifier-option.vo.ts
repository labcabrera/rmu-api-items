import type { ItemModifierType } from './item-modifier-type.vo.js';

export type OptionType = 'required' | 'optional' | 'forbidden';

export class ItemModifierOption {
  constructor(
    public readonly modifierType: ItemModifierType,
    public readonly selectorType: string | null,
    public readonly value: OptionType,
    public readonly modifier: OptionType,
    public readonly specialization: OptionType,
  ) {}
}
