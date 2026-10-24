import { ValidationError } from '../../../shared/domain/errors/errors.js';
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

/** What each modifier type needs: published by GET /v1/item-modifiers/options and checked when one is added. */
export const ITEM_MODIFIER_OPTIONS: readonly ItemModifierOption[] = [
  new ItemModifierOption('bonus', null, 'required', 'forbidden', 'forbidden'),
  new ItemModifierOption('item-damage', null, 'required', 'forbidden', 'forbidden'),
  new ItemModifierOption('skill-bonus', '@skill', 'required', 'required', 'optional'),
  new ItemModifierOption('material', '@enumeration:material-lore', 'forbidden', 'required', 'forbidden'),
  new ItemModifierOption('slayer', '@enumeration:animal-type|@creature', 'forbidden', 'required', 'forbidden'),
];

/** Rejects a modifier its option does not allow: an unknown type, or a value or a target it requires or forbids (F-items-11). */
export function checkItemModifier(type: string, modifier: string | null, value: number | null): void {
  const option = ITEM_MODIFIER_OPTIONS.find(o => o.modifierType === type);
  if (!option) throw new ValidationError(`Invalid modifier type ${type}`);
  checkField(type, 'value', option.value, value);
  checkField(type, 'modifier', option.modifier, modifier);
}

function checkField(type: string, field: string, rule: OptionType, value: unknown): void {
  const present = value !== null && value !== undefined && value !== '';
  if (rule === 'required' && !present) throw new ValidationError(`A ${type} modifier requires a ${field}`);
  if (rule === 'forbidden' && present) throw new ValidationError(`A ${type} modifier does not allow a ${field}`);
}
