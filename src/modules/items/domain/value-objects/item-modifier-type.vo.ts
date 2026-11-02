export const ITEM_MODIFIER_TYPES = ['bonus', 'item-damage', 'skill-bonus', 'material', 'slayer'] as const;

export type ItemModifierType = (typeof ITEM_MODIFIER_TYPES)[number];
