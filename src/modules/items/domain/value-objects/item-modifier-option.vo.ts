import { ItemModifierType } from './item-modifier-type.vo';

export class ItemModifierOption {
  constructor(
    public readonly modifierType: ItemModifierType,
    public readonly selectorType: string | null,
    public readonly allowValue: boolean,
    public readonly allowModifier: boolean,
    public readonly allowSpecialization: boolean,
  ) {}
}
